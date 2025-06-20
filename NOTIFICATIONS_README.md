# Sistema de Notificações - Wealth Insight App

## 🚨 Funcionalidade Implementada

O sistema agora inclui **notificações automáticas** quando uma despesa ultrapassa o saldo disponível do usuário.

## ✨ Como Funciona

### 1. **Verificação de Saldo em Tempo Real**
- Quando o usuário adiciona uma nova despesa, o sistema calcula automaticamente o saldo atual
- Se a despesa resultar em saldo negativo, uma notificação de aviso é exibida

### 2. **Notificação Interativa**
- **Título**: "⚠️ Saldo Insuficiente"
- **Descrição**: Mostra o valor da despesa e quanto ficará negativo o saldo
- **Duração**: 8 segundos
- **Ações**:
  - ✅ **"Continuar mesmo assim"**: Confirma a transação
  - ❌ **"Cancelar"**: Cancela a transação

### 3. **Alertas Visuais no Dashboard**
- **Saldo Negativo**: Card vermelho com alerta de emergência
- **Saldo Baixo** (< Kz 1.000): Card amarelo com aviso
- **Saldo Normal**: Card azul

### 4. **Página de Alertas Financeiros**
- Centraliza todos os alertas do sistema
- Inclui alertas de saldo, orçamento e metas
- Mostra resumo financeiro completo

## 🛠️ Implementação Técnica

### Hook `useFinanceData` Atualizado
```typescript
const addTransaction = (transaction) => {
  // Verifica se é uma despesa que excederá o saldo
  if (transaction.type === 'expense') {
    const currentBalance = calculateBalance();
    const newBalance = currentBalance - transaction.amount;
    
    if (newBalance < 0) {
      // Mostra notificação de aviso
      toast.warning("⚠️ Saldo Insuficiente", {
        description: `Esta despesa irá deixar seu saldo negativo em Kz ${Math.abs(newBalance)}`,
        action: {
          label: "Continuar mesmo assim",
          onClick: () => proceedWithTransaction(newTransaction)
        },
        cancel: {
          label: "Cancelar",
          onClick: () => toast.info("Transação cancelada")
        }
      });
      return;
    }
  }
  
  // Procede normalmente se não houver problema
  proceedWithTransaction(newTransaction);
};
```

### Componente Dashboard Atualizado
- Alertas visuais para saldo baixo/negativo
- Cards coloridos baseados no status do saldo
- Ícones de alerta para chamar atenção

## 📊 Script SQL para Supabase

Execute o arquivo `supabase_schema.sql` no SQL Editor do Supabase para:

1. **Criar tabelas** com estrutura completa
2. **Configurar RLS** (Row Level Security)
3. **Implementar triggers** para alertas automáticos
4. **Funções** para cálculo de saldo e alertas

### Funcionalidades do Banco de Dados:
- **Trigger automático**: Cria alertas quando saldo fica negativo
- **Função `get_user_balance()`**: Calcula saldo atual
- **Tabela `financial_alerts`**: Armazena histórico de alertas
- **Políticas RLS**: Segurança por usuário

## 🎯 Cenários de Uso

### Cenário 1: Saldo Suficiente
```
Usuário adiciona despesa de Kz 5.000
Saldo atual: Kz 10.000
Resultado: Transação registrada normalmente
```

### Cenário 2: Saldo Insuficiente
```
Usuário adiciona despesa de Kz 15.000
Saldo atual: Kz 10.000
Resultado: 
- Notificação de aviso aparece
- Usuário pode confirmar ou cancelar
- Se confirmar: saldo fica negativo
- Se cancelar: transação não é registrada
```

### Cenário 3: Saldo Baixo
```
Saldo atual: Kz 500
Resultado: 
- Card amarelo no dashboard
- Alerta na página de alertas
- Recomendação de manter saldo maior
```

## 🔧 Configuração

### 1. Frontend (Já Implementado)
- ✅ Hook `useFinanceData` atualizado
- ✅ Componente `Dashboard` com alertas visuais
- ✅ Componente `FinancialAlerts` completo
- ✅ Sistema de toast configurado

### 2. Backend (Execute o SQL)
```sql
-- Execute no SQL Editor do Supabase
-- Arquivo: supabase_schema.sql
```

### 3. Teste a Funcionalidade
1. Adicione algumas receitas
2. Tente adicionar uma despesa maior que o saldo
3. Verifique se a notificação aparece
4. Teste as opções "Continuar" e "Cancelar"

## 🎨 Personalização

### Alterar Limite de Saldo Baixo
```typescript
// Em useFinanceData.ts, linha ~30
if (balance >= 0 && balance < 1000) { // Altere 1000 para outro valor
```

### Alterar Mensagens
```typescript
// Em useFinanceData.ts
toast.warning("⚠️ Saldo Insuficiente", {
  description: `Sua mensagem personalizada aqui`,
  // ...
});
```

### Alterar Cores dos Cards
```typescript
// Em Dashboard.tsx
const getCardColor = (balance) => {
  if (balance < 0) return 'from-red-500 to-red-600';
  if (balance < 1000) return 'from-amber-500 to-amber-600';
  return 'from-blue-500 to-blue-600';
};
```

## 🚀 Próximos Passos

1. **Migrar para Supabase**: Execute o script SQL
2. **Testar funcionalidade**: Adicione transações de teste
3. **Personalizar alertas**: Ajuste mensagens e limites
4. **Adicionar notificações push**: Para alertas em tempo real
5. **Implementar relatórios**: Histórico de alertas

## 📱 Experiência do Usuário

- **Preventivo**: Avisa antes de criar saldo negativo
- **Interativo**: Usuário decide se quer continuar
- **Visual**: Cores e ícones claros
- **Informativo**: Mostra valores e consequências
- **Não intrusivo**: Não bloqueia o fluxo principal

O sistema agora oferece uma experiência completa de gestão financeira com alertas inteligentes! 🎉 