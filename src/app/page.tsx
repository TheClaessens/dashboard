export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">
        Dashboard
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["Todos", "Calendar", "Food", "Health"].map((module) => (
          <div
            key={module}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-zinc-400 text-sm"
          >
            {module} widget coming soon
          </div>
        ))}
      </div>
    </div>
  );
}
