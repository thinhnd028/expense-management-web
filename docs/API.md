# API Documentation

Base URL: `/api`

All endpoints require authentication via Supabase session cookie. Unauthenticated requests return `401 Unauthorized`.

---

## Authentication

Authentication is handled via Supabase Auth. The session cookie is set automatically on login and refreshed by middleware on every request. All API routes call `supabase.auth.getUser()` server-side to verify the session.

**Error response (unauthenticated):**
```json
{ "error": "Unauthorized" }
```

---

## Wallets

### `GET /api/wallets`

List all wallets for the authenticated user, ordered by creation date.

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Tiền mặt",
    "type": "cash",
    "balance": 500000,
    "color": "#6366f1",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### `POST /api/wallets`

Create a new wallet.

**Request body:**
| Field     | Type     | Required | Description                          |
|-----------|----------|----------|--------------------------------------|
| `name`    | `string` | Yes      | Wallet name                          |
| `type`    | `string` | Yes      | `cash` \| `bank` \| `e-wallet`       |
| `balance` | `number` | No       | Initial balance (default: `0`)       |
| `color`   | `string` | No       | Hex color code (default: `#6366f1`)  |

**Response `201`:** Newly created wallet object.

**Errors:**
- `400` — Name is required
- `400` — Type must be cash, bank, or e-wallet

---

### `PUT /api/wallets/:id`

Update an existing wallet. All fields are optional.

**Request body:**
| Field     | Type     | Description                    |
|-----------|----------|--------------------------------|
| `name`    | `string` | New wallet name                |
| `type`    | `string` | `cash` \| `bank` \| `e-wallet` |
| `balance` | `number` | New balance                    |
| `color`   | `string` | Hex color code                 |

**Response `200`:** Updated wallet object.

**Errors:**
- `400` — Name cannot be empty
- `400` — Invalid type
- `404` — Wallet not found

---

### `DELETE /api/wallets/:id`

Delete a wallet.

**Response `204`:** No content.

---

## Transactions

### `GET /api/transactions`

List transactions for the authenticated user.

**Query parameters:**
| Param   | Type     | Description                              |
|---------|----------|------------------------------------------|
| `month` | `string` | Filter by month, format `YYYY-MM`        |
| `limit` | `number` | Limit number of results                  |

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "wallet_id": "uuid",
    "to_wallet_id": null,
    "amount": 150000,
    "type": "expense",
    "category_id": "uuid",
    "note": "Ăn trưa",
    "date": "2024-01-15T12:00:00Z",
    "created_at": "2024-01-15T12:00:00Z",
    "wallets": { "id": "uuid", "name": "Tiền mặt", "type": "cash", "color": "#6366f1" },
    "to_wallet": null,
    "categories": { "id": "uuid", "name": "Ăn uống", "icon": "utensils", "color": "#f97316", "type": "expense" }
  }
]
```

---

### `POST /api/transactions`

Create a new transaction. Uses the PostgreSQL `create_transaction()` function for atomic balance updates.

**Request body:**
| Field          | Type      | Required                    | Description                              |
|----------------|-----------|-----------------------------|------------------------------------------|
| `wallet_id`    | `string`  | Yes                         | Source wallet UUID                       |
| `amount`       | `number`  | Yes                         | Positive number                          |
| `type`         | `string`  | Yes                         | `income` \| `expense` \| `transfer`     |
| `to_wallet_id` | `string`  | Required if `type=transfer` | Destination wallet UUID                  |
| `category_id`  | `string`  | No                          | Category UUID                            |
| `note`         | `string`  | No                          | Optional note                            |
| `date`         | `string`  | No                          | ISO date string (default: now)           |

**Response `201`:**
```json
{ "id": "uuid" }
```

**Errors:**
- `400` — Missing required fields: wallet_id, amount, type
- `400` — Amount must be a positive number
- `400` — Type must be income, expense, or transfer
- `400` — to_wallet_id is required for transfers
- `400` — Cannot transfer to the same wallet

---

### `DELETE /api/transactions/:id`

Delete a transaction and atomically reverse the wallet balance change via `delete_transaction()`.

**Response `204`:** No content.

**Errors:**
- `404` — Transaction not found

---

## Categories

### `GET /api/categories`

List categories — both system defaults and user-created ones.

**Query parameters:**
| Param  | Type     | Description                   |
|--------|----------|-------------------------------|
| `type` | `string` | Filter by `income` \| `expense` |

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "user_id": null,
    "name": "Ăn uống",
    "type": "expense",
    "icon": "utensils",
    "color": "#f97316",
    "is_default": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

Results are ordered: default categories first, then alphabetically.

---

### `POST /api/categories`

Create a custom category.

**Request body:**
| Field   | Type     | Required | Description                       |
|---------|----------|----------|-----------------------------------|
| `name`  | `string` | Yes      | Category name                     |
| `type`  | `string` | Yes      | `income` \| `expense`             |
| `icon`  | `string` | No       | Lucide icon name (default: `tag`) |
| `color` | `string` | No       | Hex color code (default: `#6366f1`) |

**Response `201`:** Newly created category object.

**Errors:**
- `400` — Name is required
- `400` — Type must be income or expense

---

### `PUT /api/categories/:id`

Update a user-created category. Cannot edit system default categories.

**Request body:**
| Field   | Type     | Description           |
|---------|----------|-----------------------|
| `name`  | `string` | New category name     |
| `type`  | `string` | `income` \| `expense` |
| `icon`  | `string` | Lucide icon name      |
| `color` | `string` | Hex color code        |

**Response `200`:** Updated category object.

**Errors:**
- `400` — Name cannot be empty
- `400` — Invalid type
- `404` — Category not found or is a default category

---

