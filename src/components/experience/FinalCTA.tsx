import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Swords, BarChart3 } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="relative z-20 bg-[#0a0a0f] px-4 sm:px-6 lg:px-8 py-24 sm:py-32 border-t border-white/5 overflow-hidden">
      {/* Brilhos de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-6"
        >
          Pronto para <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">dominar</span>?
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-[#6a6a7e] text-lg mb-10 max-w-xl mx-auto"
        >
          Junte-se aos melhores jogadores e equipes. Entre no nosso ecossistema e comece a traçar sua própria história.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/xtreinos"
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-[#0a0a0f] font-bold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
          >
            <Swords className="w-5 h-5" />
            Ver XTreinos
          </Link>
          
          <Link
            to="/rankings"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 hover:border-white/40 text-white font-bold rounded-xl transition-all duration-300 hover:bg-white/5"
          >
            <BarChart3 className="w-5 h-5" />
            Ver Ranking
          </Link>
        </motion.div>
      </div>
    </section>
  );
}