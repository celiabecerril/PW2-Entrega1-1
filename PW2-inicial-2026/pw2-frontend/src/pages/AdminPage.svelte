<script>
  // AdminPage.svelte — gestión de usuarios, solo accesible a admins
  import { auth } from '../stores/auth.svelte.js'
  import { toasts } from '../stores/toasts.svelte.js'
  import { getUsers, createUser, updateUser, deleteUser } from '../services/api.js'
  import UserRow from '../components/UserRow.svelte'

  let users = $state([])
  let loading = $state(true)
  let confirmDelete = $state(null)

  // Nuevo usuario
  let newUsername = $state('')
  let newPassword = $state('')
  let newRole = $state('user')
  let createLoading = $state(false)
  let createErrors = $state({})

  // $derived: contadores
  const adminCount = $derived(users.filter(u => u.role === 'admin').length)
  const userCount = $derived(users.filter(u => u.role === 'user').length)

  async function loadUsers() {
    loading = true
    try {
      users = await getUsers(auth.token)
    } catch (err) {
      if (err.status === 403) toasts.error('Acceso denegado')
      else toasts.error('Error al cargar usuarios')
    } finally {
      loading = false
    }
  }

  // $effect: cargar usuarios cuando el componente se monta
  $effect(() => {
    if (auth.isAdmin) loadUsers()
  })

  function validateCreate() {
    const e = {}
    if (!newUsername.trim()) e.username = 'Obligatorio'
    if (newPassword.length < 3) e.password = 'Mínimo 3 caracteres'
    createErrors = e
    return Object.keys(e).length === 0
  }

  async function handleCreate() {
    if (!validateCreate()) return
    createLoading = true
    try {
      const created = await createUser(
        { username: newUsername.trim(), password: newPassword, role: newRole },
        auth.token
      )
      users = [...users, created]
      newUsername = ''
      newPassword = ''
      newRole = 'user'
      createErrors = {}
      toasts.success('Usuario creado')
    } catch (err) {
      toasts.error(err.message || 'Error al crear usuario')
    } finally {
      createLoading = false
    }
  }

  async function handleChangeRole(user) {
    const newRoleVal = user.role === 'admin' ? 'user' : 'admin'
    try {
      const updated = await updateUser(user._id, { role: newRoleVal }, auth.token)
      users = users.map(u => u._id === updated._id ? updated : u)
      toasts.success(`Rol actualizado a "${newRoleVal}"`)
    } catch (err) {
      toasts.error('Error al cambiar el rol')
    }
  }

  async function handleDeleteConfirm() {
    if (!confirmDelete) return
    try {
      await deleteUser(confirmDelete._id, auth.token)
      users = users.filter(u => u._id !== confirmDelete._id)
      toasts.success('Usuario eliminado')
    } catch (err) {
      toasts.error('Error al eliminar el usuario')
    } finally {
      confirmDelete = null
    }
  }
</script>

