import { motion } from 'framer-motion'

type FeatureCardProps = {
  title: string
  description: string
  index?: number
}

export function FeatureCard({ title, description, index = 0 }: FeatureCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/60 p-5 transition hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-slate-900/80"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/10 blur-2xl opacity-0 transition group-hover:opacity-100" />
      <h3 className="text-base font-semibold text-slate-100">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{description}</p>
    </motion.article>
  )
}
