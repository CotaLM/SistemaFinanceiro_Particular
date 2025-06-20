import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabaseService, Transaction, Budget, Investment, FinancialGoal } from '@/lib/supabaseService';
import { useAuth } from './useAuth';

// Interfaces locais para compatibilidade
export interface LocalTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface LocalBudget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: string;
}

export interface LocalInvestment {
  id: string;
  type: string;
  amount: number;
  date: string;
  return_rate: number;
  current_value: number;
}

export interface LocalFinancialGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: 'savings' | 'investment' | 'debt_payment' | 'emergency_fund' | 'other';
  description: string;
  created_date: string;
}

export const useFinanceData = () => {
  const [transactions, setTransactions] = useState<LocalTransaction[]>([]);
  const [budgets, setBudgets] = useState<LocalBudget[]>([]);
  const [investments, setInvestments] = useState<LocalInvestment[]>([]);
  const [goals, setGoals] = useState<LocalFinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load data from Supabase on mount and when user changes
  useEffect(() => {
    if (user) {
      loadAllData();
      setupRealtimeSubscriptions();
    } else {
      setTransactions([]);
      setBudgets([]);
      setInvestments([]);
      setGoals([]);
      setLoading(false);
    }
  }, [user]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [transactionsData, budgetsData, investmentsData, goalsData] = await Promise.all([
        supabaseService.getTransactions(),
        supabaseService.getBudgets(),
        supabaseService.getInvestments(),
        supabaseService.getFinancialGoals(),
      ]);

      // Convert Supabase data to local format
      setTransactions(transactionsData.map(t => ({
        id: t.id,
        type: t.type as 'income' | 'expense',
        amount: t.amount,
        category: t.category,
        description: t.description,
        date: t.date,
      })));

      setBudgets(budgetsData.map(b => ({
        id: b.id,
        category: b.category,
        limit: b.amount,
        spent: b.spent || 0,
        month: `${b.year}-${b.month.toString().padStart(2, '0')}`,
      })));

      setInvestments(investmentsData.map(i => ({
        id: i.id,
        type: i.type,
        amount: i.amount,
        date: i.date,
        return_rate: i.return_rate,
        current_value: i.current_value,
      })));

      setGoals(goalsData.map(g => ({
        id: g.id,
        title: g.title,
        target_amount: g.target_amount,
        current_amount: g.current_amount,
        target_date: g.target_date,
        category: g.category,
        description: g.description,
        created_date: g.created_at,
      })));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to real-time changes
    const transactionsSub = supabaseService.subscribeToTransactions((payload) => {
      if (payload.eventType === 'INSERT') {
        const newTransaction = payload.new as Transaction;
        setTransactions(prev => [{
          id: newTransaction.id,
          type: newTransaction.type as 'income' | 'expense',
          amount: newTransaction.amount,
          category: newTransaction.category,
          description: newTransaction.description,
          date: newTransaction.date,
        }, ...prev]);
      } else if (payload.eventType === 'DELETE') {
        setTransactions(prev => prev.filter(t => t.id !== payload.old.id));
      } else if (payload.eventType === 'UPDATE') {
        const updatedTransaction = payload.new as Transaction;
        setTransactions(prev => prev.map(t => 
          t.id === updatedTransaction.id ? {
            id: updatedTransaction.id,
            type: updatedTransaction.type as 'income' | 'expense',
            amount: updatedTransaction.amount,
            category: updatedTransaction.category,
            description: updatedTransaction.description,
            date: updatedTransaction.date,
          } : t
        ));
      }
    });

    const budgetsSub = supabaseService.subscribeToBudgets((payload) => {
      if (payload.eventType === 'INSERT') {
        const newBudget = payload.new as Budget;
        setBudgets(prev => [{
          id: newBudget.id,
          category: newBudget.category,
          limit: newBudget.amount,
          spent: newBudget.spent || 0,
          month: `${newBudget.year}-${newBudget.month.toString().padStart(2, '0')}`,
        }, ...prev]);
      } else if (payload.eventType === 'DELETE') {
        setBudgets(prev => prev.filter(b => b.id !== payload.old.id));
      } else if (payload.eventType === 'UPDATE') {
        const updatedBudget = payload.new as Budget;
        setBudgets(prev => prev.map(b => 
          b.id === updatedBudget.id ? {
            id: updatedBudget.id,
            category: updatedBudget.category,
            limit: updatedBudget.amount,
            spent: updatedBudget.spent || 0,
            month: `${updatedBudget.year}-${updatedBudget.month.toString().padStart(2, '0')}`,
          } : b
        ));
      }
    });

    const investmentsSub = supabaseService.subscribeToInvestments((payload) => {
      if (payload.eventType === 'INSERT') {
        const newInvestment = payload.new as Investment;
        setInvestments(prev => [{
          id: newInvestment.id,
          type: newInvestment.type,
          amount: newInvestment.amount,
          date: newInvestment.date,
          return_rate: newInvestment.return_rate,
          current_value: newInvestment.current_value,
        }, ...prev]);
      } else if (payload.eventType === 'DELETE') {
        setInvestments(prev => prev.filter(i => i.id !== payload.old.id));
      } else if (payload.eventType === 'UPDATE') {
        const updatedInvestment = payload.new as Investment;
        setInvestments(prev => prev.map(i => 
          i.id === updatedInvestment.id ? {
            id: updatedInvestment.id,
            type: updatedInvestment.type,
            amount: updatedInvestment.amount,
            date: updatedInvestment.date,
            return_rate: updatedInvestment.return_rate,
            current_value: updatedInvestment.current_value,
          } : i
        ));
      }
    });

    const goalsSub = supabaseService.subscribeToFinancialGoals((payload) => {
      if (payload.eventType === 'INSERT') {
        const newGoal = payload.new as FinancialGoal;
        setGoals(prev => [{
          id: newGoal.id,
          title: newGoal.title,
          target_amount: newGoal.target_amount,
          current_amount: newGoal.current_amount,
          target_date: newGoal.target_date,
          category: newGoal.category,
          description: newGoal.description,
          created_date: newGoal.created_at,
        }, ...prev]);
      } else if (payload.eventType === 'DELETE') {
        setGoals(prev => prev.filter(g => g.id !== payload.old.id));
      } else if (payload.eventType === 'UPDATE') {
        const updatedGoal = payload.new as FinancialGoal;
        setGoals(prev => prev.map(g => 
          g.id === updatedGoal.id ? {
            id: updatedGoal.id,
            title: updatedGoal.title,
            target_amount: updatedGoal.target_amount,
            current_amount: updatedGoal.current_amount,
            target_date: updatedGoal.target_date,
            category: updatedGoal.category,
            description: updatedGoal.description,
            created_date: updatedGoal.created_at,
          } : g
        ));
      }
    });

    // Cleanup subscriptions on unmount
    return () => {
      transactionsSub?.then(sub => sub?.unsubscribe());
      budgetsSub?.then(sub => sub?.unsubscribe());
      investmentsSub?.then(sub => sub?.unsubscribe());
      goalsSub?.then(sub => sub?.unsubscribe());
    };
  };

  // Calculate current balance
  const calculateBalance = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return totalIncome - totalExpenses;
  };

  const addTransaction = async (transaction: Omit<LocalTransaction, 'id'>) => {
    // Check if this is an expense that would exceed the current balance
    if (transaction.type === 'expense') {
      const currentBalance = calculateBalance();
      const newBalance = currentBalance - transaction.amount;
      
      if (newBalance < 0) {
        // Show warning notification
        toast.warning("⚠️ Saldo Insuficiente", {
          description: `Esta despesa de Kz ${transaction.amount.toLocaleString('pt-BR')} irá deixar seu saldo negativo em Kz ${Math.abs(newBalance).toLocaleString('pt-BR')}.`,
          duration: 8000,
          action: {
            label: "Continuar mesmo assim",
            onClick: async () => {
              // User confirmed, proceed with transaction
              await proceedWithTransaction(transaction);
            }
          },
          cancel: {
            label: "Cancelar",
            onClick: () => {
              // User cancelled, don't add transaction
              toast.info("Transação cancelada");
            }
          }
        });
        return; // Don't add transaction yet
      }
    }

    // If it's income or expense doesn't exceed balance, proceed normally
    await proceedWithTransaction(transaction);
  };

  const proceedWithTransaction = async (transaction: Omit<LocalTransaction, 'id'>) => {
    try {
      const result = await supabaseService.addTransaction({
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        date: transaction.date,
      });

      if (result) {
        // Update budget spent amount if it's an expense
        if (transaction.type === 'expense') {
          const month = new Date(transaction.date).toISOString().slice(0, 7);
          const existingBudget = budgets.find(b => 
            b.category === transaction.category && b.month === month
          );

          if (existingBudget) {
            await supabaseService.updateBudget(existingBudget.id, {
              spent: existingBudget.spent + transaction.amount
            });
          }
        }

        // Show success notification
        if (transaction.type === 'expense') {
          toast.success("Despesa registrada", {
            description: `Despesa de Kz ${transaction.amount.toLocaleString('pt-BR')} registrada com sucesso.`,
          });
        } else {
          toast.success("Receita registrada", {
            description: `Receita de Kz ${transaction.amount.toLocaleString('pt-BR')} registrada com sucesso.`,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      toast.error('Erro ao salvar transação');
    }
  };

  const addBudget = async (budget: Omit<LocalBudget, 'id' | 'spent'>) => {
    try {
      const [year, month] = budget.month.split('-').map(Number);
      const result = await supabaseService.addBudget({
        category: budget.category,
        amount: budget.limit,
        month: month,
        year: year,
      });

      if (result) {
        toast.success("Orçamento criado", {
          description: `Orçamento de Kz ${budget.limit.toLocaleString('pt-BR')} para ${budget.category} criado com sucesso.`,
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar orçamento:', error);
      toast.error('Erro ao salvar orçamento');
    }
  };

  const addInvestment = async (investment: Omit<LocalInvestment, 'id' | 'current_value'>) => {
    try {
      const result = await supabaseService.addInvestment({
        type: investment.type,
        amount: investment.amount,
        date: investment.date,
        return_rate: investment.return_rate,
      });

      if (result) {
        toast.success("Investimento registrado", {
          description: `Investimento de Kz ${investment.amount.toLocaleString('pt-BR')} registrado com sucesso.`,
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar investimento:', error);
      toast.error('Erro ao salvar investimento');
    }
  };

  const addGoal = async (goal: Omit<LocalFinancialGoal, 'id' | 'created_date'>) => {
    try {
      const result = await supabaseService.addFinancialGoal({
        title: goal.title,
        target_amount: goal.target_amount,
        target_date: goal.target_date,
        category: goal.category,
        description: goal.description,
      });

      if (result) {
        toast.success("Meta criada", {
          description: `Meta "${goal.title}" criada com sucesso.`,
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar meta:', error);
      toast.error('Erro ao salvar meta');
    }
  };

  const updateGoalProgress = async (goalId: string, amount: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        const newAmount = Math.min(goal.current_amount + amount, goal.target_amount);
        await supabaseService.updateFinancialGoal(goalId, {
          current_amount: newAmount
        });

        toast.success("Progresso atualizado", {
          description: `Progresso da meta "${goal.title}" atualizado.`,
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar progresso da meta:', error);
      toast.error('Erro ao atualizar progresso da meta');
    }
  };

  return {
    transactions,
    budgets,
    investments,
    goals,
    loading,
    addTransaction,
    addBudget,
    addInvestment,
    addGoal,
    updateGoalProgress,
    calculateBalance,
  };
};
