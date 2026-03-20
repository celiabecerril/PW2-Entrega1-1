<script>
  // UserRow.svelte — fila de usuario en la tabla de administración
  // Usa $props() y callbacks para comunicación con el padre
  let { user, currentUserId, onChangeRole, onDelete } = $props()
</script>

<tr class="user-row">
  <td class="td-name">
    <div class="user-info">
      <span class="user-initial">{user.username.slice(0,1).toUpperCase()}</span>
      <span class="user-name">{user.username}</span>
      {#if user._id === currentUserId}
        <span class="you-badge">tú</span>
      {/if}
    </div>
  </td>
  <td class="td-role">
    <span class="role-tag" class:admin={user.role === 'admin'}>{user.role}</span>
  </td>
  <td class="td-id">
    <span class="mono">{user._id}</span>
  </td>
  <td class="td-actions">
    {#if user._id !== currentUserId}
      <button
        class="btn-role"
        onclick={() => onChangeRole(user)}
        title={user.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
      >
        {user.role === 'admin' ? '↓ user' : '↑ admin'}
      </button>
      <button class="btn-del" onclick={() => onDelete(user)} title="Eliminar usuario">✕</button>
    {:else}
      <span class="self-note">—</span>
    {/if}
  </td>
</tr>

<style>
  .user-row { border-bottom: 1px solid var(--border); }
  .user-row:last-child { border-bottom: none; }
  td {
    padding: 0.85rem 1rem;
    font-family: var(--font-sans);
    font-size: 0.875rem;
    color: var(--text);
    vertical-align: middle;
  }
  .user-info { display: flex; align-items: center; gap: 0.6rem; }
  .user-initial {
    width: 28px; height: 28px;
    border-radius: 50%;
    background: rgba(34,197,94,0.12);
    color: var(--accent);
    font-weight: 700;
    font-size: 0.8rem;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .user-name { font-weight: 500; }
  .you-badge {
    font-size: 0.68rem;
    font-weight: 700;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    background: rgba(34,197,94,0.12);
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .role-tag {
    font-size: 0.72rem;
    font-weight: 600;
    padding: 0.2rem 0.55rem;
    border-radius: 5px;
    background: rgba(0,0,0,0.05);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .role-tag.admin { background: rgba(34,197,94,0.12); color: var(--accent); }
  .td-id { color: var(--text-muted); }
  .mono { font-family: monospace; font-size: 0.75rem; }
  .td-actions { display: flex; gap: 0.4rem; align-items: center; }
  .btn-role, .btn-del {
    padding: 0.3rem 0.65rem;
    border-radius: 6px;
    font-family: var(--font-sans);
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-role {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-muted);
  }
  .btn-role:hover { border-color: var(--accent); color: var(--accent); }
  .btn-del {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-muted);
  }
  .btn-del:hover { border-color: #f87171; color: #f87171; }
  .self-note { color: var(--text-muted); font-size: 0.85rem; }

  @media (max-width: 640px) {
    .td-id { display: none; }
  }
</style>
