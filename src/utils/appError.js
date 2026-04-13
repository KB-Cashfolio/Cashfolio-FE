// utils/AppError.js
export class AppError extends Error {
  constructor({ name, message, level = ERROR_LEVEL.ERROR, data = null }) {
    super(message)
    this.name = name
    this.level = level
    this.data = data
  }
}

// ErrorPolicy
export const ERROR_LEVEL = {
  CRITICAL: 1, // 시스템 중단, 즉시 해결
  ERROR: 2, // 기능 실패
  WARN: 3, // 데이터 이상, 사용자에게는 비밀
  INFO: 4, // 단순 정보 (인증 만료 등)
  DEBUG: 5, // 개발용
}

// 에러 레벨 별 전략
export const ERROR_STRATEGY = {
  [ERROR_LEVEL.CRITICAL]: { showUI: true, useLog: true, prefix: '🔥 [CRITICAL]' },
  [ERROR_LEVEL.ERROR]: { showUI: true, useLog: true, prefix: '🚨 [ERROR]' },
  [ERROR_LEVEL.WARN]: { showUI: false, useLog: true, prefix: '⚠️ [WARN]' },
  [ERROR_LEVEL.INFO]: { showUI: false, useLog: true, prefix: 'ℹ️ [INFO]' }, // 필요시 로그 기록
  [ERROR_LEVEL.DEBUG]: { showUI: false, useLog: false, prefix: '🔍 [DEBUG]' },
}
