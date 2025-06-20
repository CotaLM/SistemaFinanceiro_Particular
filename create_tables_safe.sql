-- Script seguro para criar tabelas e políticas
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela de investimentos (se não existir)
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

-- 2. Criar tabela de metas financeiras (se não existir)
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

-- 3. Criar tabela de alertas financeiros (se não existir)
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

-- 5. Criar políticas RLS para investimentos (apenas se não existirem)
DO $$
BEGIN
    -- Política para visualizar investimentos próprios
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'investments' 
        AND policyname = 'Users can view their own investments'
    ) THEN
        CREATE POLICY "Users can view their own investments" ON public.investments
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Política para inserir investimentos próprios
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'investments' 
        AND policyname = 'Users can insert their own investments'
    ) THEN
        CREATE POLICY "Users can insert their own investments" ON public.investments
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Política para atualizar investimentos próprios
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'investments' 
        AND policyname = 'Users can update their own investments'
    ) THEN
        CREATE POLICY "Users can update their own investments" ON public.investments
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- Política para deletar investimentos próprios
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'investments' 
        AND policyname = 'Users can delete their own investments'
    ) THEN
        CREATE POLICY "Users can delete their own investments" ON public.investments
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 6. Criar políticas RLS para metas financeiras (apenas se não existirem)
DO $$
BEGIN
    -- Política para visualizar metas próprias
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'financial_goals' 
        AND policyname = 'Users can view their own financial goals'
    ) THEN
        CREATE POLICY "Users can view their own financial goals" ON public.financial_goals
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Política para inserir metas próprias
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'financial_goals' 
        AND policyname = 'Users can insert their own financial goals'
    ) THEN
        CREATE POLICY "Users can insert their own financial goals" ON public.financial_goals
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Política para atualizar metas próprias
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'financial_goals' 
        AND policyname = 'Users can update their own financial goals'
    ) THEN
        CREATE POLICY "Users can update their own financial goals" ON public.financial_goals
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- Política para deletar metas próprias
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'financial_goals' 
        AND policyname = 'Users can delete their own financial goals'
    ) THEN
        CREATE POLICY "Users can delete their own financial goals" ON public.financial_goals
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 7. Criar políticas RLS para alertas financeiros (apenas se não existirem)
DO $$
BEGIN
    -- Política para visualizar alertas próprios
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'financial_alerts' 
        AND policyname = 'Users can view their own financial alerts'
    ) THEN
        CREATE POLICY "Users can view their own financial alerts" ON public.financial_alerts
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Política para inserir alertas próprios
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'financial_alerts' 
        AND policyname = 'Users can insert their own financial alerts'
    ) THEN
        CREATE POLICY "Users can insert their own financial alerts" ON public.financial_alerts
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Política para atualizar alertas próprios
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'financial_alerts' 
        AND policyname = 'Users can update their own financial alerts'
    ) THEN
        CREATE POLICY "Users can update their own financial alerts" ON public.financial_alerts
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- Política para deletar alertas próprios
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'financial_alerts' 
        AND policyname = 'Users can delete their own financial alerts'
    ) THEN
        CREATE POLICY "Users can delete their own financial alerts" ON public.financial_alerts
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 8. Criar índices básicos
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON public.investments(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON public.financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_alerts_user_id ON public.financial_alerts(user_id);

-- 9. Mensagem de sucesso
SELECT 'Tabelas e políticas criadas com sucesso! Agora você pode usar investimentos, metas e alertas.' as status; 