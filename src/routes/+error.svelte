<script>
	import { page } from '$app/state';

	const mensaje = $derived(page.error?.message || 'Ocurrió un error inesperado.');
</script>

<svelte:head>
	<title>Error · ¿En qué año?</title>
</svelte:head>

<main class="error-page">
	<p class="etiqueta">¿En qué año?</p>
	<h1>No pudimos cargar esta página</h1>
	<p>{mensaje}</p>
	<button class="btn-primario" onclick={() => location.reload()}>Intentar de nuevo</button>
</main>

<style>
	.error-page {
		display: grid;
		place-items: center;
		align-content: center;
		gap: 1rem;
		min-height: 100vh;
		padding: 2rem;
		color: var(--color-texto);
		text-align: center;
	}

	.error-page h1,
	.error-page p {
		margin: 0;
	}

	.error-page p:not(.etiqueta) {
		max-width: 32rem;
		color: var(--color-texto-secundario);
	}

	.etiqueta {
		color: var(--color-acento);
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
</style>
