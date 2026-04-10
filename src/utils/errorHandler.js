import { AppError, ERROR_LEVEL, ERROR_STRATEGY } from './appError'

// 공통 에러 알림박스 함수
export const showErrorBox = (message) => {
  // 실제 UI 라이브러리(Alert, Toast, Modal 등) 연결
  alert(message)
}

/**
 * @param {AppError | Error} error
 * @param {Function} setErrorState - 컴포넌트 내부 에러 메시지 세팅용 (선택)
 */

// 에러 객체받아서 처리하는 함수
export const handleClientError = (error, setErrorState = null) => {
  // 1. 전략 가져오기 (커스텀 에러가 아니면 기본값 Error 레벨 적용)
  const level = error.level || ERROR_LEVEL.ERROR
  const strategy = ERROR_STRATEGY[level] || ERROR_STRATEGY[ERROR_LEVEL.ERROR]

  // 2. 기록 처리 (console.error / Sentry 연동)
  if (strategy.useLog) {
    console.error(`${strategy.prefix} ${error.name || 'UnknownError'}: ${error.message}`)
    if (error.data) console.log('Context Data:', error.data)

    //  Sentry 쓸거면: 레벨 1, 2는 여기서 Sentry 같은 외부 도구로 전송 로직 추가
    // if (level <= 2) Sentry.captureException(error);
  }

  // 3. 사용자 표시 처리
  if (strategy.showUI) {
    if (setErrorState) {
      setErrorState(error.message)
    } else {
      // 1단계(Critical)일 때만 더 강조하고 싶다면 여기서 분기 가능
      const uiMessage = level === ERROR_LEVEL.CRITICAL ? `[긴급] ${error.message}` : error.message
      showErrorBox(uiMessage)
    }
  }
}
