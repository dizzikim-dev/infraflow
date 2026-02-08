/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ========================================
      // InfraFlow Custom Colors
      // ========================================
      colors: {
        // Background (Dark Mode)
        infra: {
          bg: {
            primary: '#0f172a',    // Slate 900 - Canvas
            secondary: '#1e293b',  // Slate 800 - Cards, Nodes
            tertiary: '#334155',   // Slate 700 - Inputs
            hover: '#475569',      // Slate 600 - Hover states
          },
          // Node Category Colors
          node: {
            security: '#ef4444',   // Red 500
            network: '#3b82f6',    // Blue 500
            compute: '#22c55e',    // Green 500
            cloud: '#8b5cf6',      // Purple 500
            storage: '#f59e0b',    // Amber 500
            auth: '#ec4899',       // Pink 500
          },
          // Flow Animation Colors
          flow: {
            request: '#60a5fa',    // Blue 400
            response: '#4ade80',   // Green 400
            blocked: '#f87171',    // Red 400
            encrypted: '#a78bfa',  // Purple 400
            sync: '#fb923c',       // Orange 400
          },
          // Text Colors
          text: {
            primary: '#f8fafc',    // Slate 50
            secondary: '#e2e8f0',  // Slate 200
            muted: '#94a3b8',      // Slate 400
            subtle: '#64748b',     // Slate 500
          },
          // Border Colors
          border: {
            DEFAULT: '#334155',    // Slate 700
            hover: '#475569',      // Slate 600
            focus: '#3b82f6',      // Blue 500
          },
          // Status Colors
          status: {
            success: '#22c55e',    // Green 500
            warning: '#f59e0b',    // Amber 500
            error: '#ef4444',      // Red 500
            info: '#3b82f6',       // Blue 500
          },
        },
      },

      // ========================================
      // Font Families
      // ========================================
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },

      // ========================================
      // Backdrop Blur
      // ========================================
      backdropBlur: {
        glass: '12px',
      },

      // ========================================
      // Box Shadows (Dark Mode Optimized)
      // ========================================
      boxShadow: {
        'infra-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'infra-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
        'infra-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
        'infra-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
        // Node Glow Effects
        'glow-security': '0 0 20px rgba(239, 68, 68, 0.3)',
        'glow-network': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-compute': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-cloud': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-storage': '0 0 20px rgba(245, 158, 11, 0.3)',
        'glow-auth': '0 0 20px rgba(236, 72, 153, 0.3)',
      },

      // ========================================
      // Border Radius
      // ========================================
      borderRadius: {
        'infra-sm': '4px',
        'infra-md': '6px',
        'infra-lg': '8px',
        'infra-xl': '12px',
        'infra-2xl': '16px',
      },

      // ========================================
      // Spacing (extends default)
      // ========================================
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },

      // ========================================
      // Transitions
      // ========================================
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
      },

      // ========================================
      // Animations
      // ========================================
      animation: {
        'flow-dash': 'dash 0.5s linear infinite',
        'flow-dash-reverse': 'dash 0.5s linear infinite reverse',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'fade-in': 'fadeIn 200ms ease-out',
      },
      keyframes: {
        dash: {
          to: {
            strokeDashoffset: '-10',
          },
        },
        fadeIn: {
          from: {
            opacity: '0',
          },
          to: {
            opacity: '1',
          },
        },
      },

      // ========================================
      // Z-Index Scale
      // ========================================
      zIndex: {
        'dropdown': '100',
        'sticky': '200',
        'modal': '300',
        'popover': '400',
        'tooltip': '500',
      },
    },
  },
  plugins: [
    // Add any required plugins here
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],
};
