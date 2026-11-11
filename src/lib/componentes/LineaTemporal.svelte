<script>
	import './estilos/linea-temporal.css';
	/** @type {{ ronda: import('#lib/juego.svelte.js').Ronda, onElegir: (año: number) => void }} */
	let { ronda, onElegir } = $props();

	const resuelta = $derived(ronda.estado !== 'jugando');
</script>

<div class="linea" role="group" aria-label="Elegí el año de lanzamiento">
	<div class="eje" aria-hidden="true"></div>
	{#each ronda.linea as año (año)}
		{@const descartado = ronda.intentos.includes(año) && año !== ronda.juego.año}
		{@const correcto = resuelta && año === ronda.juego.año}
		<button
			class="marca"
			class:descartado
			class:correcto
			disabled={resuelta || descartado}
			aria-label={descartado ? `${año}, descartado` : String(año)}
			onclick={() => onElegir(año)}
		>
			<span class="palito" aria-hidden="true"></span>
			<span class="año">{año}</span>
		</button>
	{/each}
</div>
