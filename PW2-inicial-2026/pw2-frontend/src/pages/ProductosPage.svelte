<script>
  import { auth } from '../stores/auth.svelte.js'
  import { toasts } from '../stores/toasts.svelte.js'
  import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api.js'
  import ProductCard from '../components/ProductCard.svelte'
  import ProductForm from '../components/ProductForm.svelte'
  import ProductDetail from '../components/ProductDetail.svelte'

  let products = $state([])
  let loading = $state(true)
  let searchQuery = $state('')
  let minPrice = $state('')
  let maxPrice = $state('')
  let selectedCategoria = $state('')
  let categorias = $state([])
  let formOpen = $state(false)
  let editingProduct = $state(null)
  let detailProduct = $state(null)
  let formLoading = $state(false)
  let confirmDelete = $state(null)

  // Paginación
  let currentPage = $state(1)
  let totalPages = $state(1)
  let totalProducts = $state(0)
  const ITEMS_PER_PAGE = 12

  // Filtrar productos: usuarios normales NO ven productos inactivos
  const filteredProducts = $derived(
    products.filter(p => {
      // Si no es admin, ocultar productos inactivos
      if (!auth.isAdmin && p.activo === false) return false
      
      const q = searchQuery.toLowerCase().trim()
      if (q && !p.nombre.toLowerCase().includes(q)) return false
      if (minPrice !== '' && p.precio < Number(minPrice)) return false
      if (maxPrice !== '' && p.precio > Number(maxPrice)) return false
      if (selectedCategoria && p.categoria !== selectedCategoria) return false
      return true
    })
  )

  const productCount = $derived(filteredProducts.length)
  const hasFilters = $derived(searchQuery !== '' || minPrice !== '' || maxPrice !== '' || selectedCategoria !== '')

  async function loadProducts(page = 1) {
    loading = true
    try {
      const result = await getProducts({ page, limit: ITEMS_PER_PAGE })
      products = result.products
      totalPages = result.totalPages
      totalProducts = result.total
      currentPage = result.page
      categorias = result.categorias || []
    } catch (err) {
      toasts.error('Error al cargar productos')
    } finally {
      loading = false
    }
  }

  $effect(() => {
    if (auth.token) loadProducts()
  })

  function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
      loadProducts(page)
    }
  }

  async function handleSave({ nombre, precio, activo, categoria, imagen }) {
    formLoading = true
    try {
      if (editingProduct) {
        // Si hay nueva imagen, usar FormData
        if (imagen) {
          const fd = new FormData()
          fd.append('nombre', nombre)
          fd.append('precio', String(precio))
          fd.append('activo', String(activo))
          fd.append('categoria', categoria)
          fd.append('imagen', imagen)
          const updated = await updateProduct(editingProduct._id, fd, auth.token)
          products = products.map(p => p._id === updated._id ? updated : p)
        } else {
          const updated = await updateProduct(editingProduct._id, { nombre, precio, activo, categoria }, auth.token)
          products = products.map(p => p._id === updated._id ? updated : p)
        }
        toasts.success('Producto actualizado')
      } else {
        const fd = new FormData()
        fd.append('nombre', nombre)
        fd.append('precio', String(precio))
        fd.append('activo', String(activo))
        fd.append('categoria', categoria)
        if (imagen) fd.append('imagen', imagen)
        const created = await createProduct(fd, auth.token)
        products = [...products, created]
        toasts.success('Producto creado')
      }
      formOpen = false
      editingProduct = null
      // Recargar para actualizar categorías
      loadProducts(currentPage)
    } catch (err) {
      if (err.status === 403) toasts.error('Solo los administradores pueden realizar esta acción')
      else toasts.error('Error al guardar el producto')
    } finally {
      formLoading = false
    }
  }

  async function handleDeleteConfirm() {
    if (!confirmDelete) return
    try {
      await deleteProduct(confirmDelete._id, auth.token)
      products = products.filter(p => p._id !== confirmDelete._id)
      toasts.success('Producto eliminado')
      // Recargar si la página queda vacía
      if (products.length === 0 && currentPage > 1) {
        loadProducts(currentPage - 1)
      }
    } catch (err) {
      if (err.status === 403) toasts.error('Solo los administradores pueden borrar productos')
      else toasts.error('Error al eliminar el producto')
    } finally {
      confirmDelete = null
    }
  }

  function openEdit(product) {
    editingProduct = product
    formOpen = true
  }

  function clearFilters() {
    searchQuery = ''
    minPrice = ''
    maxPrice = ''
    selectedCategoria = ''
  }
