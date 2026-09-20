export function Skel({ width = '100%', height = 14, radius = 6, style }: { width?: string | number; height?: number; radius?: number; style?: React.CSSProperties }) {
  return <div className="gl-skel" style={{ width, height, borderRadius: radius, ...style }} />
}
