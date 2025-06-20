import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, DollarSign, Target, TrendingDown, CheckCircle } from 'lucide-react';
import { Transaction, Budget, FinancialGoal } from '@/hooks/useFinanceData';

interface FinancialAlertsProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals: FinancialGoal[];
}

const FinancialAlerts: React.FC<FinancialAlertsProps> = ({ transactions, budgets, goals }) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  // Calculate current balance
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpenses;

  // Budget alerts
  const budgetAlerts = budgets.filter(budget => 
    budget.month === currentMonth && budget.spent > budget.limit * 0.8
  );

  // Low balance alerts
  const lowBalanceAlerts = [];
  if (balance < 0) {
    lowBalanceAlerts.push({
      type: 'negative_balance',
      title: 'Saldo Negativo',
      description: `Seu saldo atual é de Kz ${balance.toLocaleString('pt-BR')}. Considere reduzir despesas ou adicionar receitas.`,
      severity: 'high'
    });
  } else if (balance < 1000) {
    lowBalanceAlerts.push({
      type: 'low_balance',
      title: 'Saldo Baixo',
      description: `Seu saldo atual é de Kz ${balance.toLocaleString('pt-BR')}. Recomendamos manter um saldo maior para emergências.`,
      severity: 'medium'
    });
  }

  // Goal alerts
  const goalAlerts = goals.filter(goal => {
    const daysUntilTarget = Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const progressPercentage = (goal.current_amount / goal.target_amount) * 100;
    
    return (daysUntilTarget <= 30 && progressPercentage < 80) || 
           (daysUntilTarget <= 7 && progressPercentage < 100);
  });

  const allAlerts = [
    ...lowBalanceAlerts,
    ...budgetAlerts.map(budget => ({
      type: 'budget_exceeded',
      title: `Orçamento Excedido: ${budget.category}`,
      description: `${((budget.spent / budget.limit) * 100).toFixed(1)}% do orçamento utilizado (Kz ${budget.spent.toLocaleString('pt-BR')} / Kz ${budget.limit.toLocaleString('pt-BR')})`,
      severity: budget.spent > budget.limit ? 'high' : 'medium'
    })),
    ...goalAlerts.map(goal => ({
      type: 'goal_reminder',
      title: `Meta em Risco: ${goal.title}`,
      description: `Meta de Kz ${goal.target_amount.toLocaleString('pt-BR')} com ${((goal.current_amount / goal.target_amount) * 100).toFixed(1)}% concluída. Data limite: ${new Date(goal.target_date).toLocaleDateString('pt-BR')}`,
      severity: 'medium'
    }))
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'negative_balance':
      case 'low_balance':
        return <DollarSign className="w-5 h-5" />;
      case 'budget_exceeded':
        return <TrendingDown className="w-5 h-5" />;
      case 'goal_reminder':
        return <Target className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">Alto</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500">Médio</Badge>;
      case 'low':
        return <Badge className="bg-blue-500">Baixo</Badge>;
      default:
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            Alertas Financeiros
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allAlerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Tudo em Ordem!</h3>
              <p className="text-gray-600">
                Não há alertas financeiros no momento. Continue mantendo suas finanças organizadas!
              </p>
      </div>
          ) : (
      <div className="space-y-4">
        {allAlerts.map((alert, index) => (
                <div
            key={index} 
                  className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getAlertIcon(alert.type)}
                      </div>
                <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{alert.title}</h4>
                          {getSeverityBadge(alert.severity)}
                        </div>
                        <p className="text-sm opacity-90">{alert.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800">Receitas Totais</h4>
              <p className="text-2xl font-bold text-green-600">
                Kz {totalIncome.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <h4 className="font-semibold text-red-800">Despesas Totais</h4>
              <p className="text-2xl font-bold text-red-600">
                Kz {totalExpenses.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className={`text-center p-4 rounded-lg ${
              balance < 0 
                ? 'bg-red-50' 
                : balance < 1000 
                ? 'bg-amber-50' 
                : 'bg-blue-50'
            }`}>
              <h4 className={`font-semibold ${
                balance < 0 
                  ? 'text-red-800' 
                  : balance < 1000 
                  ? 'text-amber-800' 
                  : 'text-blue-800'
              }`}>Saldo Atual</h4>
              <p className={`text-2xl font-bold ${
                balance < 0 
                  ? 'text-red-600' 
                  : balance < 1000 
                  ? 'text-amber-600' 
                  : 'text-blue-600'
              }`}>
                Kz {balance.toLocaleString('pt-BR')}
              </p>
                </div>
              </div>
            </CardContent>
          </Card>
    </div>
  );
};

export default FinancialAlerts;
