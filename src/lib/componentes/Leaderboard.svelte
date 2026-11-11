<script>
	import './estilos/leaderboard.css';
	import { obtenerRanking } from '#lib/servicios/ranking.js';
	import { leerNombre } from '#lib/utilidades/storage.js';
	import FilaRanking from './base/FilaRanking.svelte';

	/** @type {{ hardcoreInicial: boolean }} */
	let { hardcoreInicial } = $props();

	let verHardcore = $state(false);
	$effect.pre(() => {
		verHardcore = hardcoreInicial;
	});

	/** @type {Awaited<ReturnType<typeof obtenerRanking>> | null} */
	let datos = $state(null);
	let error = $state(false);
	const miNombre = leerNombre();

	$effect(() => {
		const modo = verHardcore;
		let vigente = true;
		datos = null;
		error = false;
		obtenerRanking(modo, miNombre)
			.then((r) => vigente && (datos = r))
			.catch((e) => {
				console.error('No se pudo leer el ranking:', e);
				if (vigente) error = true;
			});
		// si cambio de pestaña antes de que llegue la respuesta, ignoro la vieja
		return () => (vigente = false);
	});

	const yoEnTop = $derived.by(() => {
		const d = datos;
		return !!d?.yo && d.top.some((f) => f.id === d.yo?.id);
	});
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

	{#if error}
		<p class="vacio">No se pudo cargar el ranking. Probá de nuevo en un rato.</p>
	{:else if !datos}
		<p class="vacio">Cargando ranking…</p>
	{:else if datos.top.length === 0}
		<p class="vacio">Todavía no hay puntajes en este modo. ¡Sé el primero!</p>
	{:else}
		<ol class="tabla lista-filas">
			{#each datos.top as fila, i (fila.id)}
				<FilaRanking posicion={i + 1} nombre={fila.nombre} puntos={fila.puntos} podio={i === 0} yo={fila.id === datos.yo?.id} />
			{/each}

			{#if datos.yo && !yoEnTop}
				<li class="separador" aria-hidden="true">···</li>
				<FilaRanking posicion={datos.yo.posicion} nombre={datos.yo.nombre} puntos={datos.yo.puntos} yo />
			{/if}
		</ol>
	{/if}
</div>
