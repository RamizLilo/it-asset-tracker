/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)", surface: "var(--surface)", sunk: "var(--sunk)", line: "var(--line)",
        ink: "var(--ink)", mute: "var(--mute)", accent: "var(--accent)", "accent-soft": "var(--accent-soft)", "accent-ink": "var(--accent-ink)",
        ok: "var(--ok)", "ok-soft": "var(--ok-soft)", warn: "var(--warn)", "warn-soft": "var(--warn-soft)",
        bad: "var(--bad)", "bad-soft": "var(--bad-soft)", info: "var(--info)", "info-soft": "var(--info-soft)",
      },
    },
  },
  plugins: [],
};
