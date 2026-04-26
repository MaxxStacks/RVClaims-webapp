// Single source of truth for layout dimensions, colors, typography
// All sidebars + AppBar pull from here so styling is consistent

export const LAYOUT = {
  appBarHeight: 56,
  mainNavWidth: 240,
  contextualSidebarWidth: 260,

  // Colors
  navy: "#033280",
  navyLight: "#eff6ff",
  navyBg: "#f5f6f8",
  green: "#22c55e",
  borderLight: "#e5e7eb",
  borderLighter: "#f0f0f0",
  bgPage: "#f5f6f8",
  bgWhite: "white",

  // Text
  textPrimary: "#111",
  textSecondary: "#555",
  textMuted: "#888",
  textLabel: "#888",

  // Sidebar item
  sidebarItemPaddingY: 10,
  sidebarItemPaddingX: 16,
  sidebarSectionLabelSize: 11,
  sidebarItemFontSize: 13,
  sidebarItemMutedSize: 10,

  // Status badge colors
  statusActive: "#16a34a",
  statusActiveBg: "#dcfce7",
  statusActiveText: "#166534",
  statusPending: "#f48120",
  statusPendingBg: "#fef3c7",
  statusPendingText: "#92400e",
  statusExpired: "#c0392b",
  statusExpiredBg: "#fee2e2",
  statusExpiredText: "#991b1b",
  statusMuted: "#888",
  statusMutedBg: "#f0f2f5",
  statusMutedText: "#666",
} as const;
