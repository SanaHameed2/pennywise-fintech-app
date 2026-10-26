import { motion } from 'framer-motion';

export function BalanceCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 text-white"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl" />
      
      <div className="relative z-10">
        <p className="text-sm opacity-80">Total Balance</p>
        <p className="text-4xl font-bold mt-1">$12,450.00</p>
        <p className="text-xs opacity-70 mt-1">+2.5% from last month</p>
        
        <div className="flex gap-3 mt-6">
          <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-sm font-medium hover:bg-white/30 transition-all">
            Add Money
          </button>
          <button className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-sm font-medium hover:bg-white/20 transition-all">
            Withdraw
          </button>
        </div>
      </div>
    </motion.div>
  );
}