import { motion } from 'framer-motion';

interface QuickActionCardProps {
  icon: string;
  label: string;
  onClick?: () => void;
}

export function QuickActionCard({ icon, label, onClick }: QuickActionCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 w-full cursor-pointer"
    >
      <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-2 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
    </motion.button>
  );
}