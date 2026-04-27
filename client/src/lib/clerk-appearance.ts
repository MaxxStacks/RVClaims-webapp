import type { Appearance } from "@clerk/clerk-react";

export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: '#033280',
    colorBackground: '#ffffff',
    colorInputBackground: '#f8fafc',
    colorInputText: '#1a1a2e',
    colorForeground: '#1a1a2e',
    colorTextSecondary: '#64748b',
    borderRadius: '8px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  elements: {
    card: {
      boxShadow: 'none',
      border: '2px solid #033280',
    },
    headerTitle: {
      fontWeight: '700',
      fontSize: '24px',
    },
    formButtonPrimary: {
      backgroundColor: '#033280',
      '&:hover, &:focus, &:active': { backgroundColor: '#022160' },
    },
    socialButtonsBlockButton: {
      border: '1px solid #e2e8f0',
      '&:hover': { backgroundColor: '#f8fafc' },
    },
    footerActionLink: {
      color: '#033280',
    },
  },
};
