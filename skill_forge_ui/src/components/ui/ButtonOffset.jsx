/**
 * Brutalist offset-shadow button — theme-aware (light: white face / dark text; dark: inverse).
 */
const ButtonOffset = ({
  children,
  onClick,
  size = 'md',
  disabled = false,
  type = 'button',
  active = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 min-h-[36px] text-[10px] tracking-[1.5px]',
    md: 'px-5 py-2.5 min-h-[44px] text-xs tracking-[2px]',
    lg: 'px-8 py-3.5 min-h-[52px] text-sm tracking-[2px]',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative inline-block font-raw uppercase group
        transition-opacity duration-150
        disabled:opacity-40 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <span
        className={`absolute inset-0 w-full h-full transition duration-200 ease-out transform bg-[var(--btn-offset-shadow)] ${
          active
            ? 'translate-x-0 translate-y-0'
            : 'translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0'
        }`}
        aria-hidden
      />
      <span
        className={`absolute inset-0 w-full h-full border-2 border-[var(--btn-offset-border)] transition-colors duration-200 ${
          active
            ? 'bg-[var(--btn-offset-face-hover)]'
            : 'bg-[var(--btn-offset-face)] group-hover:bg-[var(--btn-offset-face-hover)]'
        }`}
        aria-hidden
      />
      <span
        className={`relative transition-colors duration-200 ${
          active
            ? 'text-[var(--btn-offset-text-hover)]'
            : 'text-[var(--btn-offset-text)] group-hover:text-[var(--btn-offset-text-hover)]'
        }`}
      >
        {children}
      </span>
    </button>
  )
}

export default ButtonOffset
