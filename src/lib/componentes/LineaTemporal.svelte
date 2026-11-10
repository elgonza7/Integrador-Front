<script>
	import './estilos/linea-temporal.css';
	/** @type {{ ronda: import('#lib/juego.svelte.js').Ronda, onElegir: (anio: number) => void }} */
	let { ronda, onElegir } = $props();

	const resuelta = $derived(ronda.estado !== 'jugando');
</script>

<div class="linea" role="group" aria-label="Elegí el año de lanzamiento">
	<div class="eje" aria-hidden="true"></div>
	{#each ronda.linea as anio (anio)}
		{@const descartado = ronda.intentos.includes(anio) && anio !== ronda.juego.anio}
		{@const correcto = resuelta && anio === ronda.juego.anio}
		<button
			class="marca"
			class:descartado
			class:correcto
			disabled={resuelta || descartado}
			aria-label={descartado ? `${anio}, descartado` : String(anio)}
			onclick={() => onElegir(anio)}
		>
			<span class="palito" aria-hidden="true"></span>
			<span class="anio">{anio}</span>
		</button>
	{/each}
</div>
