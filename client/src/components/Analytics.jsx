import { useMemo } from "react";

function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`card card-hover p-5 animate-slide-up ${accent || ""}`}>
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
        {label}
      </p>
      <p className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white truncate">
        {value}
      </p>
      {sub && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">{sub}</p>
      )}
    </div>
  );
}

function ScoreBars({ ideas }) {
  const buckets = useMemo(() => {
    const ranges = [
      { label: "0–4", min: 0, max: 4, color: "bg-red-400" },
      { label: "5–6", min: 5, max: 6, color: "bg-amber-400" },
      { label: "7–8", min: 7, max: 8, color: "bg-indigo-400" },
      { label: "9–10", min: 9, max: 10, color: "bg-emerald-400" },
    ];
    return ranges.map((r) => ({
      ...r,
      count: ideas.filter((i) => {
        const s = Number(i.result?.score) || 0;
        return s >= r.min && s <= r.max;
      }).length,
    }));
  }, [ideas]);

  const max = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <div className="card p-5 sm:p-6 animate-slide-up">
      <h3 className="font-display text-base font-semibold text-slate-800 dark:text-slate-100 mb-4">
        Score distribution
      </h3>
      <div className="space-y-3">
        {buckets.map((b) => (
          <div key={b.label} className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-8 shrink-0">
              {b.label}
            </span>
            <div className="flex-1 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${b.color} transition-all duration-700 ease-out`}
                style={{ width: `${(b.count / max) * 100}%`, minWidth: b.count ? "6px" : "0" }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-5 text-right">
              {b.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Analytics({ ideas }) {
  const stats = useMemo(() => {
    if (!ideas?.length) return null;

    const scores = ideas.map((i) => Number(i.result?.score) || 0);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highest = ideas.reduce((best, cur) =>
      Number(cur.result?.score) > Number(best.result?.score) ? cur : best
    );

    const industryCount = {};
    ideas.forEach((i) => {
      const ind = i.industry || "Other";
      industryCount[ind] = (industryCount[ind] || 0) + 1;
    });
    const topIndustry = Object.entries(industryCount).sort((a, b) => b[1] - a[1])[0];

    return {
      total: ideas.length,
      avg: avg.toFixed(1),
      highestScore: highest.result?.score,
      highestIdea: highest.idea,
      topIndustry: topIndustry?.[0] || "—",
      topIndustryCount: topIndustry?.[1] || 0,
    };
  }, [ideas]);

  if (!ideas) {
    return (
      <div className="w-full max-w-5xl mx-auto mb-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-5 h-24 animate-pulse-soft bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="w-full max-w-5xl mx-auto mb-8 card p-6 text-center animate-fade-in">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Validate your first idea to unlock analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto mb-8 space-y-4">
      <div className="flex items-end justify-between gap-4 px-0.5">
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Analytics
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Insights from your validated ideas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Ideas validated" value={stats.total} />
        <StatCard label="Average score" value={stats.avg} sub="out of 10" />
        <StatCard
          label="Highest score"
          value={stats.highestScore}
          sub={stats.highestIdea}
        />
        <StatCard
          label="Top industry"
          value={stats.topIndustry}
          sub={`${stats.topIndustryCount} idea${stats.topIndustryCount === 1 ? "" : "s"}`}
        />
      </div>

      <ScoreBars ideas={ideas} />
    </div>
  );
}
