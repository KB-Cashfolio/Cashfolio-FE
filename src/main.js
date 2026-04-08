import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// CSS 파일 로드 (변수 -> 공통 스타일)
import '@/assets/css/variables.css'
import '@/assets/css/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
