<script>
	/** @type {{ titulo: string, onCerrar: () => void, children: import('svelte').Snippet }} */
	let { titulo, onCerrar, children } = $props();

	/** @type {HTMLDialogElement | undefined} */
	let dialogo = $state();

	$effect(() => {
		dialogo?.showModal();
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialogo}
	aria-label={titulo}
	onclose={onCerrar}
	onclick={(e) => {
		if (e.target === e.currentTarget) dialogo?.close();
	}}
>
	<div class="contenido">
		<header>
			<h2>{titulo}</h2>
			<button class="cerrar" aria-label="Cerrar" onclick={() => dialogo?.close()}>×</button>
		</header>
		{@render children()}
	</div>
</dialog>

<style>
	dialog {
		border: 0;
		padding: 0;
		border-radius: 20px;
		width: min(460px, calc(100vw - 32px));
		box-shadow: 0 24px 60px rgba(29, 29, 31, 0.2);
		color: var(--texto);
	}

	dialog::backdrop {
		background: rgba(29, 29, 31, 0.35);
		backdrop-filter: blur(2px);
	}

	.contenido {
		padding: 1.5rem;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	h2 {
		margin: 0;
		font-size: 1.2rem;
	}

	.cerrar {
		border: 0;
		background: transparent;
		font-size: 1.6rem;
		line-height: 1;
		color: var(--gris);
		width: 36px;
		height: 36px;
		border-radius: 50%;
	}

	.cerrar:hover {
		background: var(--naranja-claro);
		color: var(--naranja);
	}
</style>
