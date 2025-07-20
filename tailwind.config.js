/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Background colors
        'bg-primary': '#FFFFFF',
        'bg-card': '#F9F5F4',
        'bg-highlight': '#EEF8F7',
        'bg-appbar': '#FFFFFF',
        
        // Text colors
        'text-primary': '#000000',
        'text-secondary': '#6D6D6D',
        'text-muted': '#A3A3A3',
        'text-positive': '#4ECDC4',
        'text-danger': '#FF6B6B',
        
        // Card colors
        'card-bg': '#F9F5F4',
        'card-border': '#E0E0E0',
        'card-title': '#000000',
        'card-subtext': '#6D6D6D',
        
        // Button colors
        'btn-primary': '#4ECDC4',
        'btn-primary-hover': '#3DB9B2',
        'btn-primary-active': '#37A29F',
        'btn-primary-disabled': '#A3A3A3',
        'btn-secondary': '#F0F0F0',
        'btn-secondary-hover': '#E5E5E5',
        
        // Icon colors
        'icon-default': '#000000',
        'icon-default-bg': '#F4F4F4',
        'icon-profile-container': '#E0E0E0',
        'icon-profile': '#000000',
        
        // Navigation colors
        'nav-icon': '#A3A3A3',
        'nav-icon-active': '#4ECDC4',
        'nav-bg': '#FFFFFF',
        
        // Chart colors
        'chart-line': '#4ECDC4',
        'chart-grid': '#E5E5E5',
        'chart-bg': '#FFFFFF',
        'chart-point': '#78EFEF',
        
        // Border colors
        'border-default': '#E0E0E0',
        'border-input': '#D3D3D3',
      },
      boxShadow: {
        'card': '0px 4px 12px rgba(0, 0, 0, 0.05)',
        'card-hover': '0px 6px 16px rgba(0, 0, 0, 0.08)',
        'floating': '0px 6px 20px rgba(0, 0, 0, 0.1)',
        'nav': '0px -2px 8px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'card': '20px',
      },
      transitionProperty: {
        'transform': 'transform',
      },
      scale: {
        '102': '1.02',
      },
    },
  },
  plugins: [],
} 