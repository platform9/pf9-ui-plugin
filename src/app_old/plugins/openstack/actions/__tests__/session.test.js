import Session, {
  getPreferredRegion,
  getPreferredTenant,
  setCurrentSession,
} from '../session'
import { lastCall, mockDispatch } from '../../util/testUtils'

const mockedTenants = [
  { id: 1, name: 'admin' },
  { id: 2, name: 'foo' },
  { id: 3, name: 'service' },
  { id: 4, name: 'another' }
]

const mockedRegions = [
  { id: 'Main-Region' },
  { id: 'Another-Region' },
  { id: 'Yet-Another-Region' },
]

describe('getPreferredTenant', () => {
  it('should get the preferred tenant if it exists', () => {
    expect(getPreferredTenant(mockedTenants, 'another').name).toBe('another')
  })

  it('should get the first non-admin tenant if the perferred does not exist', () => {
    expect(getPreferredTenant(mockedTenants, 'non-existant tenant').name).toBe('foo')
  })

  it('should only return the admin network if it is the only one', () => {
    expect(getPreferredTenant([{ id: 1, name: 'admin' }], 'another').name).toBe('admin')
  })
})

describe('getPreferredRegion', () => {
  it('should get the preferred region if it exists', () => {
    const lastRegion = mockedRegions.find(x => x.id === 'Yet-Another-Region')
    expect(getPreferredRegion(mockedRegions, lastRegion)).toEqual(lastRegion)
  })

  it('should get the first available region if the preferred one does not exist', () => {
    const lastRegion = { id: 'Does-Not-Exist' }
    const firstRegion = mockedRegions[0]
    expect(getPreferredRegion(mockedRegions, lastRegion)).toEqual(firstRegion)
  })
})

describe('signIn', () => {
  let mockKeystone
  let mockSession
  const selectedTenant = mockedTenants.find(x => x.name === 'another')
  const selectedRegion = mockedRegions.find(x => x.id === 'Yet-Another-Region')
  const mockedScopedToken = {
    scopedToken: 'secretScopedToken',
    token: {
      roles: [
        { id: 'abc123', name: 'admin' },
      ],
      user: { id: '123', name: 'test@platform9.com' },
    }
  }

  beforeEach(() => {
    mockKeystone = {
      getUnscopedToken: jest.fn().mockResolvedValue('secretToken'),
      getScopedProjects: jest.fn().mockResolvedValue(mockedTenants),
      getScopedToken: jest.fn().mockResolvedValue(mockedScopedToken),
      getRegions: jest.fn().mockResolvedValue(mockedRegions)
    }
    mockSession = {
      setUnscopedToken: jest.fn(),
      setUsername: jest.fn(),
      getLastTenant: jest.fn().mockReturnValue('another'),
      getLastRegion: jest.fn().mockReturnValue(selectedRegion),
      getPreferredTenant: jest.fn().mockReturnValue(selectedTenant),
      setCurrentSession: jest.fn(),
      setStorage: jest.fn(),
      setTenants: jest.fn(),
    }
  })

  const performSignIn = () => {
    const session = Session(mockKeystone, mockSession)
    return session.signIn({ username: 'test@platform9.com', password: 'secret' })(mockDispatch)
  }

  it('gets an unscoped token', async () => {
    await performSignIn()
    expect(mockKeystone.getUnscopedToken).lastCalledWith('test@platform9.com', 'secret')
  })

  it('it sets some session variables', async () => {
    await performSignIn()
    expect(mockSession.setUnscopedToken).lastCalledWith('secretToken')
    expect(mockSession.setUsername).lastCalledWith('test@platform9.com')
  })

  it('choses a default tenant', async () => {
    await performSignIn()
    expect(mockKeystone.getScopedProjects).toHaveBeenCalled()
    expect(mockSession.getLastTenant).toHaveBeenCalled()
    expect(mockSession.getPreferredTenant).toHaveBeenCalled()
  })

  it('gets the scopedToken for the chosen tenant', async () => {
    await performSignIn()
    expect(mockKeystone.getScopedToken).toHaveBeenCalled()
    expect(lastCall(mockSession.setCurrentSession)[0]).toMatchObject({
      scopedToken: 'secretScopedToken',
      user: mockedScopedToken.token.user,
      roles: mockedScopedToken.token.roles,
    })
  })

  it('sets the session and tenants', async () => {
    await performSignIn()
    expect(lastCall(mockSession.setCurrentSession)[0]).toMatchObject({ tenant: selectedTenant })
    expect(mockSession.setTenants).toHaveBeenCalledWith(mockedTenants)
  })

  it('chooses a default region', async () => {
    await performSignIn()
    expect(mockKeystone.getRegions).toHaveBeenCalled()
    expect(lastCall(mockSession.setCurrentSession)[0]).toMatchObject({ region: selectedRegion })
  })

  it('stores the chosen tenant and region', async () => {
    await performSignIn()
    expect(mockSession.setStorage).toHaveBeenCalledWith(`last-tenant-accessed-test@platform9.com`, selectedTenant.name)
    expect(mockSession.setStorage).toHaveBeenCalledWith(`last-region-accessed-test@platform9.com`, selectedRegion)
  })

  it('does not continue if there are bad credentials', async () => {
    const mockKeystoneWithBadCredentials = {
      ...mockKeystone,
      getUnscopedToken: () => Promise.resolve(null)
    }
    const mockSession2 = {
      ...mockSession,
      setUnscopedToken: jest.fn(),
    }
    const session = Session(mockKeystoneWithBadCredentials, mockSession2)
    await session.signIn({ username: 'test@platform9.com', password: 'secret' })(mockDispatch)
    expect(mockSession2.setUnscopedToken).not.toHaveBeenCalled()
  })

  it('logs in with MFA credentials', async () => {
    const mockKeystone2 = {
      ...mockKeystone,
      getUnscopedToken: jest.fn(),
    }
    const session = Session(mockKeystone2, mockSession)
    await session.signIn({ username: 'test@platform9.com', password: 'secret', mfa: 'mfa' })(mockDispatch)
    expect(mockKeystone2.getUnscopedToken).toHaveBeenCalledWith('test@platform9.com', 'secretmfa')
  })
})

describe('setCurrentSession', () => {
  it('generates the setcurrentSession flux action', () => {
    const action = setCurrentSession({})
    expect(action.type).toEqual('SET_CURRENT_SESSION')
  })
})

describe('Session', () => {
  it('returns a session object with functions bound to mocks if needs be', () => {
    const session = Session()
    expect(session.authenticate).toBeDefined()
  })
})
