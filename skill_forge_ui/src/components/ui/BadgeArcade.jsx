const BadgeArcade = ({ children }) => {
  return (
    <span
      className="
        bg-arcade-surface border-[2px] border-dotted border-space-star
        text-space-star font-arcade text-[8px]
        px-2.5 py-1 tracking-[1px]
        inline-block
      "
      style={{ borderRadius: '0px' }}
    >
      {children}
    </span>
  )
}

export default BadgeArcade
