<script>
	import './estilos/juego-card.css';
	import { fade } from 'svelte/transition';
	import Portada from './base/Portada.svelte';

	/** @type {{ juego: import('#lib/servicios/api.js').Juego, revelado: boolean }} */
	let { juego, revelado } = $props();
</script>

<figure class="juego-card" in:fade={{ duration: 250 }}>
	<figcaption class="titulo">{juego.nombre}</figcaption>
	<Portada {juego}>
		{#if revelado}
			<span class="año" in:fade={{ duration: 200 }}>{juego.año}</span>
		{/if}
	</Portada>
</figure>
