import { motion } from 'framer-motion';

const transactions = [
  { id: 1, name: "Netflix Subscription", date: "Today, 2:30 PM", amount: 15.99, type: "debit", icon: "🎬" },
  { id: 2, name: "Salary Deposit", date: "Yesterday", amount: 3200.00, type: "credit", icon: "💰" },
  { id: 3, name: "Starbucks Coffee", date: "Yesterday, 9:15 AM", amount: 5.75, type: "debit", icon: "☕" },
  { id: 4, name: "Transfer to Mom", date: "Jun 10, 2026", amount: 200.00, type: "debit", icon: "👩" },
  { id: 5, name: "Freelance Payment", date: "Jun 9, 2026", amount: 500.00, type: "credit", icon: "💻" },
];

export function RecentTransactions() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
        <button className="text-emerald-600 text-sm font-medium hover:underline">View All</button>
      </div>
      
      <div className="space-y-3">
        {transactions.map((tx, index) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                <span className="text-lg">{tx.icon}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{tx.name}</p>
                <p className="text-xs text-gray-500">{tx.date}</p>
              </div>
            </div>
            <p className={`font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
              {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}