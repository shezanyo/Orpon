export const fmt = (n) => {
  const val = Number(n);
  return "৳" + (isNaN(val) ? 0 : val).toLocaleString("en-BD");
};

export const pct = (raised, goal) => {
  const g = Number(goal);
  const r = Number(raised);
  if (!g || isNaN(g) || g <= 0) return 0;
  if (isNaN(r) || r < 0) return 0;
  return Math.min(100, Math.round((r / g) * 100));
};

export const slugify = (text) =>
  String(text || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 40);