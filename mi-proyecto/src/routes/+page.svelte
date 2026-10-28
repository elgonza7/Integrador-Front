<script>
	import { onMount } from 'svelte';
	import { juego } from '#lib/juego.svelte.js';
	import Header from '#lib/componentes/Header.svelte';
	import JuegoCard from '#lib/componentes/JuegoCard.svelte';
	import Semaforo from '#lib/componentes/Semaforo.svelte';
	import LineaTemporal from '#lib/componentes/LineaTemporal.svelte';
	import Resultados from '#lib/componentes/Resultados.svelte';
	import Modal from '#lib/componentes/Modal.svelte';
	import Leaderboard from '#lib/componentes/Leaderboard.svelte';
	import Configuracion from '#lib/componentes/Configuracion.svelte';

	let verRanking = $state(false);
	let verConfig = $state(false);

	onMount(() => {
		juego.iniciar();
	});

	const pista = $derived.by(() => {
		const ronda = juego.ronda;
		if (!ronda || ronda.estado !== 'jugando' || ronda.intentos.length === 0) return null;
		const ultimo = ronda.intentos[ronda.intentos.length - 1];
		return { anio: ultimo, cerca: Math.abs(ultimo - ronda.juego.anio) === 1 };
	});

	const esUltima = $derived(!!juego.sesion && juego.sesion.actual === juego.sesion.rondas.length - 1);
	const cambioPendiente = $derived(
		!!juego.sesion && !juego.terminada && juego.sesion.hardcore !== juego.hardcore
	);
</script>

<div class="app">
	<Header
		puntos={juego.puntosTotales}
		hardcore={juego.sesion?.hardcore ?? false}
		onRanking={() => (verRanking = true)}
		onConfig={() => (verConfig = true)}
	/>

	{#if juego.cargando}
		<div class="cargando"><span class="spinner"></span>Cargando juegos…</div>
	{:else if juego.sesion && juego.terminada}
		<Resultados
			sesion={juego.sesion}
			puntos={juego.puntosTotales}
			onGuardar={(nombre) => juego.guardarEnRanking(nombre)}
			onNuevaPartida={() => juego.nuevaPartida()}
			onVerRanking={() => (verRanking = true)}
		/>
	{:else if juego.sesion && juego.ronda}
		{@const ronda = juego.ronda}
		<main class="tablero">
			<section class="centro">
				{#key ronda.juego.id}
					<JuegoCard juego={ronda.juego} revelado={ronda.estado !== 'jugando'} />
				{/key}

				<div class="estado" aria-live="polite">
					{#if ronda.estado === 'jugando'}
						<p class="intento">Intento {ronda.intentos.length + 1} de {juego.intentosMax}</p>
						{#if pista}
							<p class="pista">No es {pista.anio}, {pista.cerca ? '¡estás cerca!' : 'estás lejos.'}</p>
						{/if}
					{:else}
						<p class="veredicto" class:ok={ronda.estado === 'acertado'}>
							{ronda.estado === 'acertado' ? `¡Correcto! +${ronda.puntos} pts` : `Era ${ronda.juego.anio}`}
						</p>
						<button class="btn-primario" onclick={() => juego.siguiente()}>
							{esUltima ? 'Ver resultados' : 'Siguiente juego →'}
						</button>
					{/if}
				</div>
			</section>

			<aside class="lateral">
				<Semaforo rondas={juego.sesion.rondas} actual={juego.sesion.actual} />
			</aside>
		</main>

		<LineaTemporal {ronda} onElegir={(anio) => juego.elegir(anio)} />
	{/if}

	{#if juego.origen === 'respaldo'}
		<p class="aviso-api">
			Sin conexión a RAWG: usando juegos de respaldo. Configurá <code>VITE_RAWG_KEY</code> en
			<code>.env</code> para traer juegos e imágenes reales.
		</p>
	{/if}
</div>

{#if verRanking}
	<Modal titulo="Leaderboard" onCerrar={() => (verRanking = false)}>
		<Leaderboard ranking={juego.ranking} hardcoreInicial={juego.sesion?.hardcore ?? juego.hardcore} />
	</Modal>
{/if}

{#if verConfig}
	<Modal titulo="Configuración" onCerrar={() => (verConfig = false)}>
		<Configuracion
			hardcore={juego.hardcore}
			{cambioPendiente}
			onCambiar={(valor) => juego.setHardcore(valor)}
			onNuevaPartida={() => {
				juego.nuevaPartida();
				verConfig = false;
			}}
			onBorrar={() => {
				juego.borrarDatos();
				verConfig = false;
			}}
		/>
	</Modal>
{/if}

<style>
	.app {
		max-width: 1080px;
		min-height: 100vh;
		margin: 0 auto;
		padding: 0 1.5rem;
		display: flex;
		flex-direction: column;
	}

	.tablero {
		flex: 1;
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: 2rem;
		padding: 0.5rem 0 2.5rem;
	}

	.centro {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding-left: 76px;
	}

	.estado {
		min-height: 5.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
		text-align: center;
	}

	.intento {
		margin: 0;
		color: var(--gris);
		font-weight: 500;
	}

	.pista {
		margin: 0;
		font-weight: 600;
		color: var(--rojo);
	}

	.veredicto {
		margin: 0;
		font-size: 1.15rem;
		font-weight: 800;
		color: var(--rojo);
	}

	.veredicto.ok {
		color: var(--naranja);
	}

	.cargando {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		color: var(--gris);
	}

	.spinner {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		border: 3px solid var(--naranja-claro);
		border-top-color: var(--naranja);
		animation: girar 0.8s linear infinite;
	}

	.aviso-api {
		margin: 0 auto 1.5rem;
		font-size: 0.8rem;
		color: var(--gris);
		text-align: center;
	}

	code {
		background: var(--naranja-claro);
		color: var(--naranja-oscuro);
		padding: 0.1rem 0.35rem;
		border-radius: 4px;
	}

	@keyframes girar {
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 720px) {
		.app {
			padding: 0 1rem;
		}

		.tablero {
			grid-template-columns: minmax(0, 1fr);
			gap: 1rem;
			padding-bottom: 1.5rem;
		}

		.centro {
			padding-left: 0;
		}

		.lateral {
			order: -1;
			justify-self: center;
		}
	}
</style>
