import { useState } from "react";

export default function Auth({ onLogin, darkMode, onToggleTheme }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = isLogin ? "login" : "register";
      const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) return setError(data.error);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app flex flex-col items-center justify-center px-4 py-12 transition-colors duration-300 relative">
      <button
        type="button"
        onClick={onToggleTheme}
        className="btn-secondary absolute top-4 right-4 sm:top-6 sm:right-6"
        aria-label="Toggle theme"
      >
        {darkMode ? "Light" : "Dark"}
      </button>

      <div className="mb-8 text-center animate-fade-in">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white font-display text-xl font-bold shadow-soft-lg">
          AI
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
          AI Startup Validator
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base">
          Powered by Groq AI
        </p>
      </div>

      <div className="card p-6 sm:p-8 w-full max-w-md animate-slide-up">
        <h2 className="font-display text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white mb-1">
          {isLogin ? "Welcome back" : "Create account"}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          {isLogin ? "Login to validate your startup ideas" : "Sign up to get started"}
        </p>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-300 text-sm px-4 py-2.5 rounded-xl mb-4 border border-red-100 dark:border-red-900/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="label-field">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="input-field"
              />
            </div>
          )}
          <div>
            <label className="label-field">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="input-field"
            />
          </div>
          <div>
            <label className="label-field">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="input-field"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 dark:text-indigo-400 font-medium ml-1 hover:underline"
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
