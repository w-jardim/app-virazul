import type { AuthUser } from '../types/auth.types'

export const isAdminMaster = (user: Pick<AuthUser, 'role'> | null | undefined): boolean => {
  return user?.role === 'ADMIN_MASTER'
}

export const isPoliceUser = (user: Pick<AuthUser, 'role'> | null | undefined): boolean => {
  return user?.role === 'POLICE'
}

