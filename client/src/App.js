import { useState, useEffect, useCallback } from "react";
import IdeaForm from "./components/IdeaForm";
import Report from "./components/Report";
import Auth from "./components/Auth";
import History from "./components/History";
import Analytics from "./components/Analytics";

function getReportIdFromPath() {
  const match = window.location.pathname.match(/^\/report\/([^/]+)\/?$/);
  return match ? match[1] : null;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [page, setPage] = useState("home");
  const [historyIdeas, setHistoryIdeas] = useState(null);
  const [sharedId, setSharedId] = useState(() => getReportIdFromPath());
  const [sharedReport, setSharedReport] = useState(null);
  const [sharedLoading, setSharedLoading] = useState(!!getReportIdFromPath());
  const [sharedError, setSharedError] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const onPopState = () => {
      const id = getReportIdFromPath();
      setSharedId(id);
      if (!id) setSharedReport(null);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!sharedId) {
      setSharedReport(null);
      setSharedLoading(false);
      setSharedError("");
      return;
    }
    let cancelled = false;
    const load = async () => {
      setSharedLoading(true);
      setSharedError("");
      try {
        const res = await fetch(`http://localhost:5000/api/ideas/${sharedId}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || data.error) {
          setSharedError(data.error || "Report not found");
          setSharedReport(null);
        } else {
          setSharedReport(data);
        }
      } catch {
        if (!cancelled) {
          setSharedError("Failed to load report");
          setSharedReport(null);
        }
      } finally {
        if (!cancelled) setSharedLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [sharedId]);

  const fetchHistory = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/api/ideas/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHistoryIdeas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setHistoryIdeas([]);
    }
  }, []);

  useEffect(() => {
    if (user && !sharedId) fetchHistory();
  }, [user, sharedId, fetchHistory]);

  const toggleTheme = () => setDarkMode((d) => !d);

  const navigateHome = () => {
    window.history.pushState({}, "", "/");
    setSharedId(null);
    setSharedReport(null);
    setPage("home");
  };

  const openSharedReport = (id) => {
    window.history.pushState({}, "", `/report/${id}`);
    setSharedId(id);
  };

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setResult(null);
    setFormData(null);
    setReportId(null);
    setHistoryIdeas(null);
    setPage("home");
  };

  const handleSubmit = async (data) => {
    setLoading(true);
    setResult(null);
    setReportId(null);
    setFormData(data);
    try {
      const res = await fetch("http://localhost:5000/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const validationResult = await res.json();
      if (validationResult.error) {
        console.error(validationResult);
        return;
      }
      setResult(validationResult);

      const token = localStorage.getItem("token");
      if (token) {
        const saveRes = await fetch("http://localhost:5000/api/ideas/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...data, result: validationResult }),
        });
        const saved = await saveRes.json();
        if (saved?._id) setReportId(saved._id);
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFromHistory = (item) => {
    setResult(item.result);
    setFormData({
      idea: item.idea,
      industry: item.industry,
      audience: item.audience,
      budget: item.budget,
      country: item.country,
    });
    setReportId(item._id);
    setPage("home");
    window.history.pushState({}, "", "/");
    setSharedId(null);
  };

  // Shared report route — accessible without requiring re-auth for demos
  if (sharedId) {
    return (
      <div className="min-h-screen bg-app px-4 py-8 sm:py-12 transition-colors duration-300">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 animate-fade-in">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500 mb-1">
                Shared Report
              </p>
              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                AI Startup Validator
              </h1>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={toggleTheme} className="btn-secondary">
                {darkMode ? "Light" : "Dark"}
              </button>
              <button type="button" onClick={navigateHome} className="btn-ghost">
                {user ? "← Dashboard" : "← Home"}
              </button>
            </div>
          </div>

          {sharedLoading && (
            <div className="card p-12 text-center animate-pulse-soft">
              <p className="text-slate-500 dark:text-slate-400">Loading report...</p>
            </div>
          )}

          {sharedError && !sharedLoading && (
            <div className="card p-10 text-center animate-slide-up">
              <p className="text-slate-800 dark:text-white font-medium mb-2">Report unavailable</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{sharedError}</p>
              <button type="button" onClick={navigateHome} className="btn-primary px-6 py-2.5">
                Go home
              </button>
            </div>
          )}

          {sharedReport && !sharedLoading && (
            <>
              {sharedReport.idea && (
                <div className="card p-5 sm:p-6 mb-2 animate-slide-up">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
                    Startup idea
                  </p>
                  <p className="text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
                    {sharedReport.idea}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {sharedReport.industry && (
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-3 py-1 rounded-full">
                        {sharedReport.industry}
                      </span>
                    )}
                    {sharedReport.audience && (
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-3 py-1 rounded-full">
                        {sharedReport.audience}
                      </span>
                    )}
                    {sharedReport.country && (
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-3 py-1 rounded-full">
                        {sharedReport.country}
                      </span>
                    )}
                  </div>
                </div>
              )}
              <Report
                data={sharedReport.result}
                meta={sharedReport}
                reportId={sharedReport._id}
              />
            </>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Auth onLogin={handleLogin} darkMode={darkMode} onToggleTheme={toggleTheme} />
    );
  }

  if (page === "history") {
    return (
      <History
        onBack={() => setPage("home")}
        onOpenReport={handleOpenFromHistory}
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className="min-h-screen bg-app px-4 py-8 sm:py-12 transition-colors duration-300">
      {/* Navbar */}
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4 mb-8 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-display text-sm font-bold shadow-soft">
            AI
          </div>
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              AI Startup Validator
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Welcome, {user.name}!
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="btn-secondary"
            aria-label="Toggle theme"
          >
            {darkMode ? "Light" : "Dark"}
          </button>
          <button
            type="button"
            onClick={() => setPage("history")}
            className="btn-ghost"
          >
            History
          </button>
          <button type="button" onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
      </div>

      <Analytics ideas={historyIdeas} />

      <IdeaForm onSubmit={handleSubmit} loading={loading} />

      {loading && (
        <div className="max-w-5xl mx-auto mt-6 card p-6 text-center animate-pulse-soft">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Running AI analysis — this usually takes a few seconds...
          </p>
        </div>
      )}

      {result && (
        <Report
          data={result}
          meta={formData || {}}
          reportId={reportId}
          onViewShared={() => reportId && openSharedReport(reportId)}
        />
      )}
    </div>
  );
}
