/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Institutional Heritage & Network Modernity Palette
        navy: {
          50: '#F0F5FA',
          100: '#D2E4FF',
          800: '#0F172A',
          900: '#0A2540',
          950: '#000F22',
        },
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#006A61',
        },
        stitch: {
          surface: '#F8F9FF',
          'surface-dim': '#CBDBF5',
          'surface-bright': '#F8F9FF',
          'surface-lowest': '#FFFFFF',
          'surface-low': '#EFF4FF',
          'surface-container': '#E5EEFF',
          'surface-high': '#DCE9FF',
          'surface-highest': '#D3E4FE',
          'on-surface': '#0B1C30',
          'on-surface-variant': '#43474D',
          'inverse-surface': '#213145',
          outline: '#74777E',
          'outline-variant': '#C4C6CE',
          primary: '#000F22',
          'primary-container': '#0A2540',
          secondary: '#006A61',
          'secondary-container': '#86F2E4',
          tertiary: '#000C30',
          'tertiary-container': '#001F5D',
          success: '#059669',
          warning: '#D97706',
          error: '#BA1A1A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        layer1: '0px 1px 3px rgba(15, 23, 42, 0.04), 0px 1px 2px rgba(15, 23, 42, 0.02)',
        layer2: '0px 4px 6px -1px rgba(15, 23, 42, 0.06), 0px 2px 4px -2px rgba(15, 23, 42, 0.04)',
        layer3: '0px 20px 25px -5px rgba(15, 23, 42, 0.1), 0px 8px 10px -6px rgba(15, 23, 42, 0.05)',
      },
      borderRadius: {
        micro: '0.25rem', // 4px
        base: '0.375rem',  // 6px
        card: '0.5rem',    // 8px
        pill: '9999px',
      },
    },
  },
  plugins: [],
};
