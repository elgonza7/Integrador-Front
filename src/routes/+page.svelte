<script>
	import '#lib/componentes/estilos/pagina.css';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
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
			estadoGuardado={juego.estadoGuardado}
			mejorPuntaje={juego.mejorPuntaje}
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
						{#if juego.costoProximaPista !== null}
							<button class="btn-pista" onclick={() => juego.pedirPista()}>
								Pedir pista <span>−{juego.costoProximaPista} pts</span>
							</button>
						{/if}
						{#if juego.pistaActual}
							{#key juego.pistaActual.texto}
								<p class="ayuda" in:fade={{ duration: 250 }}>
									<span class="ayuda-titulo">{juego.pistaActual.titulo}</span>
									{juego.pistaActual.texto}
								</p>
							{/key}
						{/if}
						{#if juego.ultimoError !== null}
							{#key juego.ultimoError}
								<p class="incorrecto">✗ Incorrecto, no es {juego.ultimoError}</p>
							{/key}
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
		<Leaderboard hardcoreInicial={juego.sesion?.hardcore ?? juego.hardcore} />
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
