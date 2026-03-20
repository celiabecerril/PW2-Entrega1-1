<script>
  // ProductCard.svelte — componente reutilizable con $props() y callbacks
  let { product, isAdmin, onEdit, onDelete, onView } = $props()

  const imgBase = '/api/uploads/'
</script>

<article class="card" onclick={() => onView(product)}>
  <div class="card-img">
    {#if product.imagen}
      <img src="{imgBase}{product.imagen}" alt={product.nombre} />
    {:else}
      <div class="card-placeholder">◆</div>
    {/if}
  </div>

  <div class="card-body">
    <h3 class="card-title">{product.nombre}</h3>
    <span class="card-cat">{product.categoria || 'General'}</span>
    <p class="card-price">{Number(product.precio).toFixed(2)} €</p>
    <span class="card-status" class:active={product.activo !== false}>
      {product.activo !== false ? 'Activo' : 'No activo'}
    </span>
  </div>

  {#if isAdmin}
    <div class="card-actions" onclick={(e) => e.stopPropagation()}>
      <button class="btn-action edit" onclick={() => onEdit(product)} title="Editar">✎</button>
      <button class="btn-action del" onclick={() => onDelete(product)} title="Eliminar">✕</button>
    </div>
  {/if}
</article>

<style>
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
    position: relative;
    display: flex;
    flex-direction: column;
  }
  .card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.12);
    border-color: rgba(34,197,94,0.25);
  }
  .card-img {
    aspect-ratio: 4/3;
    background: var(--surface-2);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .card-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  .card:hover .card-img img { transform: scale(1.04); }
  .card-placeholder {
    font-size: 2.5rem;
    color: rgba(0,0,0,0.12);
  }
  .card-body {
    padding: 1rem 1.1rem 0.8rem;
    flex: 1;
  }
  .card-title {
    font-family: var(--font-display);
    font-size: 1.1rem;
    color: var(--text);
    margin: 0 0 0.15rem;
    line-height: 1.25;
  }
  .card-cat {
    font-size: 0.72rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.3rem;
    display: block;
  }
  .card-price {
    font-family: var(--font-sans);
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--accent);
    margin: 0;
  }
  .card-status {
    display: inline-block;
    margin-top: 0.5rem;
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    background: rgba(248, 113, 113, 0.15);
    color: #f87171;
  }
  .card-status.active {
    background: rgba(74, 222, 128, 0.15);
    color: #4ade80;
  }
  .card-actions {
    display: flex;
    gap: 0.4rem;
    padding: 0.6rem 0.8rem;
    border-top: 1px solid var(--border);
  }
  .btn-action {
    flex: 1;
    padding: 0.4rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.15s;
    color: var(--text-muted);
  }
  .btn-action.edit:hover { color: var(--accent); border-color: var(--accent); background: rgba(34,197,94,0.08); }
  .btn-action.del:hover  { color: #f87171; border-color: #f87171; background: rgba(248,113,113,0.08); }
</style>
