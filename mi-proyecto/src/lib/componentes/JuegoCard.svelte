<script>
	import { fade } from 'svelte/transition';

	/** @type {{ juego: import('#lib/api.js').Juego, revelado: boolean }} */
	let { juego, revelado } = $props();

	let fallo = $state(false);

	const iniciales = $derived(
		juego.nombre
			.split(/\s+/)
			.filter((p) => /^[A-Z0-9]/.test(p))
			.slice(0, 2)
			.map((p) => p[0])
			.join('')
	);
</script>

<figure class="card" in:fade={{ duration: 250 }}>
	<figcaption class="titulo">{juego.nombre}</figcaption>
	<div class="marco">
		{#if juego.imagen && !fallo}
			<img src={juego.imagen} alt="Imagen de {juego.nombre}" onerror={() => (fallo = true)} />
		{:else}
			<div class="placeholder" aria-hidden="true">{iniciales}</div>
		{/if}

		{#if revelado}
			<span class="anio" in:fade={{ duration: 200 }}>{juego.anio}</span>
		{/if}
	</div>
</figure>

<style>
	.card {
		margin: 0;
		width: 100%;
		max-width: 520px;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.titulo {
		font-size: 1.25rem;
		font-weight: 600;
		text-align: center;
		line-height: 1.3;
	}

	.marco {
		position: relative;
		aspect-ratio: 16 / 10;
		border-radius: var(--radio);
		overflow: hidden;
		background: var(--naranja-claro);
		box-shadow: var(--sombra);
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		animation: aparecer 0.4s ease;
	}

	.placeholder {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
		font-size: 4rem;
		font-weight: 800;
		color: var(--naranja);
		background: linear-gradient(135deg, var(--naranja-claro), #fff);
	}

	.anio {
		position: absolute;
		right: 0.75rem;
		bottom: 0.75rem;
		background: var(--naranja);
		color: #fff;
		font-weight: 800;
		font-size: 1.5rem;
		padding: 0.3rem 0.9rem;
		border-radius: 999px;
		box-shadow: 0 4px 14px rgba(255, 107, 0, 0.35);
	}

	@keyframes aparecer {
		from {
			opacity: 0;
		}
	}
</style>
