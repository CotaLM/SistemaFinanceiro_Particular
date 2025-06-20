import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

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

export const generatePDFReport = async (data: PDFReportData, chartElements?: HTMLElement[]) => {
  const doc = new jsPDF();
  
  // Configurações do documento
  doc.setFont('helvetica');
  doc.setFontSize(20);
  
  // Cabeçalho
  doc.setTextColor(59, 130, 246); // Blue-600
  doc.text('Relatório Financeiro', 105, 20, { align: 'center' });
  
  // Data do relatório
  doc.setFontSize(12);
  doc.setTextColor(107, 114, 128); // Gray-500
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, 30, { align: 'center' });
  
  // Período e filtros
  doc.setTextColor(55, 65, 81); // Gray-700
  doc.setFontSize(14);
  doc.text(`Período: ${data.period}`, 20, 45);
  doc.text(`Categoria: ${data.category}`, 20, 55);
  
  // Resumo financeiro
  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246); // Blue-600
  doc.text('Resumo Financeiro', 20, 75);
  
  doc.setFontSize(12);
  doc.setTextColor(55, 65, 81); // Gray-700
  
  // Receitas
  doc.setTextColor(34, 197, 94); // Green-500
  doc.text('Receitas Totais:', 20, 90);
  doc.text(`Kz ${data.totalIncome.toLocaleString('pt-BR')}`, 80, 90);
  
  // Despesas
  doc.setTextColor(239, 68, 68); // Red-500
  doc.text('Despesas Totais:', 20, 100);
  doc.text(`Kz ${data.totalExpenses.toLocaleString('pt-BR')}`, 80, 100);
  
  // Saldo
  doc.setTextColor(data.netBalance >= 0 ? 34 : 249, data.netBalance >= 0 ? 197 : 115, data.netBalance >= 0 ? 94 : 22);
  doc.text('Saldo Líquido:', 20, 110);
  doc.text(`Kz ${data.netBalance.toLocaleString('pt-BR')}`, 80, 110);
  
  // Tabela de transações
  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246); // Blue-600
  doc.text('Histórico de Transações', 20, 135);
  
  const tableData = data.transactions.slice(0, 15).map(t => [
    new Date(t.date).toLocaleDateString('pt-BR'),
    t.type === 'income' ? 'Receita' : 'Despesa',
    t.category,
    t.description || '-',
    `${t.type === 'income' ? '+' : '-'}Kz ${t.amount.toLocaleString('pt-BR')}`
  ]);
  
  autoTable(doc, {
    head: [['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor']],
    body: tableData,
    startY: 145,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Gray-50
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Data
      1: { cellWidth: 20 }, // Tipo
      2: { cellWidth: 30 }, // Categoria
      3: { cellWidth: 50 }, // Descrição
      4: { cellWidth: 25, halign: 'right' }, // Valor
    },
  });
  
  // Adicionar gráficos se disponíveis
  if (chartElements && chartElements.length > 0) {
    try {
      // Gráfico de linha (evolução financeira)
      if (chartElements[0]) {
        const canvas1 = await html2canvas(chartElements[0], {
          scale: 2,
          backgroundColor: '#ffffff',
          width: 400,
          height: 200,
        });
        
        const imgData1 = canvas1.toDataURL('image/png');
        doc.addPage();
        doc.setFontSize(16);
        doc.setTextColor(59, 130, 246);
        doc.text('Evolução Financeira', 105, 20, { align: 'center' });
        doc.addImage(imgData1, 'PNG', 20, 30, 170, 85);
      }
      
      // Gráfico de pizza (distribuição de despesas)
      if (chartElements[1]) {
        const canvas2 = await html2canvas(chartElements[1], {
          scale: 2,
          backgroundColor: '#ffffff',
          width: 400,
          height: 200,
        });
        
        const imgData2 = canvas2.toDataURL('image/png');
        doc.addPage();
        doc.setFontSize(16);
        doc.setTextColor(59, 130, 246);
        doc.text('Distribuição de Despesas por Categoria', 105, 20, { align: 'center' });
        doc.addImage(imgData2, 'PNG', 20, 30, 170, 85);
      }
    } catch (error) {
      console.error('Erro ao gerar gráficos:', error);
      // Adicionar página com dados em texto se os gráficos falharem
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(59, 130, 246);
      doc.text('Dados Mensais', 20, 20);
      
      let yPosition = 35;
      data.chartData.forEach(month => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        doc.text(`${month.month}: Receitas Kz ${month.income.toLocaleString('pt-BR')}, Despesas Kz ${month.expenses.toLocaleString('pt-BR')}`, 20, yPosition);
        yPosition += 10;
      });
    }
  }
  
  // Rodapé
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
    doc.text('Wealth Insight App', 20, 290);
  }
  
  return doc;
};

export const downloadPDF = async (data: PDFReportData, chartElements?: HTMLElement[]) => {
  try {
    const doc = await generatePDFReport(data, chartElements);
    const fileName = `relatorio-financeiro-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
    return true;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return false;
  }
}; 