import { describe, expect, it } from 'vitest'
import { isAdminMaster, isPoliceUser } from '../utils/roles'

describe('role helpers', () => {
  it('identifies ADMIN_MASTER role', () => {
    expect(isAdminMaster({ role: 'ADMIN_MASTER' })).toBe(true)
    expect(isAdminMaster({ role: 'POLICE' })).toBe(false)
  })

  it('identifies POLICE role', () => {
    expect(isPoliceUser({ role: 'POLICE' })).toBe(true)
    expect(isPoliceUser({ role: 'ADMIN_MASTER' })).toBe(false)
  })
})