</script>

<div class="page">
  <div class="page-header">
    <div class="page-title-block">
      <h1>Productos</h1>
      <span class="count-badge">{productCount}</span>
    </div>
    {#if auth.isAdmin}
      <button class="btn-new" onclick={() => { editingProduct = null; formOpen = true }}>
        + Nuevo producto
      </button>
    {/if}
  </div>

  <div class="filters">
    <div class="search-wrap">
      <span class="search-icon">⌕</span>
      <input type="text" placeholder="Buscar por nombre…" bind:value={searchQuery} class="search-input" />
    </div>
    <select bind:value={selectedCategoria} class="filter-select">
      <option value="">Todas las categorías</option>
      {#each categorias as cat}
        <option value={cat}>{cat}</option>
      {/each}
    </select>
    <input type="number" placeholder="Precio mín." bind:value={minPrice} class="filter-input" min="0" />
    <input type="number" placeholder="Precio máx." bind:value={maxPrice} class="filter-input" min="0" />
    {#if hasFilters}
      <button class="btn-clear" onclick={clearFilters}>✕ Limpiar</button>
    {/if}
  </div>

  {#if loading}
    <div class="grid">
      {#each Array(6) as _}
        <div class="skeleton-card">
          <div class="sk-img"></div>
          <div class="sk-body">
            <div class="sk-line long"></div>
            <div class="sk-line short"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if filteredProducts.length === 0}
    <div class="empty-state">
      <span class="empty-icon">◇</span>
      <p>{hasFilters ? 'No hay productos con esos filtros' : 'No hay productos todavía'}</p>
      {#if hasFilters}
        <button class="btn-clear" onclick={clearFilters}>Limpiar filtros</button>
      {/if}
    </div>
  {:else}
    <div class="grid">
      {#each filteredProducts as product (product._id)}
        <ProductCard
          {product}
          isAdmin={auth.isAdmin}
          onView={(p) => detailProduct = p}
          onEdit={openEdit}
          onDelete={(p) => confirmDelete = p}
        />
      {/each}
    </div>

    <!-- Paginación -->
    {#if totalPages > 1}
      <div class="pagination">
        <button 
          class="page-btn" 
          onclick={() => goToPage(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          ← Anterior
        </button>
        
        <div class="page-numbers">
          {#each Array(totalPages) as _, i}
            <button 
              class="page-num" 
              class:active={currentPage === i + 1}
              onclick={() => goToPage(i + 1)}
            >
              {i + 1}
            </button>
          {/each}
        </div>
        
        <button 
          class="page-btn" 
          onclick={() => goToPage(currentPage + 1)} 
          disabled={currentPage === totalPages}
        >
          Siguiente →
        </button>
      </div>
    {/if}
    
    <p class="results-info">Mostrando {filteredProducts.length} de {totalProducts} productos</p>
  {/if}
</div>

{#if formOpen}
  <ProductForm
    product={editingProduct}
    loading={formLoading}
    {categorias}
    onSave={handleSave}
    onCancel={() => { formOpen = false; editingProduct = null }}
  />
{/if}

{#if detailProduct}
  <ProductDetail product={detailProduct} onClose={() => detailProduct = null} />
{/if}

{#if confirmDelete}
  <div class="confirm-overlay" onclick={() => confirmDelete = null} role="dialog" aria-modal="true">
    <div class="confirm-box" onclick={(e) => e.stopPropagation()}>
      <p class="confirm-title">¿Eliminar producto?</p>
      <p class="confirm-sub">«{confirmDelete.nombre}» se eliminará permanentemente.</p>
      <div class="confirm-btns">
        <button class="btn-secondary" onclick={() => confirmDelete = null}>Cancelar</button>
        <button class="btn-danger" onclick={handleDeleteConfirm}>Eliminar</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .page { padding: 2rem; max-width: 1200px; margin: 0 auto; }
  .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
  .page-title-block { display: flex; align-items: center; gap: 0.8rem; }
  h1 { font-family: var(--font-display); font-size: 2rem; color: var(--text); margin: 0; }
  .count-badge { background: rgba(34,197,94,0.12); color: var(--accent); font-family: var(--font-sans); font-size: 0.8rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; border: 1px solid rgba(34,197,94,0.2); }
  .btn-new { background: var(--accent); border: none; border-radius: 8px; padding: 0.6rem 1.2rem; font-family: var(--font-sans); font-size: 0.88rem; font-weight: 700; color: #0a0a0e; cursor: pointer; transition: filter 0.15s; }
  .btn-new:hover { filter: brightness(1.1); }
  .filters { display: flex; gap: 0.75rem; margin-bottom: 2rem; flex-wrap: wrap; align-items: center; }
  .search-wrap { position: relative; flex: 1; min-width: 200px; }
  .search-icon { position: absolute; left: 0.9rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 1.1rem; pointer-events: none; }
  .search-input, .filter-input { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 0.65rem 0.9rem; font-family: var(--font-sans); font-size: 0.9rem; color: var(--text); outline: none; transition: border-color 0.15s; }
  .search-input { width: 100%; padding-left: 2.4rem; }
  .filter-input { width: 130px; }
  .search-input:focus, .filter-input:focus { border-color: var(--accent); }
  .search-input::placeholder, .filter-input::placeholder { color: rgba(0,0,0,0.3); }
  .btn-clear { background: none; border: 1px solid var(--border); border-radius: 8px; padding: 0.6rem 0.9rem; font-family: var(--font-sans); font-size: 0.82rem; color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
  .btn-clear:hover { border-color: #f87171; color: #f87171; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.25rem; }
  .skeleton-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
  .sk-img { aspect-ratio: 4/3; background: var(--surface-2); animation: shimmer 1.4s ease infinite; }
  .sk-body { padding: 1rem; display: flex; flex-direction: column; gap: 0.6rem; }
  .sk-line { height: 14px; border-radius: 6px; background: var(--surface-2); animation: shimmer 1.4s ease infinite; }
  .sk-line.long { width: 75%; }
  .sk-line.short { width: 40%; }
  @keyframes shimmer { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
  .empty-state { text-align: center; padding: 5rem 2rem; color: var(--text-muted); }
  .empty-icon { font-size: 3.5rem; display: block; margin-bottom: 1rem; opacity: 0.3; }
  .empty-state p { margin: 0 0 1.2rem; font-size: 1rem; }
  .confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); z-index: 600; display: flex; align-items: center; justify-content: center; padding: 1rem; }
  .confirm-box { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 2rem; max-width: 360px; width: 100%; box-shadow: 0 24px 60px rgba(0,0,0,0.15); animation: popIn 0.18s ease; }
  @keyframes popIn { from { transform: scale(0.93); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .confirm-title { font-family: var(--font-display); font-size: 1.2rem; color: var(--text); margin: 0 0 0.5rem; }
  .confirm-sub { font-size: 0.875rem; color: var(--text-muted); margin: 0 0 1.5rem; }
  .confirm-btns { display: flex; gap: 0.75rem; }
  .btn-secondary { flex: 1; padding: 0.65rem; background: transparent; border: 1px solid var(--border); border-radius: 8px; font-family: var(--font-sans); font-size: 0.88rem; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
  .btn-secondary:hover { border-color: var(--text-muted); color: var(--text); }
  .btn-danger { flex: 1; padding: 0.65rem; background: rgba(248,113,113,0.1); border: 1px solid #f87171; border-radius: 8px; font-family: var(--font-sans); font-size: 0.88rem; font-weight: 600; color: #f87171; cursor: pointer; transition: all 0.15s; }
  .btn-danger:hover { background: rgba(248,113,113,0.2); }

  /* Select de categorías */
  .filter-select {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.65rem 0.9rem;
    font-family: var(--font-sans);
    font-size: 0.9rem;
    color: var(--text);
    outline: none;
    cursor: pointer;
    min-width: 160px;
    transition: border-color 0.15s;
  }
  .filter-select:focus { border-color: var(--accent); }

  /* Paginación */
  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
    flex-wrap: wrap;
  }
  .page-btn {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.5rem 1rem;
    font-family: var(--font-sans);
    font-size: 0.85rem;
    color: var(--text);
    cursor: pointer;
    transition: all 0.15s;
  }
  .page-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
  .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .page-numbers { display: flex; gap: 0.4rem; }
  .page-num {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    font-family: var(--font-sans);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.15s;
  }
  .page-num:hover { border-color: var(--accent); }
  .page-num.active {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
    font-weight: 600;
  }
  .results-info {
    text-align: center;
    margin-top: 1rem;
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  @media (max-width: 600px) { .page { padding: 1.2rem; } h1 { font-size: 1.5rem; } .filter-input { width: 100px; } .filter-select { min-width: 140px; } }
</style>