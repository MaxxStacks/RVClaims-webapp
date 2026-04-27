import type { Appearance } from "@clerk/clerk-react";

export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: '#033280',
    colorText: '#1a1a2e',
    colorTextSecondary: '#64748b',
    colorBackground: '#ffffff',
    colorInputBackground: '#f8fafc',
    colorInputText: '#1a1a2e',
    borderRadius: '8px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  elements: {
    card: {
      boxShadow: 'none',
      border: '1px solid #e2e8f0',
    },
    headerTitle: {
      fontWeight: '700',
      fontSize: '24px',
    },
    formButtonPrimary: {
      backgroundColor: '#033280',
    },
    socialButtonsBlockButton: {
      border: '1px solid #e2e8f0',
    },
    footerActionLink: {
      color: '#033280',
    },
  },
};
