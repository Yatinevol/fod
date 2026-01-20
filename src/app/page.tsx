import Link from "next/link";
import { Target, Timer, Users, TrendingUp, CheckCircle2, Calendar } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FOD
          </span>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/sign-in"
            className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link 
            href="/sign-up"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 font-medium transition-colors shadow-lg shadow-blue-500/30"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Focus on Dedication
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            Track your goals, manage your time, and stay motivated with collaborative Pomodoro sessions
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              href="/sign-up"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 font-semibold text-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105"
            >
              Start Your Journey
            </Link>
            <Link 
              href="/dashboard"
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 font-semibold text-lg transition-all"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow border border-gray-100 dark:border-gray-700">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Goal Tracking</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Set, organize, and track your goals by categories. Mark tasks complete and watch your progress grow.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow border border-gray-100 dark:border-gray-700">
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
              <Timer className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Pomodoro Timer</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Stay focused with built-in Pomodoro technique. Customize work and break intervals to match your rhythm.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow border border-gray-100 dark:border-gray-700">
            <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Collaborative Sessions</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Create or join shared Pomodoro sessions. Study with friends and stay accountable together.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow border border-gray-100 dark:border-gray-700">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Streak Calendar</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Build consistency with daily streaks. Visualize your dedication with an interactive calendar view.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow border border-gray-100 dark:border-gray-700">
            <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Progress Analytics</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Monitor your productivity trends. See which goals need attention and celebrate your wins.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow border border-gray-100 dark:border-gray-700">
            <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Task Management</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Organize tasks by categories, set priorities, and check them off as you complete your daily goals.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 mt-20 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-bold text-gray-800 dark:text-gray-200">Focus on Dedication</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            © 2026 FOD. Build habits that last.
          </p>
        </div>
      </footer>
    </div>
  );
}
