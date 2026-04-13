import api from './index'
import { AppError } from '@/utils/AppError'
import { ERROR_CODES } from '@/utils/errorCodes'

/* =========================
   🎮 캐릭터 서비스
========================= */
export const characterService = {
  async getCharacterList() {
    return await api.get('/beggars')
  },

  async increaseExp(id, amount) {
    if (!id) {
      throw new AppError({
        code: ERROR_CODES.BAD_REQUEST,
        message: '유저 ID 필요',
      })
    }

    return await api.patch(`/users/${id}`, {
      current_exp: amount,
    })
  },
}