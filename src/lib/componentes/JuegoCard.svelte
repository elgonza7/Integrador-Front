<script>
	import './estilos/juego-card.css';
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

<figure class="juego-card" in:fade={{ duration: 250 }}>
	<figcaption class="titulo">{juego.nombre}</figcaption>
	<div class="marco">
		{#if juego.imagen && !fallo}
			<img src={juego.imagen} alt="Imagen de {juego.nombre}" onerror={() => (fallo = true)} />
		{:else}
			<div class="placeholder" aria-hidden="true">{iniciales}</div>
		{/if}

		{#if revelado}
			<span class="año" in:fade={{ duration: 200 }}>{juego.año}</span>
		{/if}
	</div>
</figure>
