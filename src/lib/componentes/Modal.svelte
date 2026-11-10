<script>
	import './estilos/modal.css';
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
	class="modal"
	bind:this={dialogo}
	aria-label={titulo}
	onclose={onCerrar}
	onclick={(e) => {
		if (e.target === e.currentTarget) dialogo?.close();
	}}
>
	<div class="contenido">
		<header class="encabezado">
			<h2>{titulo}</h2>
			<button class="btn-icono" aria-label="Cerrar" onclick={() => dialogo?.close()}>×</button>
		</header>
		{@render children()}
	</div>
</dialog>
