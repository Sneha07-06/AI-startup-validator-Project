import { useState } from "react";

const industries = [
  "Technology", "Education", "Health", "Finance",
  "Food & Beverage", "E-commerce", "Entertainment", "Other"
];

const budgets = ["Low (under $1000)", "Medium ($1000–$10,000)", "High ($10,000+)"];

export default function IdeaForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    idea: "",
    industry: "",
    audience: "",
    budget: "",
    country: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.idea || !form.industry || !form.audience) return;
    onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card p-6 sm:p-8 w-full max-w-5xl mx-auto animate-slide-up"
    >
      <div className="mb-6">
        <h2 className="font-display text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white mb-1">
          Validate your startup idea
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Get an AI-powered analysis in seconds
        </p>
      </div>

      <div className="mb-5">
        <label className="label-field">
          Your startup idea <span className="text-red-400">*</span>
        </label>
        <textarea
          name="idea"
          value={form.idea}
          onChange={handleChange}
          rows={3}
          placeholder="e.g. An app that delivers homemade food for college students"
          className="input-field resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="label-field">
            Industry <span className="text-red-400">*</span>
          </label>
          <select
            name="industry"
            value={form.industry}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select industry</option>
            {industries.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-field">Budget</label>
          <select
            name="budget"
            value={form.budget}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select budget</option>
            {budgets.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="label-field">
            Target audience <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="audience"
            value={form.audience}
            onChange={handleChange}
            placeholder="e.g. College students"
            className="input-field"
          />
        </div>

        <div>
          <label className="label-field">Country / Market</label>
          <input
            type="text"
            name="country"
            value={form.country}
            onChange={handleChange}
            placeholder="e.g. India, USA"
            className="input-field"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3.5 relative overflow-hidden"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analyzing your idea...
          </span>
        ) : (
          "Validate my idea →"
        )}
      </button>
    </form>
  );
}
