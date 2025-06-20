-- Script para criar políticas RLS
-- Execute este script APÓS criar as tabelas

-- Políticas para investimentos
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
        RAISE NOTICE 'Política "Users can view their own investments" criada';
    ELSE
        RAISE NOTICE 'Política "Users can view their own investments" já existe';
    END IF;

    -- Política para inserir investimentos próprios
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'investments' 
        AND policyname = 'Users can insert their own investments'
    ) THEN
        CREATE POLICY "Users can insert their own investments" ON public.investments
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE 'Política "Users can insert their own investments" criada';
    ELSE
        RAISE NOTICE 'Política "Users can insert their own investments" já existe';
    END IF;

    -- Política para atualizar investimentos próprios
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'investments' 
        AND policyname = 'Users can update their own investments'
    ) THEN
        CREATE POLICY "Users can update their own investments" ON public.investments
            FOR UPDATE USING (auth.uid() = user_id);
        RAISE NOTICE 'Política "Users can update their own investments" criada';
    ELSE
        RAISE NOTICE 'Política "Users can update their own investments" já existe';
    END IF;

    -- Política para deletar investimentos próprios
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'investments' 
        AND policyname = 'Users can delete their own investments'
    ) THEN
        CREATE POLICY "Users can delete their own investments" ON public.investments
            FOR DELETE USING (auth.uid() = user_id);
        RAISE NOTICE 'Política "Users can delete their own investments" criada';
    ELSE
        RAISE NOTICE 'Política "Users can delete their own investments" já existe';
    END IF;
END $$;

-- Políticas para metas financeiras
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
        RAISE NOTICE 'Política "Users can view their own financial goals" criada';
    ELSE
        RAISE NOTICE 'Política "Users can view their own financial goals" já existe';
    END IF;

    -- Política para inserir metas próprias
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'financial_goals' 
        AND policyname = 'Users can insert their own financial goals'
    ) THEN
        CREATE POLICY "Users can insert their own financial goals" ON public.financial_goals
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE 'Política "Users can insert their own financial goals" criada';
    ELSE
        RAISE NOTICE 'Política "Users can insert their own financial goals" já existe';
    END IF;

    -- Política para atualizar metas próprias
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'financial_goals' 
        AND policyname = 'Users can update their own financial goals'
    ) THEN
        CREATE POLICY "Users can update their own financial goals" ON public.financial_goals
            FOR UPDATE USING (auth.uid() = user_id);
        RAISE NOTICE 'Política "Users can update their own financial goals" criada';
    ELSE
        RAISE NOTICE 'Política "Users can update their own financial goals" já existe';
    END IF;

    -- Política para deletar metas próprias
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'financial_goals' 
        AND policyname = 'Users can delete their own financial goals'
    ) THEN
        CREATE POLICY "Users can delete their own financial goals" ON public.financial_goals
            FOR DELETE USING (auth.uid() = user_id);
        RAISE NOTICE 'Política "Users can delete their own financial goals" criada';
    ELSE
        RAISE NOTICE 'Política "Users can delete their own financial goals" já existe';
    END IF;
END $$;

-- Políticas para alertas financeiros
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
        RAISE NOTICE 'Política "Users can view their own financial alerts" criada';
    ELSE
        RAISE NOTICE 'Política "Users can view their own financial alerts" já existe';
    END IF;

    -- Política para inserir alertas próprios
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'financial_alerts' 
        AND policyname = 'Users can insert their own financial alerts'
    ) THEN
        CREATE POLICY "Users can insert their own financial alerts" ON public.financial_alerts
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE 'Política "Users can insert their own financial alerts" criada';
    ELSE
        RAISE NOTICE 'Política "Users can insert their own financial alerts" já existe';
    END IF;

    -- Política para atualizar alertas próprios
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'financial_alerts' 
        AND policyname = 'Users can update their own financial alerts'
    ) THEN
        CREATE POLICY "Users can update their own financial alerts" ON public.financial_alerts
            FOR UPDATE USING (auth.uid() = user_id);
        RAISE NOTICE 'Política "Users can update their own financial alerts" criada';
    ELSE
        RAISE NOTICE 'Política "Users can update their own financial alerts" já existe';
    END IF;

    -- Política para deletar alertas próprios
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'financial_alerts' 
        AND policyname = 'Users can delete their own financial alerts'
    ) THEN
        CREATE POLICY "Users can delete their own financial alerts" ON public.financial_alerts
            FOR DELETE USING (auth.uid() = user_id);
        RAISE NOTICE 'Política "Users can delete their own financial alerts" criada';
    ELSE
        RAISE NOTICE 'Política "Users can delete their own financial alerts" já existe';
    END IF;
END $$;

-- Mensagem de sucesso
SELECT 'Políticas RLS criadas com sucesso!' as status; 