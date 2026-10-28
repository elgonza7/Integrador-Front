<script>
	/** @type {{ puntos: number, hardcore: boolean, onRanking: () => void, onConfig: () => void }} */
	let { puntos, hardcore, onRanking, onConfig } = $props();
</script>

<header class="cabecera">
	<h1 class="logo">¿En qué <span>año</span>?</h1>

	<div class="acciones">
		{#if hardcore}<span class="badge">Hardcore</span>{/if}
		<span class="puntos" aria-label="Puntos de la partida">{puntos} pts</span>
		<button class="icono" aria-label="Configuración" onclick={onConfig}>
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
		<button class="ranking" onclick={onRanking}>Leaderboard</button>
	</div>
</header>

<style>
	.cabecera {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1.25rem 0;
	}

	.logo {
		margin: 0;
		font-size: 1.35rem;
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	.logo span {
		color: var(--naranja);
	}

	.acciones {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.badge {
		background: var(--texto);
		color: #fff;
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		padding: 0.3rem 0.6rem;
		border-radius: 999px;
	}

	.puntos {
		font-weight: 600;
		color: var(--naranja);
		font-variant-numeric: tabular-nums;
		padding: 0 0.4rem;
	}

	.icono {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		border: 0;
		border-radius: 50%;
		background: transparent;
		color: var(--gris);
		transition: color 0.15s, background 0.15s;
	}

	.icono:hover {
		color: var(--naranja);
		background: var(--naranja-claro);
	}

	.ranking {
		border: 0;
		background: transparent;
		font-weight: 600;
		font-size: 0.85rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--gris);
		padding: 0.5rem 0.25rem;
	}

	.ranking:hover {
		color: var(--naranja);
	}

	.logo,
	.puntos {
		white-space: nowrap;
	}

	@media (max-width: 520px) {
		.cabecera {
			gap: 0.5rem;
		}
		.acciones {
			gap: 0.2rem;
		}
		.logo {
			font-size: 1.1rem;
		}
		.badge {
			display: none;
		}
		.ranking {
			font-size: 0.75rem;
		}
	}
</style>
