<script>
  import { auth } from '../stores/auth.svelte.js'

  let { currentPage, onNavigate } = $props()
</script>

<nav class="navbar">
  <div class="navbar-brand">
    <span class="brand-icon">◆</span>
    <span class="brand-name">Tienda<em>PW2</em></span>
  </div>

  <div class="navbar-links">
    <button
      class="nav-link"
      class:active={currentPage === 'productos'}
      onclick={() => onNavigate('productos')}
    >
      Productos
    </button>

    {#if auth.isAdmin}
      <button
        class="nav-link"
        class:active={currentPage === 'admin'}
        onclick={() => onNavigate('admin')}
      >
        Admin
      </button>
    {/if}

    <button
      class="nav-link"
      class:active={currentPage === 'perfil'}
      onclick={() => onNavigate('perfil')}
    >
      Perfil
    </button>
  </div>

  <div class="navbar-user">
    <span class="user-badge">
      {#if auth.isAdmin}<span class="role-tag admin">admin</span>{:else}<span class="role-tag">user</span>{/if}
      {auth.displayName}
    </span>
    <button class="btn-logout" onclick={() => auth.logout()}>Salir</button>
  </div>
</nav>

<style>
  .navbar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 0 2rem;
    height: 64px;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
  }
  .navbar-brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-right: 1rem;
  }
  .brand-icon {
    color: var(--accent);
    font-size: 1.1rem;
  }
  .brand-name {
    font-family: var(--font-display);
    font-size: 1.3rem;
    color: var(--text);
    letter-spacing: -0.02em;
  }
  .brand-name em { color: var(--accent); font-style: italic; }

  .navbar-links {
    display: flex;
    gap: 0.25rem;
    flex: 1;
  }
  .nav-link {
    background: none;
    border: none;
    cursor: pointer;
    font-family: var(--font-sans);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-muted);
    padding: 0.4rem 0.9rem;
    border-radius: 6px;
    transition: all 0.15s;
    letter-spacing: 0.01em;
  }
  .nav-link:hover { color: var(--text); background: rgba(0,0,0,0.05); }
  .nav-link.active { color: var(--accent); background: rgba(34,197,94,0.1); }

  .navbar-user {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-left: auto;
  }
  .user-badge {
    font-family: var(--font-sans);
    font-size: 0.82rem;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .role-tag {
    font-size: 0.68rem;
    font-weight: 600;
    padding: 0.15rem 0.45rem;
    border-radius: 4px;
    background: rgba(0,0,0,0.06);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .role-tag.admin { background: rgba(34,197,94,0.15); color: var(--accent); }
  .btn-logout {
    font-family: var(--font-sans);
    font-size: 0.8rem;
    font-weight: 500;
    background: none;
    border: 1px solid rgba(255,255,255,0.12);
    color: var(--text-muted);
    padding: 0.35rem 0.8rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-logout:hover { border-color: #f87171; color: #f87171; }

  @media (max-width: 600px) {
    .navbar { padding: 0 1rem; gap: 0.75rem; }
    .navbar-user .user-badge { display: none; }
    .brand-name { font-size: 1.1rem; }
  }
</style>
