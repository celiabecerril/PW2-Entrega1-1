<script>
  let { product, onClose } = $props()
  const imgBase = '/api/uploads/'
</script>

<div class="overlay" onclick={onClose}>
  <div class="detail-modal" onclick={(e) => e.stopPropagation()}>
    <button class="close-btn" onclick={onClose}>×</button>

    {#if product.imagen}
      <div class="detail-img">
        <img src="{imgBase}{product.imagen}" alt={product.nombre} />
      </div>
    {:else}
      <div class="detail-img placeholder">◆</div>
    {/if}

    <div class="detail-body">
      <h2>{product.nombre}</h2>
      <span class="cat-badge">{product.categoria || 'General'}</span>
      <div class="price-tag">{Number(product.precio).toFixed(2)} €</div>
      <span class="status-badge" class:active={product.activo !== false}>
        {product.activo !== false ? 'Activo' : 'No activo'}
      </span>
      <div class="detail-meta">
        <span class="meta-label">ID</span>
        <span class="meta-value mono">{product._id}</span>
      </div>
    </div>
  </div>
</div>

<style>
  .overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(8px);
    z-index: 500;
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
  }
  .detail-modal {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    width: 100%; max-width: 480px;
    overflow: hidden;
    animation: popIn 0.2s ease;
    position: relative;
  }
  @keyframes popIn {
    from { transform: scale(0.94); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }
  .close-btn {
    position: absolute; top: 0.8rem; right: 0.9rem;
    background: rgba(0,0,0,0.5); border: none;
    color: white; font-size: 1.3rem; cursor: pointer;
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    z-index: 1; transition: background 0.15s;
  }
  .close-btn:hover { background: rgba(0,0,0,0.8); }
  .detail-img {
    aspect-ratio: 16/9;
    background: var(--surface-2);
    overflow: hidden;
    display: flex; align-items: center; justify-content: center;
  }
  .detail-img img { width: 100%; height: 100%; object-fit: cover; }
  .detail-img.placeholder { font-size: 4rem; color: rgba(0,0,0,0.08); }
  .detail-body { padding: 1.5rem 1.8rem 1.8rem; }
  h2 {
    font-family: var(--font-display);
    font-size: 1.6rem;
    color: var(--text);
    margin: 0 0 0.3rem;
  }
  .cat-badge {
    display: inline-block;
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }
  .price-tag {
    font-family: var(--font-sans);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--accent);
    margin-bottom: 0.8rem;
  }
  .status-badge {
    display: inline-block;
    padding: 0.3rem 0.8rem;
    border-radius: 14px;
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: 1.2rem;
    background: rgba(248, 113, 113, 0.15);
    color: #f87171;
  }
  .status-badge.active {
    background: rgba(74, 222, 128, 0.15);
    color: #4ade80;
  }
  .detail-meta { display: flex; flex-direction: column; gap: 0.4rem; }
  .meta-label {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
  }
  .meta-value { font-family: var(--font-sans); font-size: 0.85rem; color: var(--text-muted); }
  .mono { font-family: monospace; font-size: 0.78rem; }
</style>
