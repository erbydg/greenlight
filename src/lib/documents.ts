export const DOC_FIELDS = ['ai_risk_summary', 'ai_scope_lock_doc', 'ai_handover_brief', 'ai_kickoff_plan'] as const
export const SIGNABLE_TABS = ['scope', 'kickoff']
export const SHAREABLE_TABS = ['scope', 'handover'] as const
export type ShareableDoc = typeof SHAREABLE_TABS[number]

export interface AgencyInfo { name: string; signature_name: string | null; signature_title: string | null }

export function withSignature(content: string, tab: string, agency: AgencyInfo | null): string {
  if (!agency?.signature_name || !SIGNABLE_TABS.includes(tab)) return content
  const who = agency.signature_title ? `${agency.signature_name}, ${agency.signature_title}` : agency.signature_name
  return `${content}\n\n---\n\n*${who}*\n\n**${agency.name}**`
}

export function stripMarkdown(content: string): string {
  return content.replace(/\*\*(.+?)\*\*/g,'$1').replace(/\*(.+?)\*/g,'$1').replace(/^#{1,6}\s+/gm,'').trim()
}

export async function downloadPDF(title: string, content: string, filename: string) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' })
  const clean = stripMarkdown(content)
  const margin = 20, maxWidth = doc.internal.pageSize.getWidth() - margin * 2
  doc.setFontSize(16); doc.setFont('helvetica','bold'); doc.text(title, margin, 20)
  doc.setFontSize(10); doc.setFont('helvetica','normal')
  const lines = doc.splitTextToSize(clean, maxWidth)
  let y = 35
  lines.forEach((line: string) => { if(y>270){doc.addPage();y=20}; doc.text(line,margin,y); y+=5 })
  doc.save(filename)
}
