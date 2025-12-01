import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
// 👇 ADD THESE:
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives,
})

// 👇 mount with Vuetify
createApp(App).use(vuetify).mount('#app')
