export const fmt = (n) => "৳" + n.toLocaleString("en-BD");

export const pct = (raised, goal) => Math.min(100, Math.round((raised / goal) * 100));

export const slugify = (text) =>
  text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 40);