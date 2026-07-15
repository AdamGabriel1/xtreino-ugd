import { motion } from 'framer-motion';

export default function MantraSection() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" as const }}
      viewport={{ once: true }}
      className="text-center py-16 sm:py-24 relative overflow-hidden"
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <h2
          className="text-[20vw] sm:text-[14vw] md:text-[8vw] font-black text-[#12121a]"
          style={{ WebkitTextStroke: '1px rgba(255,255,255,0.05)' }}
        >
          EVOLUÇÃO
        </h2>
      </div>
      <div className="relative z-10 px-4">
        <p className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#f0f0f5] leading-tight max-w-4xl mx-auto tracking-tight">
          Não acompanhamos tendências. <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-white">
            Nós criamos o futuro.
          </span>
        </p>
      </div>
    </motion.div>
  );
}