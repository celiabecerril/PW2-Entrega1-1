<script>
  // LoginPage.svelte — login y registro con validación y feedback
  import { auth } from '../stores/auth.svelte.js'
  import { toasts } from '../stores/toasts.svelte.js'
  import { login, register } from '../services/api.js'

  let mode = $state('login') // 'login' | 'register'
  let username = $state('')
  let password = $state('')
  let loading = $state(false)
  let errors = $state({})

  function validate() {
    const e = {}
    if (!username.trim()) e.username = 'El usuario es obligatorio'
    if (password.length < 3) e.password = 'Mínimo 3 caracteres'
    errors = e
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    loading = true
    try {
      if (mode === 'login') {
        const data = await login(username.trim(), password)
        // Decodificamos el payload del JWT para obtener rol y username
        const payload = JSON.parse(atob(data.token.split('.')[1]))
        auth.setAuth(data.token, { username: payload.username || username.trim(), role: payload.role || 'user', id: payload.id })
        toasts.success(`Bienvenido, ${username.trim()}`)
      } else {
        await register(username.trim(), password)
        toasts.success('Cuenta creada. Ahora inicia sesión.')
        mode = 'login'
        password = ''
      }
    } catch (err) {
      if (err.status === 401) toasts.error('Credenciales incorrectas')
      else if (err.status === 400) toasts.error(err.message || 'Error en el registro')
      else toasts.error('Error de servidor. Inténtalo de nuevo.')
    } finally {
      loading = false
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleSubmit()
  }
</script>

<div class="login-page">
  <div class="login-deco" aria-hidden="true">
    <div class="deco-grid"></div>
    <div class="deco-glow"></div>
  </div>

  <div class="login-card">
    <div class="login-logo">
      <span class="logo-mark">◆</span>
      <span class="logo-text">Tienda<em>PW2</em></span>
    </div>

    <h1 class="login-title">
      {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
    </h1>
    <p class="login-sub">
      {mode === 'login' ? 'Accede a tu cuenta para continuar' : 'Crea tu cuenta para empezar'}
    </p>

    <div class="form-fields">
      <div class="field">
        <label for="username">Usuario</label>
        <input
          id="username"
          type="text"
          bind:value={username}
          onkeydown={handleKey}
          placeholder="tu_usuario"
          class:error={errors.username}
          disabled={loading}
          autocomplete="username"
        />
        {#if errors.username}<span class="err">{errors.username}</span>{/if}
      </div>

      <div class="field">
        <label for="password">Contraseña</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          onkeydown={handleKey}
          placeholder="••••••••"
          class:error={errors.password}
          disabled={loading}
          autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
        {#if errors.password}<span class="err">{errors.password}</span>{/if}
      </div>
    </div>

    <button class="btn-submit" onclick={handleSubmit} disabled={loading}>
      {#if loading}
        <span class="spinner"></span>
      {:else}
        {mode === 'login' ? 'Entrar' : 'Registrarse'}
      {/if}
    </button>

    <div class="login-switch">
      {#if mode === 'login'}
        ¿No tienes cuenta?
        <button onclick={() => { mode = 'register'; errors = {} }}>Regístrate</button>
      {:else}
        ¿Ya tienes cuenta?
        <button onclick={() => { mode = 'login'; errors = {} }}>Inicia sesión</button>
      {/if}
    </div>
  </div>
</div>

<style>
  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
    overflow: hidden;
  }
  .login-deco {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .deco-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  .deco-glow {
    position: absolute;
    top: -20%;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 600px;
    background: radial-gradient(ellipse, rgba(34,197,94,0.08) 0%, transparent 65%);
  }

  .login-card {
    position: relative;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 2.5rem;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.12);
  }

  .login-logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }
  .logo-mark { color: var(--accent); font-size: 1.2rem; }
  .logo-text {
    font-family: var(--font-display);
    font-size: 1.4rem;
    color: var(--text);
  }
  .logo-text em { color: var(--accent); font-style: italic; }

  .login-title {
    font-family: var(--font-display);
    font-size: 1.8rem;
    color: var(--text);
    margin: 0 0 0.3rem;
    line-height: 1.2;
  }
  .login-sub {
    font-size: 0.875rem;
    color: var(--text-muted);
    margin: 0 0 2rem;
  }

  .form-fields { display: flex; flex-direction: column; gap: 1.1rem; margin-bottom: 1.5rem; }
  .field { display: flex; flex-direction: column; gap: 0.4rem; }
  label {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }
  input {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 0.8rem 1rem;
    font-family: var(--font-sans);
    font-size: 0.95rem;
    color: var(--text);
    outline: none;
    transition: border-color 0.15s;
  }
  input::placeholder { color: rgba(255,255,255,0.2); }
  input:focus { border-color: var(--accent); }
  input.error { border-color: #f87171; }
  input:disabled { opacity: 0.5; }
  .err { font-size: 0.77rem; color: #f87171; }

  .btn-submit {
    width: 100%;
    padding: 0.85rem;
    background: var(--accent);
    border: none;
    border-radius: 10px;
    font-family: var(--font-sans);
    font-size: 0.95rem;
    font-weight: 700;
    color: #0a0a0e;
    cursor: pointer;
    transition: filter 0.15s, transform 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
  }
  .btn-submit:hover:not(:disabled) { filter: brightness(1.1); }
  .btn-submit:active:not(:disabled) { transform: scale(0.98); }
  .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  .login-switch {
    text-align: center;
    margin-top: 1.2rem;
    font-size: 0.85rem;
    color: var(--text-muted);
  }
  .login-switch button {
    background: none;
    border: none;
    color: var(--accent);
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    margin-left: 0.3rem;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(0,0,0,0.25);
    border-top-color: #0a0a0e;
    border-radius: 50%;
    animation: spin 0.65s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
