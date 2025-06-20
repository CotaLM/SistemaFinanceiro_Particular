# Relatórios em PDF - Wealth Insight App

## 📄 Funcionalidade Implementada

O sistema agora inclui **geração de relatórios em PDF** completos e profissionais, além da exportação CSV existente.

## ✨ Características do PDF

### 📊 **Conteúdo do Relatório**
1. **Cabeçalho Profissional**
   - Título do relatório
   - Data de geração
   - Período e filtros aplicados

2. **Resumo Financeiro**
   - Receitas totais (verde)
   - Despesas totais (vermelho)
   - Saldo líquido (azul/laranja)

3. **Tabela de Transações**
   - Últimas 15 transações
   - Formatação profissional
   - Cores diferenciadas por tipo

4. **Gráficos Incluídos**
   - Evolução financeira (linha)
   - Distribuição de despesas (pizza)
   - Captura automática dos gráficos da tela

5. **Rodapé**
   - Numeração de páginas
   - Nome do aplicativo

## 🛠️ Implementação Técnica

### Dependências Instaladas
```bash
npm install jspdf jspdf-autotable html2canvas
```

- **jsPDF**: Geração do documento PDF
- **jspdf-autotable**: Tabelas formatadas no PDF
- **html2canvas**: Captura de gráficos como imagens

### Estrutura dos Arquivos

#### 1. **`src/lib/pdfGenerator.ts`**
```typescript
// Interface para dados do relatório
export interface PDFReportData {
  transactions: any[];
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  period: string;
  category: string;
  chartData: any[];
  pieData: any[];
}

// Função principal de geração
export const generatePDFReport = async (data: PDFReportData, chartElements?: HTMLElement[])

// Função de download
export const downloadPDF = async (data: PDFReportData, chartElements?: HTMLElement[])
```

#### 2. **`src/components/Reports.tsx`** (Atualizado)
- Botão "PDF" adicionado
- Captura de elementos dos gráficos
- Estado de loading durante geração
- Tratamento de erros

## 🎯 Como Usar

### 1. **Acessar Relatórios**
- Vá para a aba "Relatórios"
- Configure filtros de período e categoria

### 2. **Gerar PDF**
- Clique no botão **"PDF"** (azul)
- Aguarde a geração (botão mostra "Gerando...")
- O arquivo será baixado automaticamente

### 3. **Nome do Arquivo**
```
relatorio-financeiro-2024-01-15.pdf
```

## 📋 Funcionalidades do PDF

### ✅ **Formatação Profissional**
- Fontes consistentes
- Cores temáticas
- Layout responsivo
- Múltiplas páginas

### ✅ **Dados Completos**
- Resumo financeiro
- Histórico de transações
- Gráficos capturados
- Filtros aplicados

### ✅ **Gráficos Incluídos**
- **Evolução Financeira**: Linha temporal
- **Distribuição de Despesas**: Pizza por categoria
- **Fallback**: Dados em texto se gráficos falharem

### ✅ **Tabela Formatada**
- Cabeçalhos destacados
- Linhas alternadas
- Larguras otimizadas
- Alinhamento correto

## 🎨 Personalização

### Alterar Cores
```typescript
// Em pdfGenerator.ts
doc.setTextColor(59, 130, 246); // Azul principal
doc.setTextColor(34, 197, 94);  // Verde para receitas
doc.setTextColor(239, 68, 68);  // Vermelho para despesas
```

### Alterar Layout
```typescript
// Posicionamento de elementos
doc.text('Título', 105, 20, { align: 'center' }); // x, y, options
doc.addImage(imgData, 'PNG', 20, 30, 170, 85);    // x, y, width, height
```

### Alterar Conteúdo
```typescript
// Adicionar mais seções
doc.setFontSize(16);
doc.setTextColor(59, 130, 246);
doc.text('Nova Seção', 20, 200);
```

## 🔧 Configuração Avançada

### Captura de Gráficos
```typescript
// Capturar elemento específico
const chartElement = document.querySelector('.chart-container');
const canvas = await html2canvas(chartElement, {
  scale: 2,                    // Qualidade
  backgroundColor: '#ffffff',   // Fundo
  width: 400,                  // Largura
  height: 200,                 // Altura
});
```

### Configuração de Tabela
```typescript
autoTable(doc, {
  head: [['Coluna 1', 'Coluna 2']],
  body: data,
  startY: 145,
  styles: { fontSize: 8, cellPadding: 2 },
  headStyles: { fillColor: [59, 130, 246], textColor: 255 },
  columnStyles: { 0: { cellWidth: 25 } },
});
```

## 🚀 Próximos Passos

### 1. **Melhorias Sugeridas**
- [ ] Template personalizável
- [ ] Mais tipos de gráficos
- [ ] Relatórios agendados
- [ ] Envio por email

### 2. **Otimizações**
- [ ] Compressão de imagens
- [ ] Cache de gráficos
- [ ] Geração em background
- [ ] Preview do PDF

### 3. **Funcionalidades Extras**
- [ ] Relatórios comparativos
- [ ] Análises preditivas
- [ ] Gráficos interativos
- [ ] Exportação em outros formatos

## 📱 Experiência do Usuário

### ✅ **Vantagens**
- **Profissional**: Layout empresarial
- **Completo**: Todos os dados incluídos
- **Rápido**: Geração otimizada
- **Confiável**: Tratamento de erros
- **Flexível**: Filtros aplicados

### ⚠️ **Considerações**
- **Tamanho**: PDFs podem ser grandes
- **Tempo**: Geração pode demorar
- **Navegador**: Depende de compatibilidade
- **Gráficos**: Qualidade pode variar

## 🎉 Resultado Final

O sistema agora oferece:
- ✅ **Exportação CSV** (rápida e simples)
- ✅ **Relatórios PDF** (profissionais e completos)
- ✅ **Gráficos incluídos** (visuais e informativos)
- ✅ **Filtros aplicados** (personalizados)
- ✅ **Formatação profissional** (pronto para apresentação)

Os relatórios em PDF são ideais para:
- 📊 **Apresentações empresariais**
- 📋 **Documentação financeira**
- 📈 **Análises detalhadas**
- 💼 **Relatórios para terceiros**

A funcionalidade está completa e pronta para uso! 🚀 