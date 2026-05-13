import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface FeatureCardProps {
  icon?: ReactNode
  title: string
  description: string
  delay?: number
  index?: number
}

export function FeatureCard({ icon, title, description, delay = 0, index = 0 }: FeatureCardProps) {
  const calculatedDelay = delay || index * 0.1
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: calculatedDelay }}
      viewport={{ once: true }}
      className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
    >
      {icon && <div className="text-purple-400 mb-4">{icon}</div>}
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </motion.div>
  )
}