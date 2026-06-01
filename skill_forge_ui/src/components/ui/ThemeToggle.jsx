import { useThemeStore } from '../../store/useThemeStore'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <button
      onClick={toggleTheme}
      className="w-full border-[3px] border-raw-border bg-raw-bg py-3 px-4 
                 flex items-center justify-between
                 hover:bg-raw-hover transition-colors duration-150"
      style={{ borderRadius: '0px' }}
      aria-label="Toggle theme"
    >
      <div className="flex items-center gap-3">
        <div className="font-mono text-[10px] text-raw-text-secondary uppercase tracking-[1px]">
          THEME
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Toggle Switch */}
        <div
          className="w-10 h-5 border-[2px] border-raw-border relative flex items-center bg-raw-surface"
          style={{ borderRadius: '0px' }}
        >
          <div
            className={`w-4 h-4 bg-raw-border transition-transform duration-200 ${
              theme === 'dark' ? 'translate-x-0' : 'translate-x-5'
            }`}
            style={{ borderRadius: '0px' }}
          />
        </div>
        
        {/* Label */}
        <span className="font-raw text-[9px] text-raw-text uppercase tracking-[1px] min-w-[40px]">
          {theme === 'dark' ? 'DARK' : 'LIGHT'}
        </span>
      </div>
    </button>
  )
}

export default ThemeToggle
