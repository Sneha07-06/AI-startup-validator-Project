import { useState, useEffect } from "react";

export default function History({ onBack, onOpenReport, darkMode, onToggleTheme }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/ideas/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setIdeas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setIdeas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-app px-4 py-8 sm:py-12 transition-colors duration-300">
      <div className="max-w-5xl mx-auto animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={onBack}
              className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-2 hover:underline inline-flex items-center gap-1"
            >
              ← Back to dashboard
            </button>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Ideas History
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Revisit and share your past validations
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleTheme}
            className="btn-secondary"
            aria-label="Toggle theme"
          >
            {darkMode ? "Light" : "Dark"}
          </button>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 h-28 animate-pulse-soft" />
            ))}
          </div>
        )}

        {!loading && ideas.length === 0 && (
          <div className="card p-10 text-center animate-slide-up">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xl font-bold">
              ?
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-medium">No ideas saved yet</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
              Validate your first idea to see it here.
            </p>
            <button onClick={onBack} className="btn-primary mt-6 px-6 py-2.5">
              Go validate →
            </button>
          </div>
        )}

        <div className="space-y-4">
          {ideas.map((item, idx) => (
            <button
              type="button"
              key={item._id}
              onClick={() => onOpenReport?.(item)}
              className="card card-hover p-5 sm:p-6 w-full text-left animate-slide-up"
              style={{ animationDelay: `${Math.min(idx, 8) * 40}ms` }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <p className="text-slate-800 dark:text-slate-100 font-medium text-sm sm:text-base flex-1 leading-relaxed line-clamp-3">
                  {item.idea}
                </p>
                <span
                  className={`font-display text-2xl sm:text-3xl font-bold tabular-nums shrink-0 ${
                    item.result?.score >= 7
                      ? "text-emerald-500"
                      : item.result?.score >= 5
                        ? "text-amber-500"
                        : "text-red-500"
                  }`}
                >
                  {item.result?.score}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {item.industry && (
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-3 py-1 rounded-full font-medium">
                    {item.industry}
                  </span>
                )}
                {item.audience && (
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-3 py-1 rounded-full font-medium">
                    {item.audience}
                  </span>
                )}
                {item.country && (
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-3 py-1 rounded-full font-medium">
                    {item.country}
                  </span>
                )}
                <span
                  className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    item.result?.successChance === "High"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : item.result?.successChance === "Medium"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                        : "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                  }`}
                >
                  {item.result?.successChance} chance
                </span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="text-slate-400 dark:text-slate-500 text-xs">
                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <span className="text-xs font-medium text-indigo-500 dark:text-indigo-400">
                  View report →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
