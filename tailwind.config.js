// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de cores da marca
        brand: {
          blue: '#011efe',      // Azul principal - CTAs, links, destaques
          dark: '#1a1a1a',      // Cinza escuro - textos principais
          black: '#000000',     // Preto - textos importantes
          gray: '#515151',      // Cinza médio - textos secundários
          light: '#aaaaaa',     // Cinza claro - textos terciários
          lighter: '#ededed',   // Cinza muito claro - backgrounds
        },
        // Cores de status mantidas
        status: {
          success: '#10b981',   // Verde para concluído
          warning: '#f59e0b',   // Amarelo para em andamento
          info: '#3b82f6',      // Azul para informações
          error: '#ef4444',     // Vermelho para erros
        }
      },
      // Animações para menu mobile
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-out': 'fadeOut 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}