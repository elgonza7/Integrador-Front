<script>
	/** @type {{ ronda: import('#lib/juego.svelte.js').Ronda, onElegir: (anio: number) => void }} */
	let { ronda, onElegir } = $props();

	const resuelta = $derived(ronda.estado !== 'jugando');
</script>

<div class="linea" role="group" aria-label="Elegí el año de lanzamiento">
	<div class="eje" aria-hidden="true"></div>
	{#each ronda.linea as anio (anio)}
		{@const descartado = ronda.intentos.includes(anio) && anio !== ronda.juego.anio}
		{@const correcto = resuelta && anio === ronda.juego.anio}
		<button
			class="marca"
			class:descartado
			class:correcto
			disabled={resuelta || descartado}
			aria-label={descartado ? `${anio}, descartado` : String(anio)}
			onclick={() => onElegir(anio)}
		>
			<span class="palito" aria-hidden="true"></span>
			<span class="anio">{anio}</span>
		</button>
	{/each}
</div>

<style>
	.linea {
		position: relative;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		width: 100%;
		max-width: 920px;
		margin: 0 auto;
		padding-bottom: 1.5rem;
	}

	.eje {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		border-radius: 2px;
		background: var(--texto);
	}

	.marca {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.55rem;
		background: none;
		border: 0;
		padding: 0;
	}

	.palito {
		width: 3px;
		height: 28px;
		border-radius: 0 0 2px 2px;
		background: var(--texto);
		transition: height 0.15s, background 0.15s;
	}

	.anio {
		font-size: 1.1rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		padding: 0.4rem 0.8rem;
		border-radius: 999px;
		transition: background 0.15s, color 0.15s;
	}

	.marca:not(:disabled):hover .palito,
	.marca:not(:disabled):focus-visible .palito {
		height: 38px;
		background: var(--naranja);
	}

	.marca:not(:disabled):hover .anio,
	.marca:not(:disabled):focus-visible .anio {
		background: var(--naranja-claro);
		color: var(--naranja);
	}

	.marca:focus-visible {
		outline: none;
	}

	.descartado .palito {
		background: var(--linea);
	}

	.descartado .anio {
		color: var(--gris);
		text-decoration: line-through;
	}

	.correcto .palito {
		height: 40px;
		background: var(--naranja);
	}

	.correcto .anio {
		background: var(--naranja);
		color: #fff;
	}

	@media (max-width: 520px) {
		.anio {
			font-size: 0.95rem;
			padding: 0.35rem 0.5rem;
		}
	}
</style>
