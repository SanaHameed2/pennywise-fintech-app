import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, TrendingUp, CreditCard, Users, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
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
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className="py-20 px-4 md:px-8"
      >
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Banking Made{' '}
            <span className="text-emerald-500">Simple</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Experience the future of banking with Pennywise. Fast, secure, and designed for your financial success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-full transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/dashboard"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 px-8 py-4 rounded-full hover:shadow-md transition-all duration-300"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
        className="py-20 px-4 md:px-8 bg-white dark:bg-gray-800"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-gray-900 dark:text-white mb-12">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Secure Transactions', desc: 'Bank-level security for all your transactions' },
              { icon: Zap, title: 'Instant Transfers', desc: 'Send money instantly to anyone, anywhere' },
              { icon: TrendingUp, title: 'Smart Insights', desc: 'AI-powered analytics for better decisions' },
              { icon: CreditCard, title: 'Virtual Cards', desc: 'Create unlimited virtual cards instantly' },
            ].map((service, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                transition={{ duration: 0.5 }}
                className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 hover:-translate-y-1"
              >
                <service.icon className="w-12 h-12 text-emerald-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {service.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
        className="py-20 px-4 md:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { number: '2M+', label: 'Active Users' },
              { number: '$5B+', label: 'Transactions' },
              { number: '99.9%', label: 'Uptime' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center"
              >
                <Users className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.number}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className="py-20 px-4 md:px-8 bg-white dark:bg-gray-800"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-gray-900 dark:text-white mb-12">
            What Our Users Say
          </h2>
          <div className="bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl p-8 md:p-12">
            <div className="flex gap-1 mb-4 justify-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-emerald-500 text-emerald-500" />
              ))}
            </div>
            <blockquote className="text-xl text-gray-900 dark:text-white text-center mb-6">
              "Pennywise has completely transformed how I manage my finances. The insights are incredible and the interface is beautiful!"
            </blockquote>
            <div className="text-center">
              <p className="font-semibold text-gray-900 dark:text-white">Sarah Johnson</p>
              <p className="text-gray-500 dark:text-gray-400">Product Designer</p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
        className="py-20 px-4 md:px-8"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-gray-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              { q: 'Is Pennywise secure?', a: 'Yes, we use bank-level encryption and security measures to protect your data.' },
              { q: 'Are there any fees?', a: 'Basic accounts are free. Premium features available with our paid plans.' },
              { q: 'How do I get started?', a: 'Simply sign up for a free account and start managing your finances in minutes.' },
              { q: 'Can I use Pennywise on mobile?', a: 'Yes, Pennywise is fully responsive and works on all devices.' },
            ].map((faq, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
              >
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {faq.q}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>


    </div>
  );
}

