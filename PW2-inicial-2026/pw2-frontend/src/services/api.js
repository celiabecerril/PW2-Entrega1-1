
const BASE = '/api'

async function request(path, options = {}, token = null) {
  const headers = { ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw { status: res.status, message: err.error || err.message || 'Error desconocido' }
  }

  if (res.status === 204) return null
  return res.json()
}

export async function login(username, password) {
  return request('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
}

export async function register(username, password) {
  return request('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
}

export async function getProducts({ page = 1, limit = 12 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  return request(`/productos?${params}`)
}

export async function createProduct(formData, token) {
  return request('/productos', { method: 'POST', body: formData }, token)
}

export async function updateProduct(id, data, token) {

  if (data instanceof FormData) {
    return request(`/productos/${id}`, { method: 'PUT', body: data }, token)
  }
  return request(`/productos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }, token)
}

export async function deleteProduct(id, token) {
  return request(`/productos/${id}`, { method: 'DELETE' }, token)
}

export async function getUsers(token) {
  return request('/users', {}, token)
}

export async function createUser(data, token) {
  return request('/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }, token)
}

export async function updateUser(id, data, token) {
  return request(`/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }, token)
}

export async function deleteUser(id, token) {
  return request(`/users/${id}`, { method: 'DELETE' }, token)
}
