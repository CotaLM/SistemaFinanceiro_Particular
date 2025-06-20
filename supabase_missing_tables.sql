-- Script para criar tabelas que estão faltando no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela de investimentos
CREATE TABLE IF NOT EXISTS public.investments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    date DATE NOT NULL,
    return_rate DECIMAL(5,2) NOT NULL,
    current_value DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de metas financeiras
CREATE TABLE IF NOT EXISTS public.financial_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0,
    target_date DATE NOT NULL,
    category TEXT CHECK (category IN ('savings', 'investment', 'debt_payment', 'emergency_fund', 'other')) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de alertas financeiros
CREATE TABLE IF NOT EXISTS public.financial_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('low_balance', 'budget_exceeded', 'goal_reminder', 'investment_alert')) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Habilitar RLS nas novas tabelas
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_alerts ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS para investimentos
CREATE POLICY "Users can view their own investments" ON public.investments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investments" ON public.investments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments" ON public.investments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investments" ON public.investments
    FOR DELETE USING (auth.uid() = user_id);

-- 6. Criar políticas RLS para metas financeiras
CREATE POLICY "Users can view their own financial goals" ON public.financial_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own financial goals" ON public.financial_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial goals" ON public.financial_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial goals" ON public.financial_goals
    FOR DELETE USING (auth.uid() = user_id);

-- 7. Criar políticas RLS para alertas financeiros
CREATE POLICY "Users can view their own financial alerts" ON public.financial_alerts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own financial alerts" ON public.financial_alerts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial alerts" ON public.financial_alerts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial alerts" ON public.financial_alerts
    FOR DELETE USING (auth.uid() = user_id);

-- 8. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Criar triggers para atualizar updated_at
CREATE TRIGGER update_investments_updated_at 
    BEFORE UPDATE ON public.investments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_goals_updated_at 
    BEFORE UPDATE ON public.financial_goals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Criar função para gerar alertas de saldo baixo
CREATE OR REPLACE FUNCTION check_low_balance()
RETURNS TRIGGER AS $$
DECLARE
    current_balance DECIMAL(15,2);
BEGIN
    -- Calcular saldo atual
    SELECT COALESCE(SUM(
        CASE 
            WHEN type = 'income' THEN amount 
            ELSE -amount 
        END
    ), 0) INTO current_balance
    FROM public.transactions 
    WHERE user_id = NEW.user_id;
    
    -- Se o saldo ficar negativo após a transação, criar alerta
    IF current_balance < 0 THEN
        INSERT INTO public.financial_alerts (user_id, type, title, message)
        VALUES (
            NEW.user_id,
            'low_balance',
            'Saldo Negativo',
            'Seu saldo ficou negativo após esta transação. Saldo atual: Kz ' || current_balance
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Criar trigger para verificar saldo baixo
CREATE TRIGGER check_low_balance_trigger
    AFTER INSERT ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION check_low_balance();

-- 12. Criar função para verificar orçamentos excedidos
CREATE OR REPLACE FUNCTION check_budget_exceeded()
RETURNS TRIGGER AS $$
DECLARE
    budget_limit DECIMAL(15,2);
    budget_spent DECIMAL(15,2);
BEGIN
    -- Buscar o orçamento para a categoria e mês
    SELECT amount, COALESCE(spent, 0) INTO budget_limit, budget_spent
    FROM public.budgets 
    WHERE user_id = NEW.user_id 
    AND category = NEW.category 
    AND year = EXTRACT(YEAR FROM NEW.date::date)
    AND month = EXTRACT(MONTH FROM NEW.date::date);
    
    -- Se existe orçamento e foi excedido, criar alerta
    IF budget_limit IS NOT NULL AND (budget_spent + NEW.amount) > budget_limit THEN
        INSERT INTO public.financial_alerts (user_id, type, title, message)
        VALUES (
            NEW.user_id,
            'budget_exceeded',
            'Orçamento Excedido',
            'O orçamento para ' || NEW.category || ' foi excedido. Limite: Kz ' || budget_limit || ', Gasto: Kz ' || (budget_spent + NEW.amount)
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 13. Criar trigger para verificar orçamentos excedidos
CREATE TRIGGER check_budget_exceeded_trigger
    AFTER INSERT ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION check_budget_exceeded();

-- 14. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON public.investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_date ON public.investments(date);
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON public.financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_target_date ON public.financial_goals(target_date);
CREATE INDEX IF NOT EXISTS idx_financial_alerts_user_id ON public.financial_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_alerts_created_at ON public.financial_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_financial_alerts_is_read ON public.financial_alerts(is_read);

-- 15. Comentários para documentação
COMMENT ON TABLE public.investments IS 'Tabela para armazenar investimentos dos usuários';
COMMENT ON TABLE public.financial_goals IS 'Tabela para armazenar metas financeiras dos usuários';
COMMENT ON TABLE public.financial_alerts IS 'Tabela para armazenar alertas financeiros dos usuários';

COMMENT ON COLUMN public.investments.type IS 'Tipo do investimento (ex: ações, fundos, poupança)';
COMMENT ON COLUMN public.investments.return_rate IS 'Taxa de retorno em porcentagem';
COMMENT ON COLUMN public.investments.current_value IS 'Valor atual do investimento';

COMMENT ON COLUMN public.financial_goals.category IS 'Categoria da meta (savings, investment, debt_payment, emergency_fund, other)';
COMMENT ON COLUMN public.financial_goals.current_amount IS 'Valor atual acumulado para a meta';

COMMENT ON COLUMN public.financial_alerts.type IS 'Tipo do alerta (low_balance, budget_exceeded, goal_reminder, investment_alert)';
COMMENT ON COLUMN public.financial_alerts.is_read IS 'Indica se o alerta foi lido pelo usuário'; 