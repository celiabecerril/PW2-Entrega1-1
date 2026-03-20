<script>
  // ProductForm.svelte — formulario con $props(), callbacks y validación
  let { product = null, onSave, onCancel, loading = false, categorias = [] } = $props()

  let nombre = $state(product?.nombre ?? '')
  let precio = $state(product?.precio ?? '')
  let activo = $state(product?.activo ?? true)
  let categoria = $state(product?.categoria ?? 'General')
  let imagen = $state(null)
  let errors = $state({})

  function validate() {
    const e = {}
    if (!nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!precio || isNaN(precio) || Number(precio) < 0) e.precio = 'Precio inválido'
    errors = e
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    onSave({ nombre: nombre.trim(), precio: Number(precio), activo, categoria, imagen })
  }
</script>

<div class="form-overlay" onclick={onCancel}>
  <div class="form-modal" onclick={(e) => e.stopPropagation()}>
    <div class="form-header">
      <h2>{product ? 'Editar producto' : 'Nuevo producto'}</h2>
      <button class="close-btn" onclick={onCancel}>×</button>
    </div>

    <div class="form-body">
      <div class="field">
        <label for="nombre">Nombre</label>
        <input
          id="nombre"
          type="text"
          bind:value={nombre}
          placeholder="Nombre del producto"
          class:error={errors.nombre}
          disabled={loading}
        />
        {#if errors.nombre}<span class="err-msg">{errors.nombre}</span>{/if}
      </div>

      <div class="field">
        <label for="precio">Precio (€)</label>
        <input
          id="precio"
          type="number"
          step="0.01"
          min="0"
          bind:value={precio}
          placeholder="0.00"
          class:error={errors.precio}
          disabled={loading}
        />
        {#if errors.precio}<span class="err-msg">{errors.precio}</span>{/if}
      </div>

      <div class="field field-toggle">
        <label for="activo">Estado</label>
        <label class="toggle">
          <input id="activo" type="checkbox" bind:checked={activo} disabled={loading} />
          <span class="toggle-slider"></span>
          <span class="toggle-label">{activo ? 'Activo' : 'No activo'}</span>
        </label>
      </div>

      <div class="field">
        <label for="categoria">Categoría</label>
        <input
          id="categoria"
          type="text"
          list="categorias-list"
          bind:value={categoria}
          placeholder="General"
          disabled={loading}
        />
        <datalist id="categorias-list">
          {#each categorias as cat}
            <option value={cat} />
          {/each}
        </datalist>
      </div>

      <div class="field">
        <label for="imagen">Imagen {product ? '(cambiar)' : '(opcional)'}</label>
        {#if product?.imagen && !imagen}
          <div class="current-image">
            <img src="/api/uploads/{product.imagen}" alt="Imagen actual" />
            <span class="current-label">Imagen actual</span>
          </div>
        {/if}
        <input
          id="imagen"
          type="file"
          accept="image/*"
          onchange={(e) => imagen = e.target.files[0]}
          disabled={loading}
        />
        {#if imagen}
          <span class="new-file">📄 {imagen.name}</span>
        {/if}
      </div>
    </div>

    <div class="form-footer">
      <button class="btn-secondary" onclick={onCancel} disabled={loading}>Cancelar</button>
      <button class="btn-primary" onclick={handleSubmit} disabled={loading}>
        {#if loading}<span class="spinner"></span>{/if}
        {product ? 'Guardar cambios' : 'Crear producto'}
      </button>
    </div>
  </div>
</div>

<style>
  .form-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(6px);
    z-index: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }
  .form-modal {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    width: 100%;
    max-width: 440px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.15);
    animation: popIn 0.2s ease;
  }
  @keyframes popIn {
    from { transform: scale(0.94); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }
  .form-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.4rem 1.6rem 1rem;
    border-bottom: 1px solid var(--border);
  }
  .form-header h2 {
    font-family: var(--font-display);
    font-size: 1.25rem;
    color: var(--text);
    margin: 0;
  }
  .close-btn {
    background: none; border: none; color: var(--text-muted);
    font-size: 1.4rem; cursor: pointer; line-height: 1;
    transition: color 0.15s;
  }
  .close-btn:hover { color: var(--text); }
  .form-body { padding: 1.4rem 1.6rem; display: flex; flex-direction: column; gap: 1.1rem; }
  .field { display: flex; flex-direction: column; gap: 0.4rem; }
  label {
    font-family: var(--font-sans);
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  input[type="text"], input[type="number"] {
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
  input[type="file"] {
    font-family: var(--font-sans);
    font-size: 0.85rem;
    color: var(--text-muted);
  }
  .current-image {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.5rem;
    background: var(--surface-2);
    border-radius: 8px;
    margin-bottom: 0.5rem;
  }
  .current-image img {
    width: 60px;
    height: 45px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid var(--border);
  }
  .current-label {
    font-size: 0.8rem;
    color: var(--text-muted);
  }
  .new-file {
    font-size: 0.8rem;
    color: var(--accent);
    margin-top: 0.3rem;
  }
  .err-msg { font-size: 0.78rem; color: #f87171; }
  .form-footer {
    display: flex;
    gap: 0.75rem;
    padding: 1rem 1.6rem 1.4rem;
    border-top: 1px solid var(--border);
  }
  .btn-primary, .btn-secondary {
    flex: 1;
    padding: 0.7rem;
    border-radius: 8px;
    font-family: var(--font-sans);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  .btn-primary {
    background: var(--accent);
    border: 1px solid var(--accent);
    color: #0a0a0e;
  }
  .btn-primary:hover:not(:disabled) { filter: brightness(1.1); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-secondary {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-muted);
  }
  .btn-secondary:hover:not(:disabled) { border-color: var(--text-muted); color: var(--text); }
  .spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(0,0,0,0.3);
    border-top-color: #0a0a0e;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Toggle para campo activo */
  .field-toggle { flex-direction: row; align-items: center; justify-content: space-between; }
  .toggle {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    cursor: pointer;
    text-transform: none;
  }
  .toggle input { display: none; }
  .toggle-slider {
    width: 40px;
    height: 22px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 12px;
    position: relative;
    transition: all 0.2s;
  }
  .toggle-slider::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    background: var(--text-muted);
    border-radius: 50%;
    transition: all 0.2s;
  }
  .toggle input:checked + .toggle-slider {
    background: rgba(74, 222, 128, 0.2);
    border-color: #4ade80;
  }
  .toggle input:checked + .toggle-slider::after {
    left: 20px;
    background: #4ade80;
  }
  .toggle-label {
    font-size: 0.85rem;
    color: var(--text);
    font-weight: 500;
  }
</style>
