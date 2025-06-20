# Guia de Migração para Sincronização Completa

Este guia te ajudará a migrar completamente para o Supabase e sincronizar dados entre dispositivos.

## 🚀 Passo 1: Executar Script SQL no Supabase

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **SQL Editor**
4. Copie e cole o conteúdo do arquivo `supabase_missing_tables.sql`
5. Clique em **Run** para executar

### Verificação
Após executar o script, você deve ver as seguintes tabelas criadas:
- ✅ `investments`
- ✅ `financial_goals` 
- ✅ `financial_alerts`

## 🔧 Passo 2: Verificar Configuração

### Verificar Políticas RLS
No SQL Editor, execute:
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('investments', 'financial_goals', 'financial_alerts');
```

### Verificar Triggers
```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN ('investments', 'financial_goals', 'transactions');
```

## 📱 Passo 3: Testar Sincronização

### Teste Básico
1. **Dispositivo A:**
   - Faça login na aplicação
   - Adicione uma transação de receita (ex: Salário - Kz 50.000)
   - Adicione uma transação de despesa (ex: Alimentação - Kz 15.000)

2. **Dispositivo B:**
   - Faça login com a mesma conta
   - Verifique se as transações aparecem
   - Adicione uma nova transação

3. **Dispositivo A:**
   - Recarregue a página
   - Verifique se a nova transação aparece

### Teste de Orçamentos
1. Crie um orçamento para "Alimentação" com limite de Kz 20.000
2. Adicione despesas que excedam o limite
3. Verifique se os alertas são criados automaticamente

### Teste de Investimentos
1. Adicione um investimento
2. Verifique se aparece em ambos os dispositivos
3. Atualize o valor do investimento

### Teste de Metas
1. Crie uma meta financeira
2. Adicione progresso à meta
3. Verifique sincronização entre dispositivos

## 🔄 Passo 4: Migração de Dados Existentes (Opcional)

Se você já tem dados no localStorage, pode migrá-los para o Supabase:

### Script de Migração
```javascript
// Execute no console do navegador (F12)
async function migrateLocalData() {
  const { supabase } = await import('./src/integrations/supabase/client.js');
  
  // Migrar investimentos
  const investments = JSON.parse(localStorage.getItem('finance_investments') || '[]');
  for (const inv of investments) {
    await supabase.from('investments').insert({
      user_id: inv.user_id,
      type: inv.type,
      amount: inv.amount,
      date: inv.date,
      return_rate: inv.return_rate,
      current_value: inv.current_value
    });
  }
  
  // Migrar metas
  const goals = JSON.parse(localStorage.getItem('finance_goals') || '[]');
  for (const goal of goals) {
    await supabase.from('financial_goals').insert({
      user_id: goal.user_id,
      title: goal.title,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      target_date: goal.target_date,
      category: goal.category,
      description: goal.description
    });
  }
  
  console.log('Migração concluída!');
}

migrateLocalData();
```

## ✅ Passo 5: Verificações Finais

### Checklist de Funcionalidades
- [ ] Transações sincronizam entre dispositivos
- [ ] Orçamentos sincronizam entre dispositivos
- [ ] Investimentos sincronizam entre dispositivos
- [ ] Metas financeiras sincronizam entre dispositivos
- [ ] Alertas são criados automaticamente
- [ ] Dados persistem após limpar cache
- [ ] Notificações de saldo insuficiente funcionam
- [ ] Relatórios em PDF funcionam

### Teste de Performance
1. Adicione 50+ transações
2. Verifique se a aplicação continua responsiva
3. Teste a sincronização em tempo real

## 🐛 Solução de Problemas

### Erro: "Table doesn't exist"
```
Solução: Execute o script SQL novamente no Supabase
```

### Erro: "Permission denied"
```
Solução: Verifique se as políticas RLS estão configuradas corretamente
```

### Dados não aparecem
```
Solução: 
1. Verifique se está logado
2. Recarregue a página
3. Verifique o console para erros
```

### Sincronização lenta
```
Solução:
1. Verifique a conexão com internet
2. Aguarde alguns segundos
3. Recarregue a página
```

## 📊 Monitoramento

### Logs Úteis
- Console do navegador (F12)
- Logs do Supabase (Dashboard > Logs)
- Network tab (para verificar requisições)

### Métricas para Acompanhar
- Tempo de carregamento dos dados
- Frequência de erros de sincronização
- Uso de storage (localStorage vs Supabase)

## 🎯 Resultado Esperado

Após completar a migração:

✅ **Dados Persistentes:** Todos os dados salvos no banco de dados
✅ **Sincronização Real:** Dados aparecem em todos os dispositivos
✅ **Alertas Automáticos:** Sistema de notificações funcionando
✅ **Performance:** Aplicação responsiva e rápida
✅ **Segurança:** Dados isolados por usuário

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs** no console do navegador
2. **Consulte a documentação** do Supabase
3. **Teste em modo incógnito** para isolar problemas de cache
4. **Verifique a conexão** com o Supabase

---

**🎉 Parabéns!** Sua aplicação agora está completamente sincronizada com o Supabase e funcionará perfeitamente em múltiplos dispositivos. 