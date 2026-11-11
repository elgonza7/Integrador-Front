<script>
	import '../estilos/switch.css';

	// el interruptor de configuracion (hardcore y modo oscuro)
	/**
	 * @type {{
	 *   titulo: string,
	 *   descripcion?: string,
	 *   activo: boolean,
	 *   onCambiar: () => void
	 * }}
	 */
	let { titulo, descripcion, activo, onCambiar } = $props();

	const id = $props.id();
</script>

<div class="opcion">
	<div>
		<h3 id={id}>{titulo}</h3>
		{#if descripcion}
			<p>{descripcion}</p>
		{/if}
	</div>
	<button class="switch" class:on={activo} role="switch" aria-checked={activo} aria-labelledby={id} onclick={onCambiar}>
		<span></span>
	</button>
</div>
