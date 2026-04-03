export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore']], // type 강제
    'subject-case': [0], // 대소문자 자유
    'scope-empty': [2, 'never'], // 스코프 2글자 이상강제
  },
}
