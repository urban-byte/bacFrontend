import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          background: '#0b0b0b',
          surface: '#121212',
          primary: '#42a5f5',
          error: '#ef5350',
        },
      },
    },
  },
})
