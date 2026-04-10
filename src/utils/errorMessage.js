// 시스템 에러 (인터셉터에서 사용)
export const API_ERROR_MESSAGES = {
  SERVER_ERROR: '서버에 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  UNAUTHORIZED: '로그인 세션이 만료되었습니다. 다시 로그인해주세요.',
  NETWORK_ERROR: '네트워크 연결 상태를 확인해주세요.',
  FORBIDDEN: '접근 권한이 없습니다.',
  NOT_FOUND: '요청하신 정보를 찾을 수 없습니다.',
}

// 비즈니스 로직 에러 (authService 등에서 사용)
export const AUTH_MESSAGES = {
  LOGIN_FAILED: '이메일 또는 비밀번호가 일치하지 않습니다.',
  DUPLICATE_EMAIL: '이미 존재하는 이메일입니다.',
  REGISTER_FAILED: '회원가입 중 오류가 발생했습니다.',
}
