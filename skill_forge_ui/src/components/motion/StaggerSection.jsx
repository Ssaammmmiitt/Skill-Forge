import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from './motionPresets'

/**
 * Stagger children on mount — good for dashboards, forms, feature grids.
 */
const StaggerSection = ({ children, className = '' }) => (
  <motion.div
    className={className}
    variants={staggerContainer}
    initial="initial"
    animate="animate"
  >
    {children}
  </motion.div>
)

export const StaggerItem = ({ children, className = '' }) => (
  <motion.div className={className} variants={staggerItem}>
    {children}
  </motion.div>
)

export default StaggerSection
