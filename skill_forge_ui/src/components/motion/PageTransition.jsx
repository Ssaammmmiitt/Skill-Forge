import { motion } from 'framer-motion'
import { pageTransition } from './motionPresets'

/**
 * Wraps routed page content for enter/exit transitions (use inside layout Outlet).
 */
const PageTransition = ({ children, className = '' }) => (
  <motion.div
    className={className}
    initial={pageTransition.initial}
    animate={pageTransition.animate}
    exit={pageTransition.exit}
    transition={pageTransition.transition}
  >
    {children}
  </motion.div>
)

export default PageTransition
