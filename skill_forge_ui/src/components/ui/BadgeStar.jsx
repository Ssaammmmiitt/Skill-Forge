const BadgeStar = ({ children, status = 'completed' }) => {
  const statusStyles = {
    completed: 'bg-[rgba(74,222,128,0.2)] text-space-success',
    pending: 'bg-[rgba(251,191,36,0.2)] text-space-warning',
    missed: 'bg-[rgba(248,113,113,0.2)] text-space-error',
    locked: 'bg-[rgba(139,130,195,0.2)] text-[#8B82C3]'
  }

  return (
    <span
      className={`
        rounded-pill px-3 py-1
        font-body-space text-[12px]
        inline-block
        ${statusStyles[status] || statusStyles.completed}
      `}
    >
      {children}
    </span>
  )
}

export default BadgeStar
