<script>
  // App.svelte — router SPA principal con $effect() para redirecciones
  import { auth } from './stores/auth.svelte.js'
  import Navbar from './components/Navbar.svelte'
  import ToastContainer from './components/ToastContainer.svelte'
  import LoginPage from './pages/LoginPage.svelte'
  import ProductosPage from './pages/ProductosPage.svelte'
  import PerfilPage from './pages/PerfilPage.svelte'
  import AdminPage from './pages/AdminPage.svelte'

  // $state(): página actual
  let currentPage = $state('productos')

  // $effect(): redirigir al login si se pierde la autenticación
  $effect(() => {
    if (!auth.isAuthenticated) {
      currentPage = 'productos' // reset page so when re-login lands on productos
    }
  })

  // $effect(): redirigir a productos si un no-admin intenta acceder a /admin
  $effect(() => {
    if (auth.isAuthenticated && currentPage === 'admin' && !auth.isAdmin) {
      currentPage = 'productos'
    }
  })

  function navigate(page) {
    if (page === 'admin' && !auth.isAdmin) return
    currentPage = page
  }
</script>

<ToastContainer />

{#if !auth.isAuthenticated}
  <LoginPage />
{:else}
  <Navbar {currentPage} onNavigate={navigate} />

  <main>
    {#if currentPage === 'productos'}
      <ProductosPage />
    {:else if currentPage === 'perfil'}
      <PerfilPage />
    {:else if currentPage === 'admin' && auth.isAdmin}
      <AdminPage />
    {:else}
      <ProductosPage />
    {/if}
  </main>
{/if}

<style>
  :global(*, *::before, *::after) { box-sizing: border-box; margin: 0; padding: 0; }

  :global(:root) {
    --font-display: 'DM Serif Display', Georgia, serif;
    --font-sans: 'DM Sans', system-ui, sans-serif;
    --accent: #22c55e;
    --bg: #ffffff;
    --surface: #f8fafc;
    --surface-2: #f1f5f9;
    --border: rgba(0, 0, 0, 0.08);
    --text: #1e293b;
    --text-muted: #64748b;
  }

  :global(body) {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-sans);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  :global(input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button) {
    -webkit-appearance: none;
  }

  :global(select option) {
    background: var(--surface-2);
    color: var(--text);
  }

  main {
    min-height: calc(100vh - 64px);
  }
</style>
