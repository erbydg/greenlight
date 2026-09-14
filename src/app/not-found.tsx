export const runtime = 'edge'

export default function NotFound() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8 }}>
      <div className="font-heading" style={{ fontSize:'1.4rem', fontWeight:600 }}>404</div>
      <div style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>Page not found</div>
    </div>
  )
}
