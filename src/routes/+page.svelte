<script>
	import '#lib/componentes/estilos/pagina.css';
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
