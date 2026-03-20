<script>
  // PerfilPage.svelte — perfil del usuario autenticado
  import { auth } from '../stores/auth.svelte.js'
  import { toasts } from '../stores/toasts.svelte.js'
  import { updateUser } from '../services/api.js'

  let editing = $state(false)
  let newUsername = $state(auth.user?.username ?? '')
  let newPassword = $state('')
  let loading = $state(false)
  let errors = $state({})

  // $derived() para mostrar iniciales del avatar
  const initials = $derived(
    auth.displayName
      ? auth.displayName.slice(0, 2).toUpperCase()
      : '?'
  )

  const roleLabel = $derived(auth.isAdmin ? 'Administrador' : 'Usuario')

  function validate() {
    const e = {}
    if (!newUsername.trim()) e.username = 'El nombre no puede estar vacío'
    if (newPassword && newPassword.length < 3) e.password = 'Mínimo 3 caracteres'
    errors = e
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    loading = true
    try {
      const payload = { username: newUsername.trim() }
      if (newPassword) payload.password = newPassword
      await updateUser(auth.user.id, payload, auth.token)
      // Actualizamos el store
      auth.setAuth(auth.token, { ...auth.user, username: newUsername.trim() })
      toasts.success('Perfil actualizado correctamente')
      editing = false
      newPassword = ''
    } catch (err) {
      toasts.error('Error al actualizar el perfil')
    } finally {
      loading = false
    }
  }

  function cancelEdit() {
    editing = false
    newUsername = auth.user?.username ?? ''
    newPassword = ''
    errors = {}
  }
</script>

<div class="page">
  <div class="profile-card">
    <div class="avatar">{initials}</div>

    <div class="profile-info">
      <h1 class="username">{auth.displayName}</h1>
      <span class="role-badge" class:admin={auth.isAdmin}>{roleLabel}</span>
    </div>

    {#if !editing}
      <button class="btn-edit" onclick={() => editing = true}>Editar perfil</button>
    {:else}
      <div class="edit-form">
        <div class="field">
          <label for="uname">Nombre de usuario</label>
          <input
            id="uname"
            type="text"
            bind:value={newUsername}
            class:error={errors.username}
            disabled={loading}
          />
          {#if errors.username}<span class="err">{errors.username}</span>{/if}
        </div>
        <div class="field">
          <label for="pwd">Nueva contraseña <span class="optional">(opcional)</span></label>
          <input
            id="pwd"
            type="password"
            bind:value={newPassword}
            placeholder="Dejar vacío para no cambiar"
            class:error={errors.password}
            disabled={loading}
          />
          {#if errors.password}<span class="err">{errors.password}</span>{/if}
        </div>
        <div class="edit-actions">
          <button class="btn-cancel" onclick={cancelEdit} disabled={loading}>Cancelar</button>
          <button class="btn-save" onclick={handleSave} disabled={loading}>
            {#if loading}<span class="spinner"></span>{/if}
            Guardar
          </button>
        </div>
      </div>
    {/if}

    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">ID de usuario</span>
        <span class="info-value mono">{auth.user?.id ?? '—'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Rol asignado</span>
        <span class="info-value">{roleLabel}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Sesión</span>
        <span class="info-value active-dot">● Activa</span>
      </div>
    </div>

    <div class="logout-zone">
      <button class="btn-logout" onclick={() => auth.logout()}>
        Cerrar sesión
      </button>
    </div>
  </div>
</div>

<style>
  .page {
    padding: 2.5rem 1.5rem;
    max-width: 560px;
    margin: 0 auto;
  }
  .profile-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }
  .avatar {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05));
    border: 2px solid rgba(34,197,94,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-size: 2rem;
    color: var(--accent);
  }
  .profile-info { text-align: center; }
  .username {
    font-family: var(--font-display);
    font-size: 1.8rem;
    color: var(--text);
    margin: 0 0 0.5rem;
  }
  .role-badge {
    display: inline-block;
    font-family: var(--font-sans);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0.25rem 0.7rem;
    border-radius: 20px;
    background: rgba(0,0,0,0.05);
    color: var(--text-muted);
    border: 1px solid var(--border);
  }
  .role-badge.admin { background: rgba(34,197,94,0.12); color: var(--accent); border-color: rgba(34,197,94,0.25); }

  .btn-edit {
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.55rem 1.2rem;
    font-family: var(--font-sans);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-edit:hover { border-color: var(--accent); color: var(--accent); }

  .edit-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .field { display: flex; flex-direction: column; gap: 0.4rem; }
  label {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }
  .optional { text-transform: none; font-weight: 400; opacity: 0.6; }
  input {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.7rem 0.9rem;
    font-family: var(--font-sans);
    font-size: 0.95rem;
    color: var(--text);
    outline: none;
    transition: border-color 0.15s;
  }
  input:focus { border-color: var(--accent); }
  input.error { border-color: #f87171; }
  input::placeholder { color: rgba(255,255,255,0.2); }
  .err { font-size: 0.77rem; color: #f87171; }

  .edit-actions { display: flex; gap: 0.75rem; }
  .btn-cancel, .btn-save {
    flex: 1;
    padding: 0.65rem;
    border-radius: 8px;
    font-family: var(--font-sans);
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    display: flex; align-items: center; justify-content: center; gap: 0.4rem;
  }
  .btn-cancel {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-muted);
  }
  .btn-cancel:hover { border-color: var(--text-muted); color: var(--text); }
  .btn-save {
    background: var(--accent);
    border: 1px solid var(--accent);
    color: #0a0a0e;
  }
  .btn-save:hover:not(:disabled) { filter: brightness(1.1); }
  .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

  .spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(0,0,0,0.25);
    border-top-color: #0a0a0e;
    border-radius: 50%;
    animation: spin 0.65s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .info-grid {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.2rem 1.4rem;
  }
  .info-item { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
  .info-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    flex-shrink: 0;
  }
  .info-value {
    font-family: var(--font-sans);
    font-size: 0.875rem;
    color: var(--text);
    text-align: right;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .mono { font-family: monospace; font-size: 0.78rem; color: var(--text-muted); }
  .active-dot { color: #4ade80; }

  .logout-zone { width: 100%; }
  .btn-logout {
    width: 100%;
    padding: 0.7rem;
    background: transparent;
    border: 1px solid rgba(248,113,113,0.3);
    border-radius: 8px;
    font-family: var(--font-sans);
    font-size: 0.88rem;
    font-weight: 600;
    color: #f87171;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-logout:hover { background: rgba(248,113,113,0.08); border-color: #f87171; }
</style>
