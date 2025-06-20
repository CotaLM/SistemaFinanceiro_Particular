-- Script SQL para Wealth Insight App
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de orçamentos
CREATE TABLE IF NOT EXISTS budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL,
    limit_amount DECIMAL(10,2) NOT NULL,
    spent_amount DECIMAL(10,2) DEFAULT 0,
    month TEXT NOT NULL, -- formato: YYYY-MM
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de investimentos
CREATE TABLE IF NOT EXISTS investments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    return_rate DECIMAL(5,2) DEFAULT 0,
    current_value DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de metas financeiras
CREATE TABLE IF NOT EXISTS financial_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    target_date DATE NOT NULL,
    category TEXT CHECK (category IN ('savings', 'investment', 'debt_payment', 'emergency_fund', 'other')) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de alertas financeiros
CREATE TABLE IF NOT EXISTS financial_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('low_balance', 'budget_exceeded', 'goal_reminder', 'investment_alert')) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_alerts_user_id ON financial_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_alerts_is_read ON financial_alerts(is_read);

-- Habilitar RLS em todas as tabelas
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_alerts ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para transações
CREATE POLICY "Users can view their own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Criar políticas RLS para orçamentos
CREATE POLICY "Users can view their own budgets" ON budgets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets" ON budgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets" ON budgets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets" ON budgets
    FOR DELETE USING (auth.uid() = user_id);

-- Criar políticas RLS para investimentos
CREATE POLICY "Users can view their own investments" ON investments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investments" ON investments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments" ON investments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investments" ON investments
    FOR DELETE USING (auth.uid() = user_id);

-- Criar políticas RLS para metas financeiras
CREATE POLICY "Users can view their own financial goals" ON financial_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own financial goals" ON financial_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial goals" ON financial_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial goals" ON financial_goals
    FOR DELETE USING (auth.uid() = user_id);

-- Criar políticas RLS para alertas financeiros
CREATE POLICY "Users can view their own financial alerts" ON financial_alerts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own financial alerts" ON financial_alerts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial alerts" ON financial_alerts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial alerts" ON financial_alerts
    FOR DELETE USING (auth.uid() = user_id);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_goals_updated_at BEFORE UPDATE ON financial_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular o saldo atual do usuário
CREATE OR REPLACE FUNCTION get_user_balance(user_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_income DECIMAL := 0;
    total_expenses DECIMAL := 0;
BEGIN
    -- Calcular receitas totais
    SELECT COALESCE(SUM(amount), 0) INTO total_income
    FROM transactions
    WHERE user_id = user_uuid AND type = 'income';
    
    -- Calcular despesas totais
    SELECT COALESCE(SUM(amount), 0) INTO total_expenses
    FROM transactions
    WHERE user_id = user_uuid AND type = 'expense';
    
    RETURN total_income - total_expenses;
END;
$$ LANGUAGE plpgsql;

-- Função para criar alerta de saldo baixo
CREATE OR REPLACE FUNCTION create_low_balance_alert()
RETURNS TRIGGER AS $$
DECLARE
    current_balance DECIMAL;
BEGIN
    -- Só verificar se for uma despesa
    IF NEW.type = 'expense' THEN
        -- Calcular saldo atual
        current_balance := get_user_balance(NEW.user_id);
        
        -- Se o saldo ficar negativo após a transação
        IF (current_balance - NEW.amount) < 0 THEN
            INSERT INTO financial_alerts (user_id, type, title, message)
            VALUES (
                NEW.user_id,
                'low_balance',
                'Saldo Insuficiente',
                'A despesa de Kz ' || NEW.amount || ' irá deixar seu saldo negativo. Considere revisar suas finanças.'
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para alertas de saldo baixo
CREATE TRIGGER check_low_balance_trigger
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION create_low_balance_alert();

-- Função para atualizar o gasto do orçamento automaticamente
CREATE OR REPLACE FUNCTION update_budget_spent()
RETURNS TRIGGER AS $$
BEGIN
    -- Se for uma despesa, atualizar o orçamento correspondente
    IF NEW.type = 'expense' THEN
        UPDATE budgets 
        SET spent_amount = spent_amount + NEW.amount
        WHERE user_id = NEW.user_id 
        AND category = NEW.category 
        AND month = TO_CHAR(NEW.date, 'YYYY-MM');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar orçamentos
CREATE TRIGGER update_budget_spent_trigger
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_budget_spent();

-- Comentários sobre o uso:
-- 1. Execute este script no SQL Editor do Supabase
-- 2. O sistema de alertas funcionará automaticamente
-- 3. As políticas RLS garantem que cada usuário só veja seus próprios dados
-- 4. Os triggers atualizam automaticamente os orçamentos e criam alertas 