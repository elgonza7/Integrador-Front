<script>
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
	<ol class="tabla">
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

<style>
	.tabs {
		display: flex;
		gap: 0.3rem;
		background: #f5f5f6;
		padding: 0.25rem;
		border-radius: 999px;
		margin-bottom: 1rem;
	}

	.tabs button {
		flex: 1;
		border: 0;
		background: transparent;
		padding: 0.5rem;
		border-radius: 999px;
		font-weight: 600;
		color: var(--gris);
	}

	.tabs button.activa {
		background: #fff;
		color: var(--naranja);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
	}

	.vacio {
		color: var(--gris);
		text-align: center;
		padding: 1.5rem 0;
		margin: 0;
	}

	.tabla {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.tabla li {
		display: grid;
		grid-template-columns: 2rem 1fr auto auto;
		align-items: center;
		gap: 0.75rem;
		padding: 0.65rem 0.25rem;
		border-bottom: 1px solid var(--linea);
	}

	.tabla li:last-child {
		border-bottom: 0;
	}

	.pos {
		font-weight: 800;
		color: var(--gris);
		text-align: center;
	}

	.podio .pos {
		color: var(--naranja);
	}

	.nombre {
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.detalle {
		font-size: 0.8rem;
		color: var(--gris);
	}

	.pts {
		font-weight: 800;
		color: var(--naranja);
		font-variant-numeric: tabular-nums;
		min-width: 3ch;
		text-align: right;
	}
</style>
