<script>
	import '../estilos/portada.css';

	// la usan JuegoCard (grande) y Resultados (mini)
	/**
	 * @type {{
	 *   juego: import('#lib/servicios/api.js').Juego,
	 *   mini?: boolean,
	 *   children?: import('svelte').Snippet
	 * }}
	 */
	let { juego, mini = false, children } = $props();

	let fallo = $state(false);

	const iniciales = $derived(
		juego.nombre
			.split(/\s+/)
			.filter((p) => /^[A-Z0-9]/.test(p))
			.slice(0, 2)
			.map((p) => p[0])
			.join('')
	);
</script>

<div class="portada" class:mini>
	{#if juego.imagen && !fallo}
		<img
			src={juego.imagen}
			alt={mini ? '' : `Imagen de ${juego.nombre}`}
			loading={mini ? 'lazy' : 'eager'}
			onerror={() => (fallo = true)}
		/>
	{:else}
		<div class="placeholder" aria-hidden="true">{mini ? '' : iniciales}</div>
	{/if}

	{@render children?.()}
</div>
