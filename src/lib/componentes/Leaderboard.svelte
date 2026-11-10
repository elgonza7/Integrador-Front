<script>
	import './estilos/leaderboard.css';
	import { TOP_RANKING } from '#lib/constants.js';

	/** @type {{ ranking: import('#lib/juego.svelte.js').EntradaRanking[], hardcoreInicial: boolean }} */
	let { ranking, hardcoreInicial } = $props();

	let verHardcore = $state(false);
	$effect.pre(() => {
		verHardcore = hardcoreInicial;
	});

	const filas = $derived(ranking.filter((e) => e.hardcore === verHardcore).slice(0, TOP_RANKING));
	const formatoFecha = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit' });
</script>

<div class="leaderboard">
	<div class="tabs" role="tablist">
		<button role="tab" aria-selected={!verHardcore} class:activa={!verHardcore} onclick={() => (verHardcore = false)}>
			Normal
		</button>
		<button role="tab" aria-selected={verHardcore} class:activa={verHardcore} onclick={() => (verHardcore = true)}>
			Hardcore
		</button>
	</div>

	{#if filas.length === 0}
		<p class="vacio">Todavía no hay puntajes en este modo. ¡Sé el primero!</p>
	{:else}
		<ol class="tabla lista-filas">
			{#each filas as fila, i (fila.fecha)}
				<li class:podio={i === 0}>
					<span class="pos">{i + 1}</span>
					<span class="nombre">{fila.nombre}</span>
					<span class="detalle">{fila.aciertos}/4 · {formatoFecha.format(new Date(fila.fecha))}</span>
					<span class="pts">{fila.puntos}</span>
				</li>
			{/each}
		</ol>
	{/if}
</div>
