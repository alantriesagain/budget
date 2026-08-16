/**
 * centavo theme: single source of every color, size, and shadow.
 * Token names generate the CSS variables uix components and the theme-token
 * tailwind utilities consume (color.primary -> --color-primary -> bg-primary).
 */
const fontFamily = "'Manrope', system-ui, -apple-system, sans-serif";

export default {
  font: {
    family: fontFamily,
    heading: fontFamily,
    google: ["Manrope"],
    handwriting: "'Caveat', cursive",
    size: "16px",
    icon: { family: "lucide" },
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    black: "800",
  },

  link: { color: "#0f766e" },

  text: {
    color: "#1a1a1a",
    secondary: "#454e5c",
    muted: "#64748b",
    disabled: "#9ca3af",
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.5rem",
  },

  background: { color: "#f6f4ef" },

  color: {
    primary: "#0f766e",
    "primary-light": "#2dd4bf",
    "primary-dark": "#115e59",
    accent: "#f97316",
    "text-primary": "#1a1a1a",
    "text-secondary": "#454e5c",
    "text-muted": "#64748b",
    secondary: "#f97316",
    "secondary-light": "#fb923c",
    "secondary-dark": "#ea580c",
    success: "#22c55e",
    "success-light": "#4ade80",
    "success-dark": "#16a34a",
    danger: "#ef4444",
    "danger-light": "#f87171",
    "danger-dark": "#dc2626",
    warning: "#f59e0b",
    "warning-light": "#fbbf24",
    info: "#3b82f6",
    "info-light": "#60a5fa",
    canvas: "#f6f4ef",
    surface: "#ffffff",
    "surface-light": "#f9fafb",
    "surface-dark": "#eef0f2",
    hover: "#f3f4f6",
    focus: "#14b8a6",
    inverse: "#ffffff",
    "inverse-dark": "#1a1a1a",
    gain: "#15803d",
    "gain-tint": "#dcfce7",
    spend: "#b91c1c",
    "spend-tint": "#fee2e2",
  },

  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    "2xl": "2rem",
    "3xl": "3rem",
  },

  leading: {
    tight: "1.1",
    normal: "1.5",
    relaxed: "1.75",
  },

  radius: {
    none: "0",
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    panel: "1rem",
    full: "9999px",
  },

  shadow: {
    none: "none",
    sm: "0 1px 2px rgba(0, 0, 0, 0.06)",
    md: "0 2px 8px rgba(0, 0, 0, 0.08)",
    lg: "0 6px 20px rgba(0, 0, 0, 0.1)",
    xl: "0 12px 32px rgba(0, 0, 0, 0.12)",
  },

  border: {
    width: "1px",
    color: "#e2e8f0",
  },

  dark: {
    link: { color: "#5eead4" },

    text: {
      color: "#ece9e2",
      secondary: "#b8bdb2",
      muted: "#8b9086",
      disabled: "#5c6157",
    },

    background: { color: "#151813" },

    color: {
      primary: "#2dd4bf",
      canvas: "#151813",
      surface: "#1e221c",
      "surface-light": "#242822",
      "surface-dark": "#181b16",
      hover: "#262a24",
      inverse: "#151813",
      "inverse-dark": "#ece9e2",
      gain: "#4ade80",
      "gain-tint": "#14301f",
      spend: "#f87171",
      "spend-tint": "#3a1717",
    },

    border: { color: "#32362f" },
  },
};
