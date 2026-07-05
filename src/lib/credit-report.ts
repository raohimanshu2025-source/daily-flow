import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportData {
  profile: any;
  income: any[];
  savings: any[];
  loans: any[];
  expenses: any[];
  score: number;
  scoreLabel: string;
  factors: { label: string; value: string; score: number }[];
}

const fmt = (n: number) => `Rs. ${Math.round(n).toLocaleString("en-IN")}`;
const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-");

export async function generateCreditReport(data: ReportData): Promise<Blob> {
  const { profile, income, savings, loans, expenses, score, scoreLabel, factors } = data;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = margin;

  // === Header band ===
  doc.setFillColor(37, 99, 235); // primary blue
  doc.rect(0, 0, pageWidth, 90, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("RozanaPay", margin, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Financial Identity Report", margin, 58);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, margin, 74);
  y = 110;

  // === Borrower profile ===
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Borrower Profile", margin, y);
  y += 8;
  autoTable(doc, {
    startY: y,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 140, textColor: [90, 90, 90] } },
    body: [
      ["Name", profile?.name || "-"],
      ["Phone", profile?.phone || "-"],
      ["Occupation", profile?.occupation || "-"],
      ["City", profile?.city || "-"],
      ["KYC Status", (profile?.kyc_status || "pending").toUpperCase()],
      ["Member since", fmtDate(profile?.created_at)],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 20;

  // === Score card ===
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 90, 8, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(90, 90, 90);
  doc.text("RozanaPay Credit Score", margin + 16, y + 22);
  doc.setFontSize(36);
  const scoreColor: [number, number, number] =
    score >= 700 ? [22, 163, 74] : score >= 500 ? [217, 119, 6] : [220, 38, 38];
  doc.setTextColor(...scoreColor);
  doc.text(String(score), margin + 16, y + 62);
  doc.setFontSize(11);
  doc.text(scoreLabel, margin + 16, y + 80);
  // range bar
  const barX = margin + 180;
  const barY = y + 50;
  const barW = pageWidth - margin * 2 - 200;
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(barX, barY, barW, 10, 5, 5, "F");
  const pct = Math.max(0, Math.min(1, (score - 300) / 600));
  doc.setFillColor(...scoreColor);
  doc.roundedRect(barX, barY, barW * pct, 10, 5, 5, "F");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("300", barX, barY + 24);
  doc.text("900", barX + barW - 16, barY + 24);
  y += 110;

  // === Score factors ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text("Score Factors", margin, y);
  y += 8;
  autoTable(doc, {
    startY: y,
    head: [["Factor", "Detail", "Score / 100"]],
    body: factors.map((f) => [f.label, f.value, String(f.score)]),
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 10 },
    styles: { fontSize: 10, cellPadding: 6 },
    columnStyles: { 2: { halign: "right", cellWidth: 80 } },
  });
  y = (doc as any).lastAutoTable.finalY + 20;

  // === Income summary (last 90 days) ===
  const since = Date.now() - 90 * 86400000;
  const recentIncome = income.filter((i: any) => new Date(i.date).getTime() >= since);
  const totalIncome90 = recentIncome.reduce((s: number, i: any) => s + Number(i.amount || 0), 0);
  const distinctDays = new Set(recentIncome.map((i: any) => i.date?.slice(0, 10))).size;
  const recentExpenses = expenses.filter((e: any) => new Date(e.date).getTime() >= since);
  const totalExpense90 = recentExpenses.reduce((s: number, e: any) => s + Number(e.amount || 0), 0);

  if (y > pageHeight - 200) { doc.addPage(); y = margin; }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Income & Cashflow (Last 90 Days)", margin, y);
  y += 8;
  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 6 },
    body: [
      ["Total income logged", fmt(totalIncome90)],
      ["Active earning days", `${distinctDays} / 90`],
      ["Average per active day", fmt(distinctDays ? totalIncome90 / distinctDays : 0)],
      ["Total expenses", fmt(totalExpense90)],
      ["Net cashflow", fmt(totalIncome90 - totalExpense90)],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 20;

  // === Savings ===
  if (y > pageHeight - 200) { doc.addPage(); y = margin; }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Savings Goals", margin, y);
  y += 8;
  const savingsRows = savings.length
    ? savings.map((g: any) => [
        g.name || g.category || "-",
        fmt(g.current_amount || 0),
        fmt(g.target_amount || 0),
        `${Math.min(100, Math.round(((g.current_amount || 0) / (g.target_amount || 1)) * 100))}%`,
      ])
    : [["No active savings goals", "-", "-", "-"]];
  autoTable(doc, {
    startY: y,
    head: [["Goal", "Saved", "Target", "Progress"]],
    body: savingsRows,
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 10 },
    styles: { fontSize: 10, cellPadding: 6 },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } },
  });
  y = (doc as any).lastAutoTable.finalY + 20;

  // === Loans ===
  if (y > pageHeight - 200) { doc.addPage(); y = margin; }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Loan History", margin, y);
  y += 8;
  const loanRows = loans.length
    ? loans.map((l: any) => [
        fmtDate(l.applied_at),
        fmt(l.amount || 0),
        `${l.duration || 0}d`,
        `${l.interest_rate || 0}%`,
        fmt(l.repaid_amount || 0),
        (l.status || "").toUpperCase(),
      ])
    : [["No loans yet", "-", "-", "-", "-", "-"]];
  autoTable(doc, {
    startY: y,
    head: [["Applied", "Amount", "Term", "Rate", "Repaid", "Status"]],
    body: loanRows,
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 10 },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: { 1: { halign: "right" }, 4: { halign: "right" } },
  });
  y = (doc as any).lastAutoTable.finalY + 24;

  // === Footer / disclaimer on every page ===
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, pageHeight - 40, pageWidth - margin, pageHeight - 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      "This report is generated from user-logged activity on RozanaPay. RozanaPay is not a lender; loans and BNPL are offered via regulated partner NBFCs/banks.",
      margin,
      pageHeight - 26,
      { maxWidth: pageWidth - margin * 2 }
    );
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 12, { align: "right" });
  }

  return doc.output("blob");
}