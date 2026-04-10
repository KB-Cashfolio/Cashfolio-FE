import api from './index'
import { API_ERROR_MESSAGES } from '@/utils/ErrorMessage'
import { AppError, ERROR_LEVEL } from '@/utils/appError'

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    let errorInstance

    // 상태 코드에 따라 레벨과 메시지를 객체화
    switch (status) {
      case 401:
        errorInstance = new AppError({
          name: 'UNAUTHORIZED',
          message: API_ERROR_MESSAGES.UNAUTHORIZED,
          level: ERROR_LEVEL.INFO, // 4단계: 알림창 없이 로그만 (필요시 핸들러에서 이동 로직 추가)
        })
        localStorage.removeItem('user')
        break

      case 403:
        errorInstance = new AppError({
          name: 'FORBIDDEN',
          message: API_ERROR_MESSAGES.FORBIDDEN,
          level: ERROR_LEVEL.ERROR, // 2단계: 알림창 O, 로그 O
        })
        break

      case 500:
        errorInstance = new AppError({
          name: 'SERVER_ERROR',
          message: API_ERROR_MESSAGES.SERVER_ERROR,
          level: ERROR_LEVEL.CRITICAL, // 1단계: 강한 경고
        })
        break

      default:
        if (!status) {
          errorInstance = new AppError({
            name: 'NETWORK_ERROR',
            message: API_ERROR_MESSAGES.NETWORK_ERROR,
            level: ERROR_LEVEL.CRITICAL,
          })
        } else {
          errorInstance = new AppError({
            name: 'UNKNOWN_ERROR',
            message: '알 수 없는 오류가 발생했습니다.',
            level: ERROR_LEVEL.ERROR,
          })
        }
        break
    }

    // 인터셉터는 직접 UI를 띄우지 않고, 규격화된 에러 객체만 던집니다.
    return Promise.reject(errorInstance)
  },
)
