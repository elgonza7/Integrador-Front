<script>
	import './estilos/resultados.css';
	import { fade } from 'svelte/transition';
	import { leer } from '#lib/storage.js';

	/**
	 * @type {{
	 *   sesion: import('#lib/juego.svelte.js').Sesion,
	 *   puntos: number,
	 *   estadoGuardado: import('#lib/juego.svelte.js').EstadoGuardado,
	 *   mejorPuntaje: number | null,
	 *   onGuardar: (nombre: string) => void,
	 *   onNuevaPartida: () => void,
	 *   onVerRanking: () => void
	 * }}
	 */
	let { sesion, puntos, estadoGuardado, mejorPuntaje, onGuardar, onNuevaPartida, onVerRanking } = $props();

	let nombre = $state(leer('ultimoNombre', ''));
	const aciertos = $derived(sesion.rondas.filter((r) => r.estado === 'acertado').length);

	/** @param {SubmitEvent} e */
	function enviar(e) {
		e.preventDefault();
		onGuardar(nombre);
	}
</script>

<section class="resultados" in:fade={{ duration: 250 }}>
	<p class="etiqueta">Partida terminada{sesion.hardcore ? ' · Hardcore' : ''}</p>
	<p class="total">{puntos}<span>pts</span></p>
	<p class="resumen">Acertaste {aciertos} de {sesion.rondas.length} juegos</p>

	<ul class="lista lista-filas">
		{#each sesion.rondas as ronda (ronda.juego.id)}
			<li>
				{#if ronda.juego.imagen}
					<img src={ronda.juego.imagen} alt="" loading="lazy" />
				{:else}
					<span class="mini"></span>
				{/if}
				<span class="nombre">{ronda.juego.nombre}</span>
				<span class="año">{ronda.juego.año}</span>
				<span class="pts" class:fallado={ronda.puntos <= 0}>
					{ronda.puntos > 0 ? `+${ronda.puntos}` : ronda.puntos}
				</span>
			</li>
		{/each}
	</ul>

	{#if sesion.guardada}
		<p class="guardado">
			{mejorPuntaje !== null && mejorPuntaje > puntos
				? `Tu mejor puntaje sigue siendo ${mejorPuntaje}.`
				: 'Puntaje guardado.'}
			<button class="btn-link" onclick={onVerRanking}>Ver leaderboard</button>
		</p>
	{:else}
		<form onsubmit={enviar}>
			<label for="nombre">Tu nombre para el ranking</label>
			<div class="fila">
				<input id="nombre" bind:value={nombre} maxlength="20" placeholder="Ej: Gokin" required autocomplete="nickname" />
				<button class="btn-secundario" type="submit" disabled={estadoGuardado === 'guardando'}>
					{estadoGuardado === 'guardando' ? 'Guardando…' : 'Guardar'}
				</button>
			</div>
			{#if estadoGuardado === 'error'}
				<p class="error">No se pudo guardar. Revisá tu conexión y probá de nuevo.</p>
			{/if}
		</form>
	{/if}

	<button class="btn-primario" onclick={onNuevaPartida}>Nueva partida</button>
</section>
