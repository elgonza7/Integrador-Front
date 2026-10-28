<script>
	import { fade } from 'svelte/transition';
	import { leer } from '#lib/storage.js';

	/**
	 * @type {{
	 *   sesion: import('#lib/juego.svelte.js').Sesion,
	 *   puntos: number,
	 *   onGuardar: (nombre: string) => void,
	 *   onNuevaPartida: () => void,
	 *   onVerRanking: () => void
	 * }}
	 */
	let { sesion, puntos, onGuardar, onNuevaPartida, onVerRanking } = $props();

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

	<ul class="lista">
		{#each sesion.rondas as ronda (ronda.juego.id)}
			<li>
				{#if ronda.juego.imagen}
					<img src={ronda.juego.imagen} alt="" loading="lazy" />
				{:else}
					<span class="mini"></span>
				{/if}
				<span class="nombre">{ronda.juego.nombre}</span>
				<span class="anio">{ronda.juego.anio}</span>
				<span class="pts" class:fallado={ronda.estado === 'fallado'}>
					{ronda.estado === 'acertado' ? `+${ronda.puntos}` : '0'}
				</span>
			</li>
		{/each}
	</ul>

	{#if sesion.guardada}
		<p class="guardado">
			Puntaje guardado. <button class="link" onclick={onVerRanking}>Ver leaderboard</button>
		</p>
	{:else}
		<form onsubmit={enviar}>
			<label for="nombre">Tu nombre para el ranking</label>
			<div class="fila">
				<input id="nombre" bind:value={nombre} maxlength="20" placeholder="Ej: Gokin" required autocomplete="nickname" />
				<button class="btn-secundario" type="submit">Guardar</button>
			</div>
		</form>
	{/if}

	<button class="btn-primario" onclick={onNuevaPartida}>Nueva partida</button>
</section>

<style>
	.resultados {
		width: 100%;
		max-width: 480px;
		margin: 1rem auto 3rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.etiqueta {
		margin: 0;
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--gris);
	}

	.total {
		margin: 0.25rem 0 0;
		font-size: 4.5rem;
		font-weight: 800;
		color: var(--naranja);
		line-height: 1;
		letter-spacing: -0.03em;
	}

	.total span {
		font-size: 1.2rem;
		margin-left: 0.3rem;
		letter-spacing: 0;
	}

	.resumen {
		margin: 0.5rem 0 1.5rem;
		color: var(--gris);
	}

	.lista {
		list-style: none;
		padding: 0;
		margin: 0 0 1.5rem;
		width: 100%;
		text-align: left;
	}

	.lista li {
		display: grid;
		grid-template-columns: 56px 1fr auto 3.5rem;
		align-items: center;
		gap: 0.75rem;
		padding: 0.55rem 0;
		border-bottom: 1px solid var(--linea);
	}

	.lista img,
	.mini {
		width: 56px;
		height: 36px;
		border-radius: 6px;
		object-fit: cover;
		background: var(--naranja-claro);
		display: block;
	}

	.nombre {
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.anio {
		color: var(--gris);
		font-variant-numeric: tabular-nums;
	}

	.pts {
		text-align: right;
		font-weight: 800;
		color: var(--naranja);
	}

	.pts.fallado {
		color: var(--rojo);
	}

	form {
		width: 100%;
		text-align: left;
		margin-bottom: 1.25rem;
	}

	label {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--gris);
	}

	.fila {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.4rem;
	}

	input {
		flex: 1;
		min-width: 0;
		font: inherit;
		padding: 0.65rem 1rem;
		border: 1.5px solid var(--linea);
		border-radius: 999px;
		outline: none;
	}

	input:focus {
		border-color: var(--naranja);
	}

	.guardado {
		color: var(--gris);
		margin: 0 0 1.25rem;
	}

	.link {
		border: 0;
		background: none;
		padding: 0;
		color: var(--naranja);
		font-weight: 600;
		text-decoration: underline;
	}
</style>
