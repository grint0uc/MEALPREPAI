import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 py-6">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">Meal Prep AI</h1>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="text-secondary-600 hover:text-secondary-900 font-medium px-4 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-900 tracking-tight">
            Stop Wasting Food.
            <span className="block text-primary-600 mt-2">Start Meal Prepping Smarter.</span>
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-secondary-600 max-w-2xl mx-auto">
            Tell us what&apos;s in your fridge, and our AI creates personalized meal prep plans
            optimized for your fitness goals. Save money, eat healthier, reach your goals.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-lg text-lg transition-colors shadow-lg shadow-primary-500/25"
            >
              Start Free
            </Link>
            <Link
              href="/login"
              className="bg-white hover:bg-secondary-50 text-secondary-700 font-semibold px-8 py-3 rounded-lg text-lg transition-colors border border-secondary-200"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-100">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-secondary-900">AI-Powered Recipes</h3>
            <p className="mt-2 text-secondary-600">
              Get personalized recipes based on exactly what you have. No more guessing or food
              waste.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-100">
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-success-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-secondary-900">Fitness-Optimized</h3>
            <p className="mt-2 text-secondary-600">
              Whether you&apos;re cutting, maintaining, or bulking, we optimize macros for your
              goals.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-100">
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-warning-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-secondary-900">Budget Friendly</h3>
            <p className="mt-2 text-secondary-600">
              Track costs per meal and see shopping suggestions to maximize your grocery budget.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-24">
          <h3 className="text-2xl font-bold text-secondary-900 text-center mb-12">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto text-lg font-bold">
                1
              </div>
              <h4 className="mt-4 text-lg font-semibold text-secondary-900">
                Add Your Ingredients
              </h4>
              <p className="mt-2 text-secondary-600">
                Search from 500+ ingredients and add what&apos;s in your fridge.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto text-lg font-bold">
                2
              </div>
              <h4 className="mt-4 text-lg font-semibold text-secondary-900">Set Your Goal</h4>
              <p className="mt-2 text-secondary-600">
                Choose weight loss, maintenance, or muscle gain for optimized recipes.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto text-lg font-bold">
                3
              </div>
              <h4 className="mt-4 text-lg font-semibold text-secondary-900">Get Your Meal Plan</h4>
              <p className="mt-2 text-secondary-600">
                Receive AI-generated recipes with nutrition info and fridge life tracking.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-secondary-200 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-secondary-500 text-sm">
            &copy; 2024 Meal Prep AI. Built for fitness enthusiasts.
          </p>
        </div>
      </footer>
    </div>
  );
}
