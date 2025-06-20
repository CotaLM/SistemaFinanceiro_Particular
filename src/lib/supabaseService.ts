import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

export type Transaction = Tables<'transactions'>;
export type Budget = Tables<'budgets'>;
export type Profile = Tables<'profiles'>;

export interface Investment {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  date: string;
  return_rate: number;
  current_value: number;
  created_at: string;
  updated_at: string;
}

export interface FinancialGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: 'savings' | 'investment' | 'debt_payment' | 'emergency_fund' | 'other';
  description: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialAlert {
  id: string;
  user_id: string;
  type: 'low_balance' | 'budget_exceeded' | 'goal_reminder' | 'investment_alert';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

class SupabaseService {
  private async getUserId(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      return null;
    }
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    try {
      const userId = await this.getUserId();
      if (!userId) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      toast.error('Erro ao carregar transações');
      return [];
    }
  }

  async addTransaction(transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Transaction | null> {
    try {
      const userId = await this.getUserId();
      if (!userId) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transaction,
          user_id: userId,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      toast.error('Erro ao salvar transação');
      return null;
    }
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
    try {
      const userId = await this.getUserId();
      if (!userId) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      toast.error('Erro ao atualizar transação');
      return null;
    }
  }

  async deleteTransaction(id: string): Promise<boolean> {
    try {
      const userId = await this.getUserId();
      if (!userId) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      toast.error('Erro ao deletar transação');
      return false;
    }
  }

  // Budgets
  async getBudgets(): Promise<Budget[]> {
    try {
      const userId = await this.getUserId();
      if (!userId) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
      toast.error('Erro ao carregar orçamentos');
      return [];
    }
  }

  async addBudget(budget: Omit<Budget, 'id' | 'user_id' | 'spent' | 'created_at' | 'updated_at'>): Promise<Budget | null> {
    try {
      const userId = await this.getUserId();
      if (!userId) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('budgets')
        .insert([{
          ...budget,
          user_id: userId,
          spent: 0,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao adicionar orçamento:', error);
      toast.error('Erro ao salvar orçamento');
      return null;
    }
  }

  async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget | null> {
    try {
      const userId = await this.getUserId();
      if (!userId) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      toast.error('Erro ao atualizar orçamento');
      return null;
    }
  }

  async deleteBudget(id: string): Promise<boolean> {
    try {
      const userId = await this.getUserId();
      if (!userId) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar orçamento:', error);
      toast.error('Erro ao deletar orçamento');
      return false;
    }
  }

  // Investments - Using Supabase when table exists
  async getInvestments(): Promise<Investment[]> {
    try {
      const userId = await this.getUserId();
      if (!userId) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        // If table doesn't exist, fallback to localStorage
        console.warn('Investments table not found, using localStorage:', error);
        const existingInvestments = JSON.parse(localStorage.getItem('finance_investments') || '[]');
        return existingInvestments.filter((inv: Investment) => inv.user_id === userId);
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar investimentos:', error);
      toast.error('Erro ao carregar investimentos');
      return [];
    }
  }

  async addInvestment(investment: Omit<Investment, 'id' | 'user_id' | 'current_value' | 'created_at' | 'updated_at'>): Promise<Investment | null> {
    try {
      const userId = await this.getUserId();
      if (!userId) throw new Error('Usuário não autenticado');

      const currentValue = investment.amount * (1 + investment.return_rate / 100);

      const { data, error } = await supabase
        .from('investments')
        .insert([{
          ...investment,
          user_id: userId,
          current_value: currentValue,
        }])
        .select()
        .single();

      if (error) {
        // If table doesn't exist, fallback to localStorage
        console.warn('Investments table not found, using localStorage:', error);
        const newInvestment: Investment = {
          ...investment,
          id: Date.now().toString(),
          user_id: userId,
          current_value: currentValue,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const existingInvestments = JSON.parse(localStorage.getItem('finance_investments') || '[]');
        existingInvestments.push(newInvestment);
        localStorage.setItem('finance_investments', JSON.stringify(existingInvestments));

        return newInvestment;
      }

      return data;
    } catch (error) {
      console.error('Erro ao adicionar investimento:', error);
      toast.error('Erro ao salvar investimento');
      return null;
    }
  }

  async updateInvestment(id: string, updates: Partial<Investment>): Promise<Investment | null> {
    try {
      const userId = await this.getUserId();
      if (!userId) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('investments')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        // If table doesn't exist, fallback to localStorage
        console.warn('Investments table not found, using localStorage:', error);
        const existingInvestments = JSON.parse(localStorage.getItem('finance_investments') || '[]');
        const updatedInvestments = existingInvestments.map((inv: Investment) => 
          inv.id === id ? { ...inv, ...updates, updated_at: new Date().toISOString() } : inv
        );
        localStorage.setItem('finance_investments', JSON.stringify(updatedInvestments));

        return updatedInvestments.find((inv: Investment) => inv.id === id) || null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar investimento:', error);
      toast.error('Erro ao atualizar investimento');
      return null;
    }
  }

  async deleteInvestment(id: string): Promise<boolean> {
    try {
      const userId = await this.getUserId();
      if (!userId) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        // If table doesn't exist, fallback to localStorage
        console.warn('Investments table not found, using localStorage:', error);
        const existingInvestments = JSON.parse(localStorage.getItem('finance_investments') || '[]');
        const filteredInvestments = existingInvestments.filter((inv: Investment) => inv.id !== id);
        localStorage.setItem('finance_investments', JSON.stringify(filteredInvestments));
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar investimento:', error);
      toast.error('Erro ao deletar investimento');
      return false;
    }
  }

  // Financial Goals - Using Supabase when table exists
  async getFinancialGoals(): Promise<FinancialGoal[]> {
    try {
      const userId = await this.getUserId();
      if (!userId) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, fallback to localStorage
        console.warn('Financial goals table not found, using localStorage:', error);
        const existingGoals = JSON.parse(localStorage.getItem('finance_goals') || '[]');
        return existingGoals.filter((goal: FinancialGoal) => goal.user_id === userId);
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
      toast.error('Erro ao carregar metas');
      return [];
    }
  }

  async addFinancialGoal(goal: Omit<FinancialGoal, 'id' | 'user_id' | 'current_amount' | 'created_at' | 'updated_at'>): Promise<FinancialGoal | null> {
    try {
      const userId = await this.getUserId();
      if (!userId) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('financial_goals')
        .insert([{
          ...goal,
          user_id: userId,
          current_amount: 0,
        }])
        .select()
        .single();

      if (error) {
        // If table doesn't exist, fallback to localStorage
        console.warn('Financial goals table not found, using localStorage:', error);
        const newGoal: FinancialGoal = {
          ...goal,
          id: Date.now().toString(),
          user_id: userId,
          current_amount: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const existingGoals = JSON.parse(localStorage.getItem('finance_goals') || '[]');
        existingGoals.push(newGoal);
        localStorage.setItem('finance_goals', JSON.stringify(existingGoals));

        return newGoal;
      }

      return data;
    } catch (error) {
      console.error('Erro ao adicionar meta:', error);
      toast.error('Erro ao salvar meta');
      return null;
    }
  }

  async updateFinancialGoal(id: string, updates: Partial<FinancialGoal>): Promise<FinancialGoal | null> {
    try {
      const userId = await this.getUserId();
      if (!userId) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('financial_goals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        // If table doesn't exist, fallback to localStorage
        console.warn('Financial goals table not found, using localStorage:', error);
        const existingGoals = JSON.parse(localStorage.getItem('finance_goals') || '[]');
        const updatedGoals = existingGoals.map((goal: FinancialGoal) => 
          goal.id === id ? { ...goal, ...updates, updated_at: new Date().toISOString() } : goal
        );
        localStorage.setItem('finance_goals', JSON.stringify(updatedGoals));

        return updatedGoals.find((goal: FinancialGoal) => goal.id === id) || null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      toast.error('Erro ao atualizar meta');
      return null;
    }
  }

  async deleteFinancialGoal(id: string): Promise<boolean> {
    try {
      const userId = await this.getUserId();
      if (!userId) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        // If table doesn't exist, fallback to localStorage
        console.warn('Financial goals table not found, using localStorage:', error);
        const existingGoals = JSON.parse(localStorage.getItem('finance_goals') || '[]');
        const filteredGoals = existingGoals.filter((goal: FinancialGoal) => goal.id !== id);
        localStorage.setItem('finance_goals', JSON.stringify(filteredGoals));
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar meta:', error);
      toast.error('Erro ao deletar meta');
      return false;
    }
  }

  // Financial Alerts - Using Supabase when table exists
  async getFinancialAlerts(): Promise<FinancialAlert[]> {
    try {
      const userId = await this.getUserId();
      if (!userId) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('financial_alerts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, return empty array
        console.warn('Financial alerts table not found:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      return [];
    }
  }

  async markAlertAsRead(id: string): Promise<boolean> {
    try {
      const userId = await this.getUserId();
      if (!userId) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('financial_alerts')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.warn('Financial alerts table not found:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error);
      return false;
    }
  }

  async deleteAlert(id: string): Promise<boolean> {
    try {
      const userId = await this.getUserId();
      if (!userId) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('financial_alerts')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.warn('Financial alerts table not found:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar alerta:', error);
      return false;
    }
  }

  // Real-time subscriptions
  subscribeToTransactions(callback: (payload: any) => void) {
    return this.getUserId().then(userId => {
      if (!userId) return null;

      return supabase
        .channel('transactions')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        }, callback)
        .subscribe();
    });
  }

  subscribeToBudgets(callback: (payload: any) => void) {
    return this.getUserId().then(userId => {
      if (!userId) return null;

      return supabase
        .channel('budgets')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'budgets',
          filter: `user_id=eq.${userId}`,
        }, callback)
        .subscribe();
    });
  }

  // Note: These subscriptions won't work until the tables are created in Supabase
  subscribeToInvestments(callback: (payload: any) => void) {
    return this.getUserId().then(userId => {
      if (!userId) return null;

      // For now, return null since investments table doesn't exist
      // TODO: Create investments table in Supabase
      return null;
    });
  }

  subscribeToFinancialGoals(callback: (payload: any) => void) {
    return this.getUserId().then(userId => {
      if (!userId) return null;

      // For now, return null since financial_goals table doesn't exist
      // TODO: Create financial_goals table in Supabase
      return null;
    });
  }

  subscribeToFinancialAlerts(callback: (payload: any) => void) {
    return this.getUserId().then(userId => {
      if (!userId) return null;

      // For now, return null since financial_alerts table doesn't exist
      // TODO: Create financial_alerts table in Supabase
      return null;
    });
  }
}

export const supabaseService = new SupabaseService(); 