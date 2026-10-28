<script>
	/** @typedef {import('#lib/juego.svelte.js').Ronda} Ronda */

	/** @type {{ rondas: Ronda[], actual: number }} */
	let { rondas, actual } = $props();

	/** @param {Ronda} ronda @param {number} i */
	function etiqueta(ronda, i) {
		if (ronda.estado === 'acertado') return 'acertado';
		if (ronda.estado === 'fallado') return 'fallado';
		return i === actual ? 'en juego' : 'pendiente';
	}
</script>

<ol class="semaforo" aria-label="Juegos de esta partida">
	{#each rondas as ronda, i (ronda.juego.id)}
		<li class="luz {ronda.estado}" class:actual={i === actual} title="Juego {i + 1}: {etiqueta(ronda, i)}">
			<span class="sr-only">Juego {i + 1}: {etiqueta(ronda, i)}</span>
		</li>
	{/each}
</ol>

<style>
	.semaforo {
		list-style: none;
		margin: 0;
		padding: 0.9rem 0.7rem;
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
		border: 2px solid var(--linea);
		border-radius: 999px;
	}

	.luz {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: var(--linea);
		transition: background 0.3s, box-shadow 0.3s, transform 0.3s;
	}

	.luz.actual.jugando {
		background: #fff;
		box-shadow: inset 0 0 0 3px var(--naranja);
		animation: latido 1.6s ease-in-out infinite;
	}

	.luz.acertado {
		background: var(--naranja);
		box-shadow: 0 0 14px rgba(255, 107, 0, 0.45);
	}

	.luz.fallado {
		background: var(--rojo);
	}

	@keyframes latido {
		50% {
			transform: scale(0.9);
		}
	}

	@media (max-width: 720px) {
		.semaforo {
			flex-direction: row;
			padding: 0.5rem 0.8rem;
			gap: 0.6rem;
		}
		.luz {
			width: 22px;
			height: 22px;
		}
		.luz.actual.jugando {
			box-shadow: inset 0 0 0 2.5px var(--naranja);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.luz {
			animation: none !important;
		}
	}
</style>
