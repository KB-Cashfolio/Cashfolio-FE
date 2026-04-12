// utils/AppError.js

export class AppError extends Error {
  constructor({
    code,
    message,
    status = null,
    level = 'error',
    handled = false,
  }) {
    super(message)

    this.code = code
    this.status = status
    this.level = level
    this.handled = handled
  }
}