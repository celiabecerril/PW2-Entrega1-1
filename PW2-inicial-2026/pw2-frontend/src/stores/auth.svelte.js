

function createAuthStore() {
  
  let token = $state(localStorage.getItem('token') || null)
  let user = $state(JSON.parse(localStorage.getItem('user') || 'null'))

  
  const isAuthenticated = $derived(!!token)
  const isAdmin = $derived(user?.role === 'admin')
  const displayName = $derived(user?.username || '')

  function setAuth(newToken, newUser) {
    token = newToken
    user = newUser
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  function logout() {
    token = null
    user = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return {
    get token() { return token },
    get user() { return user },
    get isAuthenticated() { return isAuthenticated },
    get isAdmin() { return isAdmin },
    get displayName() { return displayName },
    setAuth,
    logout
  }
}

export const auth = createAuthStore()