<div class="page">
  <div class="page-header">
    <h1>Administración</h1>
    <div class="stats">
      <div class="stat">
        <span class="stat-num">{users.length}</span>
        <span class="stat-label">Total</span>
      </div>
      <div class="stat">
        <span class="stat-num accent">{adminCount}</span>
        <span class="stat-label">Admins</span>
      </div>
      <div class="stat">
        <span class="stat-num">{userCount}</span>
        <span class="stat-label">Users</span>
      </div>
    </div>
  </div>

  <!-- Crear usuario -->
  <div class="create-card">
    <h2>Nuevo usuario</h2>
    <div class="create-form">
      <div class="field-inline">
        <input
          type="text"
          placeholder="Username"
          bind:value={newUsername}
          class:error={createErrors.username}
          disabled={createLoading}
        />
        {#if createErrors.username}<span class="err">{createErrors.username}</span>{/if}
      </div>
      <div class="field-inline">
        <input
          type="password"
          placeholder="Contraseña"
          bind:value={newPassword}
          class:error={createErrors.password}
          disabled={createLoading}
        />
        {#if createErrors.password}<span class="err">{createErrors.password}</span>{/if}
      </div>
      <select bind:value={newRole} disabled={createLoading}>
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select>
      <button class="btn-create" onclick={handleCreate} disabled={createLoading}>
        {#if createLoading}<span class="spinner"></span>{:else}Crear{/if}
      </button>
    </div>
  </div>

  <!-- Tabla de usuarios -->
  <div class="table-card">
    {#if loading}
      <div class="table-loading">
        <span class="spinner-lg"></span>
        <span>Cargando usuarios…</span>
      </div>
    {:else if users.length === 0}
      <div class="empty">No hay usuarios</div>
    {:else}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th class="hide-mobile">ID</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {#each users as user (user._id)}
              <UserRow
                {user}
                currentUserId={auth.user?.id}
                onChangeRole={handleChangeRole}
                onDelete={(u) => confirmDelete = u}
              />
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>

<!-- Confirmación borrado -->
{#if confirmDelete}
  <div class="confirm-overlay" onclick={() => confirmDelete = null}>
    <div class="confirm-box" onclick={(e) => e.stopPropagation()}>
      <p class="confirm-title">¿Eliminar usuario?</p>
      <p class="confirm-sub">«{confirmDelete.username}» será eliminado permanentemente.</p>
      <div class="confirm-btns">
        <button class="btn-secondary" onclick={() => confirmDelete = null}>Cancelar</button>
        <button class="btn-danger" onclick={handleDeleteConfirm}>Eliminar</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .page { padding: 2rem; max-width: 900px; margin: 0 auto; }
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  h1 {
    font-family: var(--font-display);
    font-size: 2rem;
    color: var(--text);
    margin: 0;
  }
  .stats { display: flex; gap: 1.2rem; }
  .stat { text-align: center; }
  .stat-num {
    display: block;
    font-family: var(--font-display);
    font-size: 1.5rem;
    color: var(--text);
    line-height: 1;
  }
  .stat-num.accent { color: var(--accent); }
  .stat-label { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }

  .create-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 1.4rem 1.6rem;
    margin-bottom: 1.5rem;
  }
  h2 {
    font-family: var(--font-display);
    font-size: 1.1rem;
    color: var(--text);
    margin: 0 0 1rem;
  }
  .create-form {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    align-items: flex-start;
  }
  .field-inline { display: flex; flex-direction: column; gap: 0.3rem; flex: 1; min-width: 140px; }
  input[type="text"], input[type="password"] {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.65rem 0.9rem;
    font-family: var(--font-sans);
    font-size: 0.9rem;
    color: var(--text);
    outline: none;
    transition: border-color 0.15s;
    width: 100%;
  }
  input:focus { border-color: var(--accent); }
  input.error { border-color: #f87171; }
  input::placeholder { color: rgba(255,255,255,0.2); }
  .err { font-size: 0.75rem; color: #f87171; }
  select {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.65rem 0.8rem;
    font-family: var(--font-sans);
    font-size: 0.9rem;
    color: var(--text);
    outline: none;
    cursor: pointer;
    min-width: 90px;
  }
  .btn-create {
    background: var(--accent);
    border: none;
    border-radius: 8px;
    padding: 0.65rem 1.2rem;
    font-family: var(--font-sans);
    font-size: 0.88rem;
    font-weight: 700;
    color: #0a0a0e;
    cursor: pointer;
    transition: filter 0.15s;
    min-width: 80px;
    display: flex; align-items: center; justify-content: center;
    align-self: flex-start;
  }
  .btn-create:hover:not(:disabled) { filter: brightness(1.1); }
  .btn-create:disabled { opacity: 0.5; cursor: not-allowed; }

  .table-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
  }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  thead tr { background: var(--surface-2); }
  th {
    text-align: left;
    padding: 0.85rem 1rem;
    font-family: var(--font-sans);
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.07em;
    border-bottom: 1px solid var(--border);
  }
  .hide-mobile {}

  .table-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    padding: 3rem;
    color: var(--text-muted);
    font-size: 0.9rem;
  }
  .empty { padding: 3rem; text-align: center; color: var(--text-muted); }

  .spinner, .spinner-lg {
    border-radius: 50%;
    animation: spin 0.65s linear infinite;
    display: inline-block;
  }
  .spinner { width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.25); border-top-color: #0a0a0e; }
  .spinner-lg { width: 22px; height: 22px; border: 2px solid var(--border); border-top-color: var(--accent); }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Confirm */
  .confirm-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(6px);
    z-index: 600;
    display: flex; align-items: center; justify-content: center; padding: 1rem;
  }
  .confirm-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 2rem;
    max-width: 360px; width: 100%;
    box-shadow: 0 24px 60px rgba(0,0,0,0.15);
    animation: popIn 0.18s ease;
  }
  @keyframes popIn {
    from { transform: scale(0.93); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }
  .confirm-title { font-family: var(--font-display); font-size: 1.2rem; color: var(--text); margin: 0 0 0.5rem; }
  .confirm-sub { font-size: 0.875rem; color: var(--text-muted); margin: 0 0 1.5rem; }
  .confirm-btns { display: flex; gap: 0.75rem; }
  .btn-secondary, .btn-danger {
    flex: 1; padding: 0.65rem;
    border-radius: 8px;
    font-family: var(--font-sans);
    font-size: 0.88rem; font-weight: 600;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-secondary { background: transparent; border: 1px solid var(--border); color: var(--text-muted); }
  .btn-secondary:hover { border-color: var(--text-muted); color: var(--text); }
  .btn-danger { background: rgba(248,113,113,0.1); border: 1px solid #f87171; color: #f87171; }
  .btn-danger:hover { background: rgba(248,113,113,0.2); }

  @media (max-width: 640px) {
    .page { padding: 1.2rem; }
    h1 { font-size: 1.5rem; }
    .hide-mobile { display: none; }
  }
</style>
