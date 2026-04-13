import { AppError } from '@/utils/AppError'
import { ERROR_CODES } from './errorCodes'

export const setupResponseInterceptor = (api) => {
  api.interceptors.response.use(
    (res) => res,

    (error) => {
      const status = error.response?.status
      const data = error.response?.data

      /* =========================
         🔥 1️⃣ 401 → 인증 만료
      ========================= */
      if (status === 401) {
        localStorage.removeItem('user')

        return Promise.reject(
          new AppError({
            code: ERROR_CODES.UNAUTHORIZED,
            message: '세션이 만료되었습니다. 다시 로그인해주세요.',
            status,
            level: 'warning',
            handled: true,
          })
        )
      }

      /* =========================
         🔥 2️⃣ 네트워크 에러
      ========================= */
      if (!error.response) {
        return Promise.reject(
          new AppError({
            code: ERROR_CODES.NETWORK_ERROR,
            message: '서버에 연결할 수 없습니다.',
            level: 'error',
          })
        )
      }

      /* =========================
         🔥 3️⃣ 상태코드별 메시지
      ========================= */
      const statusMessages = {
        400: '잘못된 요청입니다.',
        403: '접근 권한이 없습니다.',
        404: '요청한 데이터를 찾을 수 없습니다.',
        409: '데이터 충돌이 발생했습니다.',
        422: '입력값이 올바르지 않습니다.',
        500: '서버 내부 오류가 발생했습니다.',
        503: '서비스를 사용할 수 없습니다.',
      }

      /* =========================
         🔥 4️⃣ 서버 메시지 우선
      ========================= */
      let message =
        data?.message ||
        data?.error ||
        statusMessages[status] ||
        '알 수 없는 오류가 발생했습니다.'

      /* =========================
         🔥 5️⃣ 에러 코드 매핑
      ========================= */
      let code = ERROR_CODES.UNKNOWN_ERROR

      if (status === 400) code = ERROR_CODES.BAD_REQUEST
      else if (status === 403) code = ERROR_CODES.FORBIDDEN
      else if (status === 404) code = ERROR_CODES.NOT_FOUND
      else if (status === 409) code = ERROR_CODES.CONFLICT
      else if (status === 422) code = ERROR_CODES.VALIDATION_ERROR
      else if (status === 500) code = ERROR_CODES.SERVER_ERROR

      /* =========================
         🔥 6️⃣ 에러 레벨 설정
      ========================= */
      let level = 'error'

      if (status >= 500) level = 'fatal'
      else if (status >= 400) level = 'warning'

      /* =========================
         🔥 7️⃣ 최종 AppError 생성
      ========================= */
      const appError = new AppError({
        code,
        message,
        status,
        level,
        handled: false,
      })

      /* =========================
         🔥 8️⃣ 디버깅 로그 (개발용)
      ========================= */
      if (process.env.NODE_ENV === 'development') {
        console.error('[API ERROR]', {
          status,
          message,
          url: error.config?.url,
          method: error.config?.method,
          data,
        })
      }

      return Promise.reject(appError)
    }
  )
}