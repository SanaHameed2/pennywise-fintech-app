import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const chartData = [
    { month: 'Jan', balance: 4000 },
    { month: 'Feb', balance: 3000 },
    { month: 'Mar', balance: 5000 },
    { month: 'Apr', balance: 4500 },
    { month: 'May', balance: 6000 },
    { month: 'Jun', balance: 5500 },
  ];

  const transactions = [
    { id: 1, name: 'Netflix Subscription', amount: -15.99, date: '2026-05-20', type: 'expense' },
    { id: 2, name: 'Salary Deposit', amount: 5000, date: '2026-05-15', type: 'income' },
    { id: 3, name: 'Grocery Shopping', amount: -127.45, date: '2026-05-14', type: 'expense' },
    { id: 4, name: 'Freelance Payment', amount: 850, date: '2026-05-12', type: 'income' },
    { id: 5, name: 'Electric Bill', amount: -89.99, date: '2026-05-10', type: 'expense' },
    { id: 6, name: 'Coffee Shop', amount: -12.50, date: '2026-05-08', type: 'expense' },
  ];

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const stagger = {
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-8">
            Dashboard
          </h1>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            { icon: Wallet, title: 'Total Balance', amount: '$24,563.00', change: '+12.5%', positive: true },
            { icon: TrendingUp, title: 'Income', amount: '$5,850.00', change: '+8.2%', positive: true },
            { icon: TrendingDown, title: 'Expenses', amount: '$2,340.00', change: '-3.1%', positive: true },
            { icon: Wallet, title: 'Savings', amount: '$8,420.00', change: '+15.3%', positive: true },
          ].map((card, index) => (
            <motion.div
              key={index}
              variants={fadeIn}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <card.icon className="w-8 h-8 md:w-12 md:h-12 text-emerald-500" />
                <span
                  className={`text-sm font-semibold ${
                    card.positive ? 'text-emerald-500' : 'text-red-500'
                  }`}
                >
                  {card.change}
                </span>
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 mb-2">{card.title}</h3>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {card.amount}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Balance Overview
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBalance)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Spending Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#fff',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Recent Transactions
          </h2>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'income'
                        ? 'bg-emerald-100 dark:bg-emerald-900/20'
                        : 'bg-red-100 dark:bg-red-900/20'
                    }`}
                  >
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {transaction.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.date}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-bold ${
                    transaction.type === 'income'
                      ? 'text-emerald-500'
                      : 'text-red-500'
                  }`}
                >
                  {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
}

