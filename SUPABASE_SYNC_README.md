# Sincronização Completa com Supabase

Este documento explica como implementar a sincronização completa dos dados financeiros com o Supabase para que os dados sejam salvos no banco de dados e sincronizados entre dispositivos.

## Status Atual

✅ **Implementado:**
- Transações (transactions) - Sincronizadas com Supabase
- Orçamentos (budgets) - Sincronizados com Supabase
- Autenticação de usuários
- Notificações de saldo insuficiente
- Geração de relatórios em PDF

🔄 **Parcialmente Implementado:**
- Investimentos - Fallback para localStorage quando tabela não existe
- Metas Financeiras - Fallback para localStorage quando tabela não existe
- Alertas Financeiros - Fallback para localStorage quando tabela não existe

## Passos para Sincronização Completa

### 1. Executar Script SQL no Supabase

Execute o script `supabase_missing_tables.sql` no SQL Editor do Supabase para criar as tabelas que estão faltando:

```sql
-- Execute este script no SQL Editor do Supabase
-- O script criará as tabelas: investments, financial_goals, financial_alerts
-- E configurará RLS, triggers e funções para alertas automáticos
```

### 2. Estrutura das Tabelas

#### Tabela `investments`
```sql
CREATE TABLE public.investments (
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
```

#### Tabela `financial_goals`
```sql
CREATE TABLE public.financial_goals (
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
```

#### Tabela `financial_alerts`
```sql
CREATE TABLE public.financial_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('low_balance', 'budget_exceeded', 'goal_reminder', 'investment_alert')) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Funcionalidades Automáticas

O script SQL também configura:

#### Alertas de Saldo Baixo
- Trigger que monitora transações
- Cria alerta automático quando saldo fica negativo

#### Alertas de Orçamento Excedido
- Trigger que monitora despesas
- Cria alerta quando orçamento é excedido

#### Atualização Automática de Timestamps
- Trigger que atualiza `updated_at` automaticamente

### 4. Como Funciona a Sincronização

#### Transações e Orçamentos
- ✅ Dados salvos diretamente no Supabase
- ✅ Sincronização em tempo real entre dispositivos
- ✅ Políticas RLS garantem isolamento por usuário

#### Investimentos, Metas e Alertas
- 🔄 Fallback inteligente: tenta Supabase primeiro, depois localStorage
- 🔄 Quando as tabelas forem criadas, automaticamente migra para Supabase
- 🔄 Mantém compatibilidade durante a transição

### 5. Benefícios da Sincronização

#### ✅ Dados Persistentes
- Dados salvos no banco de dados
- Não se perdem ao limpar cache do navegador
- Backup automático do Supabase

#### ✅ Sincronização Entre Dispositivos
- Mesma conta = mesmos dados em qualquer dispositivo
- Atualizações em tempo real
- Histórico completo preservado

#### ✅ Segurança
- Autenticação obrigatória
- Políticas RLS (Row Level Security)
- Isolamento completo entre usuários

#### ✅ Alertas Automáticos
- Notificações de saldo baixo
- Alertas de orçamento excedido
- Sistema de alertas persistente

### 6. Testando a Sincronização

#### Teste 1: Mesmo Dispositivo
1. Faça login na aplicação
2. Adicione algumas transações
3. Recarregue a página
4. Verifique se os dados persistem

#### Teste 2: Dispositivos Diferentes
1. Faça login em um dispositivo
2. Adicione transações/orçamentos
3. Faça login em outro dispositivo com a mesma conta
4. Verifique se os dados aparecem

#### Teste 3: Alertas Automáticos
1. Configure um orçamento baixo
2. Adicione uma despesa que exceda o orçamento
3. Verifique se o alerta é criado automaticamente

### 7. Migração de Dados Existentes

Se você já tem dados no localStorage, eles serão mantidos como fallback até que as tabelas sejam criadas no Supabase. Após criar as tabelas:

1. Os novos dados serão salvos no Supabase
2. Os dados antigos continuarão no localStorage
3. Para migração completa, você pode implementar uma função de migração

### 8. Troubleshooting

#### Erro: "Table doesn't exist"
- Execute o script SQL no Supabase
- Verifique se as tabelas foram criadas corretamente

#### Erro: "Permission denied"
- Verifique se as políticas RLS estão configuradas
- Confirme se o usuário está autenticado

#### Dados não sincronizam
- Verifique a conexão com o Supabase
- Confirme se as credenciais estão corretas
- Verifique os logs do console

### 9. Próximos Passos

1. **Execute o script SQL** no Supabase
2. **Teste a sincronização** entre dispositivos
3. **Verifique os alertas automáticos**
4. **Implemente migração de dados** se necessário

### 10. Arquivos Modificados

- `src/hooks/useFinanceData.ts` - Hook principal com sincronização
- `src/lib/supabaseService.ts` - Serviço para operações com Supabase
- `supabase_missing_tables.sql` - Script para criar tabelas

## Conclusão

Com a implementação completa, todos os dados financeiros serão salvos no Supabase e sincronizados automaticamente entre dispositivos. O sistema mantém compatibilidade durante a transição e oferece funcionalidades avançadas como alertas automáticos e sincronização em tempo real. 