import { DEFAULT_AVATAR, DEFAULT_USERNAME } from '@/constants/api'

export const getName = (username: string | undefined) => {
  return username ? username : DEFAULT_USERNAME
}

export const getAvatar = () => {
  return DEFAULT_AVATAR
}
