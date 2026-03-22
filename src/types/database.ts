export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          currency: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          currency?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          currency?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'cash' | 'bank' | 'e-wallet'
          balance: number
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'cash' | 'bank' | 'e-wallet'
          balance?: number
          color?: string
          created_at?: string
        }
        Update: {
          name?: string
          type?: 'cash' | 'bank' | 'e-wallet'
          balance?: number
          color?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          user_id: string | null
          name: string
          type: 'income' | 'expense'
          icon: string
          color: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          type: 'income' | 'expense'
          icon?: string
          color?: string
          is_default?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          type?: 'income' | 'expense'
          icon?: string
          color?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          wallet_id: string
          to_wallet_id: string | null
          amount: number
          type: 'income' | 'expense' | 'transfer'
          category_id: string | null
          note: string | null
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          wallet_id: string
          to_wallet_id?: string | null
          amount: number
          type: 'income' | 'expense' | 'transfer'
          category_id?: string | null
          note?: string | null
          date?: string
          created_at?: string
        }
        Update: {
          amount?: number
          type?: 'income' | 'expense' | 'transfer'
          category_id?: string | null
          note?: string | null
          date?: string
        }
        Relationships: []
      }
      debts: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          type: 'borrow' | 'lend'
          status: 'unpaid' | 'paid'
          note: string | null
          due_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          type: 'borrow' | 'lend'
          status?: 'unpaid' | 'paid'
          note?: string | null
          due_date?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          amount?: number
          type?: 'borrow' | 'lend'
          status?: 'unpaid' | 'paid'
          note?: string | null
          due_date?: string | null
        }
        Relationships: []
      }
      debt_transactions: {
        Row: {
          id: string
          debt_id: string
          amount: number
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          debt_id: string
          amount: number
          note?: string | null
          created_at?: string
        }
        Update: {
          amount?: number
          note?: string | null
        }
        Relationships: []
      }
      sepay_integrations: {
        Row: { id: string; user_id: string; api_token: string; webhook_apikey: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; api_token: string; webhook_apikey?: string | null }
        Update: { api_token?: string; webhook_apikey?: string | null; updated_at?: string }
        Relationships: []
      }
      sepay_bank_accounts: {
        Row: {
          id: string; user_id: string; sepay_account_id: number
          bank_short_name: string; bank_full_name: string
          account_number: string; account_holder_name: string | null
          wallet_id: string | null; since_id: number; last_synced_at: string | null; created_at: string
        }
        Insert: {
          id?: string; user_id: string; sepay_account_id: number
          bank_short_name: string; bank_full_name: string
          account_number: string; account_holder_name?: string | null
          wallet_id?: string | null; since_id?: number
        }
        Update: {
          wallet_id?: string | null; since_id?: number; last_synced_at?: string | null
        }
        Relationships: []
      }
      momo_integrations: {
        Row: {
          id: string
          user_id: string
          partner_code: string
          access_key: string
          secret_key: string
          phone: string
          wallet_id: string | null
          is_test: boolean
          last_synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          partner_code: string
          access_key: string
          secret_key: string
          phone: string
          wallet_id?: string | null
          is_test?: boolean
        }
        Update: {
          partner_code?: string
          access_key?: string
          secret_key?: string
          phone?: string
          wallet_id?: string | null
          is_test?: boolean
          last_synced_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      shopee_integrations: {
        Row: {
          id: string
          user_id: string
          partner_id: string
          partner_key: string
          shop_id: number | null
          shop_name: string | null
          shop_logo: string | null
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string | null
          is_sandbox: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          partner_id: string
          partner_key: string
          shop_id?: number | null
          shop_name?: string | null
          shop_logo?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          is_sandbox?: boolean
        }
        Update: {
          partner_id?: string
          partner_key?: string
          shop_id?: number | null
          shop_name?: string | null
          shop_logo?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          is_sandbox?: boolean
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      create_transaction: {
        Args: {
          p_user_id: string
          p_wallet_id: string
          p_to_wallet_id: string | null
          p_amount: number
          p_type: string
          p_category_id: string | null
          p_note: string | null
          p_date: string
        }
        Returns: string
      }
      delete_transaction: {
        Args: { p_transaction_id: string }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Wallet = Database['public']['Tables']['wallets']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type Debt = Database['public']['Tables']['debts']['Row']
export type DebtTransaction = Database['public']['Tables']['debt_transactions']['Row']

export type WalletType = 'cash' | 'bank' | 'e-wallet'
export type TransactionType = 'income' | 'expense' | 'transfer'
export type DebtType = 'borrow' | 'lend'
export type DebtStatus = 'unpaid' | 'paid'

export interface TransactionWithDetails extends Transaction {
  wallets?: Wallet | null
  to_wallet?: Wallet | null
  categories?: Category | null
}

export interface DebtWithTransactions extends Debt {
  debt_transactions?: DebtTransaction[]
  paid_amount?: number
  remaining?: number
}
