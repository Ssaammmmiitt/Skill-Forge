export const Badge = ({ children, variant = "default" }) => {
  return (
    <span className="bg-transparent text-muted font-mono uppercase text-[11px] tracking-[2px]">
      {children}
    </span>
  )
}
