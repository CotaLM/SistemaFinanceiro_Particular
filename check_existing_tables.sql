-- Script para verificar o que já existe no banco de dados
-- Execute este script primeiro para ver o status atual

-- 1. Verificar tabelas existentes
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('transactions', 'budgets', 'investments', 'financial_goals', 'financial_alerts') 
        THEN '✅ Existe' 
        ELSE '❌ Não existe' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('transactions', 'budgets', 'investments', 'financial_goals', 'financial_alerts')
ORDER BY table_name;

-- 2. Verificar políticas RLS existentes
SELECT 
    tablename,
    policyname,
    CASE 
        WHEN cmd = 'r' THEN 'SELECT'
        WHEN cmd = 'a' THEN 'INSERT'
        WHEN cmd = 'w' THEN 'UPDATE'
        WHEN cmd = 'd' THEN 'DELETE'
        ELSE cmd::text
    END as operation,
    '✅ Existe' as status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('transactions', 'budgets', 'investments', 'financial_goals', 'financial_alerts')
ORDER BY tablename, policyname;

-- 3. Verificar triggers existentes
SELECT 
    trigger_name,
    event_object_table,
    event_manipulation,
    '✅ Existe' as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN ('transactions', 'budgets', 'investments', 'financial_goals', 'financial_alerts')
ORDER BY event_object_table, trigger_name;

-- 4. Verificar funções existentes
SELECT 
    routine_name,
    '✅ Existe' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('update_updated_at_column', 'check_low_balance', 'check_budget_exceeded')
ORDER BY routine_name;

-- 5. Verificar índices existentes
SELECT 
    indexname,
    tablename,
    '✅ Existe' as status
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('transactions', 'budgets', 'investments', 'financial_goals', 'financial_alerts')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 6. Resumo do que precisa ser criado
SELECT 
    'TABELAS' as tipo,
    'investments' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'investments')
        THEN '✅ Já existe'
        ELSE '❌ Precisa criar'
    END as status
UNION ALL
SELECT 
    'TABELAS' as tipo,
    'financial_goals' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'financial_goals')
        THEN '✅ Já existe'
        ELSE '❌ Precisa criar'
    END as status
UNION ALL
SELECT 
    'TABELAS' as tipo,
    'financial_alerts' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'financial_alerts')
        THEN '✅ Já existe'
        ELSE '❌ Precisa criar'
    END as status
ORDER BY tipo, item; 