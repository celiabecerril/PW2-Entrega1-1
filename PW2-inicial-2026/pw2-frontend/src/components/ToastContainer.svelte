<script>
  import { toasts } from '../stores/toasts.svelte.js'
</script>

<div class="toast-container">
  {#each toasts.list as toast (toast.id)}
    <div class="toast toast--{toast.type}" role="alert">
      <span class="toast-icon">
        {#if toast.type === 'success'}✓{:else if toast.type === 'error'}✕{:else}ℹ{/if}
      </span>
      {toast.message}
      <button class="toast-close" onclick={() => toasts.remove(toast.id)}>×</button>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    max-width: 360px;
  }
  .toast {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.85rem 1.1rem;
    border-radius: 10px;
    font-family: var(--font-sans);
    font-size: 0.88rem;
    font-weight: 500;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    animation: slideIn 0.25s ease;
    border-left: 4px solid currentColor;
  }
  .toast--success { background: #0f2016; color: #4ade80; }
  .toast--error   { background: #1f0a0a; color: #f87171; }
  .toast--info    { background: #0f1620; color: #60a5fa; }
  .toast-icon { font-size: 1rem; font-weight: 700; }
  .toast-close {
    margin-left: auto;
    background: none;
    border: none;
    color: inherit;
    opacity: 0.6;
    cursor: pointer;
    font-size: 1.1rem;
    line-height: 1;
  }
  .toast-close:hover { opacity: 1; }
  @keyframes slideIn {
    from { transform: translateX(110%); opacity: 0; }
    to   { transform: translateX(0); opacity: 1; }
  }
</style>
