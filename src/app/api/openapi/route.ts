import { NextResponse } from 'next/server'

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'ExpenseFlow API',
    description: 'REST API for the ExpenseFlow expense management application. All endpoints require authentication via Supabase session cookie.',
    version: '1.0.0',
  },
  servers: [{ url: '/api', description: 'Current environment' }],
  tags: [
    { name: 'Wallets', description: 'Manage money accounts' },
    { name: 'Transactions', description: 'Income, expense, and transfer records' },
    { name: 'Categories', description: 'Transaction categories' },
    { name: 'Debts', description: 'Borrow and lend tracking' },
    { name: 'Debt Payments', description: 'Partial payments for debts' },
    { name: 'Profile', description: 'User profile and preferences' },
    { name: 'Export', description: 'Data export' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'sb-access-token',
        description: 'Supabase session cookie set automatically on login',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Error message' },
        },
      },
      Wallet: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Tiền mặt' },
          type: { type: 'string', enum: ['cash', 'bank', 'e-wallet'] },
          balance: { type: 'number', example: 500000 },
          color: { type: 'string', example: '#6366f1' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Transaction: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          wallet_id: { type: 'string', format: 'uuid' },
          to_wallet_id: { type: 'string', format: 'uuid', nullable: true },
          amount: { type: 'number', example: 150000 },
          type: { type: 'string', enum: ['income', 'expense', 'transfer'] },
          category_id: { type: 'string', format: 'uuid', nullable: true },
          note: { type: 'string', nullable: true },
          date: { type: 'string', format: 'date-time' },
          created_at: { type: 'string', format: 'date-time' },
          wallets: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              type: { type: 'string' },
              color: { type: 'string' },
            },
          },
          to_wallet: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              type: { type: 'string' },
              color: { type: 'string' },
            },
          },
          categories: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              icon: { type: 'string' },
              color: { type: 'string' },
              type: { type: 'string' },
            },
          },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid', nullable: true },
          name: { type: 'string', example: 'Ăn uống' },
          type: { type: 'string', enum: ['income', 'expense'] },
          icon: { type: 'string', example: 'utensils' },
          color: { type: 'string', example: '#f97316' },
          is_default: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Debt: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Nguyễn Văn A' },
          amount: { type: 'number', example: 1000000 },
          type: { type: 'string', enum: ['borrow', 'lend'] },
          status: { type: 'string', enum: ['unpaid', 'paid'] },
          note: { type: 'string', nullable: true },
          due_date: { type: 'string', format: 'date', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          paid_amount: { type: 'number', example: 200000, description: 'Sum of all payments' },
          remaining: { type: 'number', example: 800000, description: 'amount - paid_amount' },
        },
      },
      DebtPayment: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          debt_id: { type: 'string', format: 'uuid' },
          amount: { type: 'number', example: 200000 },
          note: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Profile: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          full_name: { type: 'string', nullable: true },
          email: { type: 'string', format: 'email' },
          avatar_url: { type: 'string', nullable: true },
          currency: { type: 'string', example: 'VND' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Unauthorized — missing or invalid session',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: { error: 'Unauthorized' },
          },
        },
      },
      NotFound: {
        description: 'Resource not found or not owned by the current user',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
    },
  },
  security: [{ cookieAuth: [] }],
  paths: {
    '/wallets': {
      get: {
        tags: ['Wallets'],
        summary: 'List wallets',
        description: 'Returns all wallets for the authenticated user, ordered by creation date.',
        responses: {
          '200': {
            description: 'List of wallets',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Wallet' } },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Wallets'],
        summary: 'Create wallet',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'type'],
                properties: {
                  name: { type: 'string', example: 'Tiền mặt' },
                  type: { type: 'string', enum: ['cash', 'bank', 'e-wallet'] },
                  balance: { type: 'number', default: 0, example: 500000 },
                  color: { type: 'string', default: '#6366f1', example: '#6366f1' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Wallet created',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Wallet' } } },
          },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/wallets/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      put: {
        tags: ['Wallets'],
        summary: 'Update wallet',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  type: { type: 'string', enum: ['cash', 'bank', 'e-wallet'] },
                  balance: { type: 'number' },
                  color: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Updated wallet', content: { 'application/json': { schema: { $ref: '#/components/schemas/Wallet' } } } },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Wallets'],
        summary: 'Delete wallet',
        responses: {
          '204': { description: 'Deleted successfully' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/transactions': {
      get: {
        tags: ['Transactions'],
        summary: 'List transactions',
        description: 'Returns transactions with joined wallet and category data.',
        parameters: [
          { name: 'month', in: 'query', schema: { type: 'string', example: '2024-01' }, description: 'Filter by month (YYYY-MM)' },
          { name: 'limit', in: 'query', schema: { type: 'integer', example: 50 }, description: 'Max number of results' },
        ],
        responses: {
          '200': {
            description: 'List of transactions',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Transaction' } } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Transactions'],
        summary: 'Create transaction',
        description: 'Creates a transaction and atomically updates wallet balances via PostgreSQL `create_transaction()` function.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['wallet_id', 'amount', 'type'],
                properties: {
                  wallet_id: { type: 'string', format: 'uuid' },
                  amount: { type: 'number', example: 150000 },
                  type: { type: 'string', enum: ['income', 'expense', 'transfer'] },
                  to_wallet_id: { type: 'string', format: 'uuid', description: 'Required when type=transfer' },
                  category_id: { type: 'string', format: 'uuid', nullable: true },
                  note: { type: 'string', nullable: true },
                  date: { type: 'string', format: 'date-time', description: 'Defaults to now' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Transaction created',
            content: { 'application/json': { schema: { type: 'object', properties: { id: { type: 'string', format: 'uuid' } } } } },
          },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/transactions/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      delete: {
        tags: ['Transactions'],
        summary: 'Delete transaction',
        description: 'Deletes a transaction and atomically reverses the wallet balance change via `delete_transaction()` function.',
        responses: {
          '204': { description: 'Deleted successfully' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'List categories',
        description: 'Returns system defaults and user-created categories. Default categories first, then alphabetically.',
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['income', 'expense'] }, description: 'Filter by type' },
        ],
        responses: {
          '200': {
            description: 'List of categories',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Category' } } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Categories'],
        summary: 'Create category',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'type'],
                properties: {
                  name: { type: 'string', example: 'Du lịch' },
                  type: { type: 'string', enum: ['income', 'expense'] },
                  icon: { type: 'string', default: 'tag', example: 'plane', description: 'Lucide icon name' },
                  color: { type: 'string', default: '#6366f1', example: '#0ea5e9' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Category created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/categories/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      put: {
        tags: ['Categories'],
        summary: 'Update category',
        description: 'Only user-created (non-default) categories can be edited.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  type: { type: 'string', enum: ['income', 'expense'] },
                  icon: { type: 'string' },
                  color: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Updated category', content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { description: 'Category not found or is a default category', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Delete category',
        description: 'Only user-created (non-default) categories can be deleted.',
        responses: {
          '204': { description: 'Deleted successfully' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/debts': {
      get: {
        tags: ['Debts'],
        summary: 'List debts',
        description: 'Returns debts enriched with `paid_amount` and `remaining` computed from payment records.',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['unpaid', 'paid'] } },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['borrow', 'lend'] } },
        ],
        responses: {
          '200': {
            description: 'List of debts',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Debt' } } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Debts'],
        summary: 'Create debt',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'amount', 'type'],
                properties: {
                  name: { type: 'string', example: 'Nguyễn Văn A' },
                  amount: { type: 'number', example: 1000000 },
                  type: { type: 'string', enum: ['borrow', 'lend'] },
                  note: { type: 'string', nullable: true },
                  due_date: { type: 'string', format: 'date', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Debt created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Debt' } } } },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/debts/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      put: {
        tags: ['Debts'],
        summary: 'Update debt',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  amount: { type: 'number' },
                  type: { type: 'string', enum: ['borrow', 'lend'] },
                  status: { type: 'string', enum: ['unpaid', 'paid'] },
                  note: { type: 'string', nullable: true },
                  due_date: { type: 'string', format: 'date', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Updated debt', content: { 'application/json': { schema: { $ref: '#/components/schemas/Debt' } } } },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Debts'],
        summary: 'Delete debt',
        responses: {
          '204': { description: 'Deleted successfully' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/debts/{id}/payments': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Debt ID' }],
      get: {
        tags: ['Debt Payments'],
        summary: 'List payments',
        description: 'Returns all payments for a debt, ordered by creation date (newest first).',
        responses: {
          '200': {
            description: 'List of payments',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/DebtPayment' } } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      post: {
        tags: ['Debt Payments'],
        summary: 'Record payment',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount'],
                properties: {
                  amount: { type: 'number', example: 200000 },
                  note: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Payment recorded', content: { 'application/json': { schema: { $ref: '#/components/schemas/DebtPayment' } } } },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '409': { description: 'Debt is already marked as paid', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      delete: {
        tags: ['Debt Payments'],
        summary: 'Delete payment',
        parameters: [
          { name: 'paymentId', in: 'query', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Payment ID to delete' },
        ],
        responses: {
          '204': { description: 'Deleted successfully' },
          '400': { description: 'paymentId query param is required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/profile': {
      get: {
        tags: ['Profile'],
        summary: 'Get profile',
        responses: {
          '200': { description: 'User profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/Profile' } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Profile'],
        summary: 'Update profile',
        description: 'At least one field must be provided.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  full_name: { type: 'string', nullable: true, example: 'Nguyễn Văn A' },
                  currency: { type: 'string', example: 'VND', description: 'ISO 4217 currency code' },
                  avatar_url: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Updated profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/Profile' } } } },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/export': {
      get: {
        tags: ['Export'],
        summary: 'Export transactions as CSV',
        description: 'Returns a CSV file attachment with all transactions in the given date range.',
        parameters: [
          { name: 'format', in: 'query', schema: { type: 'string', enum: ['csv'], default: 'csv' } },
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date', example: '2024-01-01' }, description: 'Start date (inclusive)' },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date', example: '2024-12-31' }, description: 'End date (inclusive)' },
        ],
        responses: {
          '200': {
            description: 'CSV file download',
            headers: {
              'Content-Disposition': { schema: { type: 'string', example: 'attachment; filename="transactions-2024-01-01.csv"' } },
            },
            content: { 'text/csv': { schema: { type: 'string' } } },
          },
          '400': { description: 'Unsupported format', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
  },
}

export async function GET() {
  return NextResponse.json(spec)
}
