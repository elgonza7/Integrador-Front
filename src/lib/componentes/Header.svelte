<script>
	import './estilos/header.css';
	import { tema } from '#lib/utilidades/tema.svelte.js';
	/** @type {{ puntos: number, hardcore: boolean, onRanking: () => void, onConfig: () => void }} */
	let { puntos, hardcore, onRanking, onConfig } = $props();
</script>

<header class="cabecera">
	<h1 class="logo">¿En qué <span>año</span>?</h1>

	<div class="acciones">
		{#if hardcore}<span class="badge">Hardcore</span>{/if}
		<span class="puntos" aria-label="Puntos de la partida">{puntos} pts</span>
		<button
			class="btn-icono"
			aria-label={tema.oscuro ? 'Pasar a modo claro' : 'Pasar a modo oscuro'}
			title={tema.oscuro ? 'Modo claro' : 'Modo oscuro'}
			onclick={() => tema.alternar()}
		>
			{#if tema.oscuro}
				<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
					<circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8" />
					<path
						d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4M18.7 18.7l-1.4-1.4M6.7 6.7 5.3 5.3"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
					/>
				</svg>
			{:else}
				<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
					<path
						d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linejoin="round"
					/>
				</svg>
			{/if}
		</button>
		<button class="btn-icono" aria-label="Configuración" onclick={onConfig}>
			<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
				<circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8" />
				<circle cx="12" cy="12" r="6.6" fill="none" stroke="currentColor" stroke-width="1.8" />
				<path
					d="M12 2.5v2.6M12 18.9v2.6M21.5 12h-2.6M5.1 12H2.5M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8M18.7 18.7l-1.8-1.8M7.1 7.1 5.3 5.3"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
				/>
			</svg>
		</button>
		<button class="btn-texto" onclick={onRanking}>Leaderboard</button>
	</div>
</header>
