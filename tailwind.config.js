module.exports = {
  darkMode: 'class', // Ativa o modo dark via classe CSS
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores personalizadas para melhor contraste
        gray: {
          700: '#2d3748', // Corrige o cinza escuro
          800: '#1a202c', // Corrige o cinza mais escuro
          900: '#171923', // Corrige o cinza quase preto
        },
        // Azul para botões selecionados
        blue: {
          600: '#2563eb', // Melhor contraste no dark mode
        }
      },
      // Melhora as transições
      transitionDuration: {
        '200': '200ms', // Para os menus
        '300': '300ms', // Para o tema
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Para estilizar inputs/buttons (opcional)
  ],
}