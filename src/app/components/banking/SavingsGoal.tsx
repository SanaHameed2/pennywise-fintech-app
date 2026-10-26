export function SavingsGoal() {
  const goal = { current: 2450, target: 5000, name: "Emergency Fund" };
  const progress = (goal.current / goal.target) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Savings Goal</h3>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-600 dark:text-gray-400">{goal.name}</span>
        <span className="font-medium">${goal.current} / ${goal.target}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-3">{progress}% completed</p>
    </div>
  );
}