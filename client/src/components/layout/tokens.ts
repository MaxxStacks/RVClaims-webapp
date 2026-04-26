// Single source of truth for layout dimensions, colors, typography
// All sidebars + AppBar pull from here so styling is consistent

export const LAYOUT = {
  appBarHeight: 56,
  mainNavWidth: 240,
  contextualSidebarWidth: 260,

  // Colors
  navy: "#033280",
  navyLight: "#eaf1fb",
  navyBg: "#f0f5ff",
  green: "#0cb22c",
  borderLight: "#e5eaf2",
  borderLighter: "#f0f2f5",
  bgPage: "#f7f9fc",
  bgWhite: "white",

  // Text
  textPrimary: "#222",
  textSecondary: "#666",
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