### `DELETE /api/categories/:id`

Delete a user-created category. Cannot delete system default categories.

**Response `204`:** No content.

---

## Debts

### `GET /api/debts`

List debts with enriched `paid_amount` and `remaining` fields computed from payments.

**Query parameters:**
| Param    | Type     | Description                      |
|----------|----------|----------------------------------|
| `status` | `string` | Filter by `unpaid` \| `paid`     |
| `type`   | `string` | Filter by `borrow` \| `lend`     |

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Nguyễn Văn A",
    "amount": 1000000,
    "type": "lend",
    "status": "unpaid",
    "note": "Cho mượn tiền ăn",
    "due_date": "2024-03-01",
    "created_at": "2024-01-01T00:00:00Z",
    "debt_transactions": [...],
    "paid_amount": 200000,
    "remaining": 800000
  }
]
```

---

### `POST /api/debts`

Create a new debt record.

**Request body:**
| Field      | Type     | Required | Description                  |
|------------|----------|----------|------------------------------|
| `name`     | `string` | Yes      | Debtor/creditor name         |
| `amount`   | `number` | Yes      | Total debt amount (positive) |
| `type`     | `string` | Yes      | `borrow` \| `lend`           |
| `note`     | `string` | No       | Optional note                |
| `due_date` | `string` | No       | ISO date string              |

**Response `201`:** Newly created debt object (without enriched fields).

**Errors:**
- `400` — Name is required
- `400` — Amount must be a positive number
- `400` — Type must be borrow or lend

---

### `PUT /api/debts/:id`

Update an existing debt. All fields are optional.

**Request body:**
| Field      | Type     | Description                  |
|------------|----------|------------------------------|
| `name`     | `string` | Debtor/creditor name         |
| `amount`   | `number` | Total debt amount            |
| `type`     | `string` | `borrow` \| `lend`           |
| `status`   | `string` | `unpaid` \| `paid`           |
| `note`     | `string` | Note (pass `null` to clear)  |
| `due_date` | `string` | ISO date (pass `null` to clear) |

**Response `200`:** Updated debt object.

**Errors:**
- `400` — Name cannot be empty
- `400` — Invalid amount/type/status
- `404` — Debt not found

---

### `DELETE /api/debts/:id`

Delete a debt and all its associated payments.

**Response `204`:** No content.

---

## Debt Payments

### `GET /api/debts/:id/payments`

List all payments for a debt, ordered by creation date (newest first).

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "debt_id": "uuid",
    "amount": 200000,
    "note": "Trả lần 1",
    "created_at": "2024-02-01T00:00:00Z"
  }
]
```

**Errors:**
- `404` — Debt not found

---

### `POST /api/debts/:id/payments`

Record a partial payment for a debt.

**Request body:**
| Field    | Type     | Required | Description                    |
|----------|----------|----------|--------------------------------|
| `amount` | `number` | Yes      | Payment amount (positive)      |
| `note`   | `string` | No       | Optional note                  |

**Response `201`:** Newly created payment object.

**Errors:**
- `400` — Amount must be a positive number
- `404` — Debt not found
- `409` — Debt is already marked as paid

---

### `DELETE /api/debts/:id/payments?paymentId=<uuid>`

Delete a specific payment record.

**Query parameters:**
| Param       | Type     | Required | Description      |
|-------------|----------|----------|------------------|
| `paymentId` | `string` | Yes      | Payment UUID     |

**Response `204`:** No content.

**Errors:**
- `400` — paymentId query param is required
- `404` — Debt not found

---

## Profile

### `GET /api/profile`

Get the authenticated user's profile.

**Response `200`:**
```json
{
  "id": "uuid",
  "full_name": "Nguyễn Văn A",
  "email": "user@example.com",
  "avatar_url": null,
  "currency": "VND",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**
- `404` — Profile not found

---

### `PUT /api/profile`

Update the user's profile. At least one field must be provided.

**Request body:**
| Field        | Type     | Description                                  |
|--------------|----------|----------------------------------------------|
| `full_name`  | `string` | Display name (pass `null` or `""` to clear)  |
| `currency`   | `string` | ISO 4217 currency code, e.g. `VND`, `USD`   |
| `avatar_url` | `string` | Avatar URL (pass `null` to clear)            |

**Response `200`:** Updated profile object (without `email`).

**Errors:**
- `400` — No fields to update
- `400` — Currency must be a non-empty string

---

## Export

### `GET /api/export`

Export transactions as a CSV file. Returns a file download.

**Query parameters:**
| Param    | Type     | Required | Description                      |
|----------|----------|----------|----------------------------------|
| `format` | `string` | No       | Export format — only `csv` supported (default: `csv`) |
| `from`   | `string` | No       | Start date (ISO date string)     |
| `to`     | `string` | No       | End date (ISO date string)       |

**Response `200`:**
- Content-Type: `text/csv; charset=utf-8`
- Content-Disposition: `attachment; filename="transactions-YYYY-MM-DD.csv"`

**CSV columns:** `Date`, `Type`, `Amount`, `Wallet`, `To Wallet`, `Category`, `Note`

Dates are formatted as `DD/MM/YYYY` (Vietnamese locale).

**Errors:**
- `400` — Only csv format is supported

---

## Error Format

All error responses use a consistent JSON format:

```json
{ "error": "Error message describing what went wrong" }
```

| Status | Meaning                                                |
|--------|--------------------------------------------------------|
| `400`  | Bad request — invalid or missing input                 |
| `401`  | Unauthorized — missing or invalid session              |
| `404`  | Not found — resource doesn't exist or not owned by user |
| `409`  | Conflict — action not allowed given current state      |
| `500`  | Internal server error — database or unexpected error   |
