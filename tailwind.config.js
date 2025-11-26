/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tema Oficina de Motos
        primary: {
          DEFAULT: '#DC2626', // Vermelho vibrante
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        moto: {
          // Cinza escuro (metal/asfalto)
          dark: '#1F2937',
          darker: '#111827',
          darkest: '#0F172A',
          // Laranja (energia/velocidade)
          orange: '#F97316',
          orangeLight: '#FB923C',
          orangeDark: '#EA580C',
          // Amarelo (atenção/destaque)
          yellow: '#FBBF24',
          yellowLight: '#FCD34D',
          yellowDark: '#F59E0B',
          // Cinza claro (metal polido)
          steel: '#6B7280',
          steelLight: '#9CA3AF',
          steelDark: '#4B5563',
        },
        accent: {
          orange: '#F97316',
          yellow: '#FBBF24',
          red: '#DC2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Rajdhani', 'Roboto Condensed', 'sans-serif'], // Fonte mais mecânica
        display: ['Orbitron', 'sans-serif'], // Fonte futurista para números/destaque
      },
      boxShadow: {
        'moto': '0 4px 6px -1px rgba(220, 38, 38, 0.1), 0 2px 4px -1px rgba(220, 38, 38, 0.06)',
        'moto-lg': '0 10px 15px -3px rgba(220, 38, 38, 0.1), 0 4px 6px -2px rgba(220, 38, 38, 0.05)',
      },
    },
  },
  plugins: [],
}
