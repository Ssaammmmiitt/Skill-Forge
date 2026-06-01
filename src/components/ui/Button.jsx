export const Button = ({ children, onClick, variant = "primary", disabled = false, loading = false }) => {
  const baseClasses = "h-11 px-8 py-3.5 rounded-pill font-mono uppercase tracking-[2.5px] text-sm transition-colors"
  
  const variantClasses = {
    primary: "bg-transparent border border-ink text-ink hover:bg-white/5",
  }
  
  const disabledClasses = disabled || loading ? "opacity-40 cursor-not-allowed" : ""
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses}`}
    >
      {loading ? "LOADING..." : children}
    </button>
  )
}
