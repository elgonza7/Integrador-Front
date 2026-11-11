<script>
	import './estilos/semaforo.css';
	/** @typedef {import('#lib/juego/juego.svelte.js').Ronda} Ronda */

	/** @type {{ rondas: Ronda[], actual: number }} */
	let { rondas, actual } = $props();

	/** @param {Ronda} ronda @param {number} i */
	function etiqueta(ronda, i) {
		if (ronda.estado === 'acertado') return 'acertado';
		if (ronda.estado === 'fallado') return 'fallado';
		return i === actual ? 'en juego' : 'pendiente';
	}
</script>

<ol class="semaforo" aria-label="Juegos de esta partida">
	{#each rondas as ronda, i (ronda.juego.id)}
		<li class="luz {ronda.estado}" class:actual={i === actual} title="Juego {i + 1}: {etiqueta(ronda, i)}">
			<span class="sr-only">Juego {i + 1}: {etiqueta(ronda, i)}</span>
		</li>
	{/each}
</ol>
