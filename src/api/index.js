import axios from 'axios'
import { setupResponseInterceptor } from '@/utils/interceptors'

const api = axios.create({
  baseURL: 'http://localhost:3000', // json-server 기본 주소
  headers: {
    'Content-Type': 'application/json',
  },
})

//api 호출시 에러 검출
setupResponseInterceptor(api)

export default api
