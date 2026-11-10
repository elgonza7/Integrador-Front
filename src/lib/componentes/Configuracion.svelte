<script>
	import './estilos/configuracion.css';
	/**
	 * @type {{
	 *   hardcore: boolean,
	 *   cambioPendiente: boolean,
	 *   onCambiar: (valor: boolean) => void,
	 *   onNuevaPartida: () => void,
	 *   onBorrar: () => void
	 * }}
	 */
	let { hardcore, cambioPendiente, onCambiar, onNuevaPartida, onBorrar } = $props();

	function confirmarBorrado() {
		if (confirm('Se borran la partida actual y la configuración de este navegador. El ranking online no se toca. ¿Seguro?')) onBorrar();
	}
</script>

<div class="configuracion">
	<div class="opcion">
		<div>
			<h3 id="titulo-hardcore">Modo Hardcore</h3>
			<p>Un solo intento por juego. Cada acierto vale el doble.</p>
		</div>
		<button
			class="switch"
			class:on={hardcore}
			role="switch"
			aria-checked={hardcore}
			aria-labelledby="titulo-hardcore"
			onclick={() => onCambiar(!hardcore)}
		>
			<span></span>
		</button>
	</div>

	{#if cambioPendiente}
		<div class="aviso">
			<p>El cambio se aplica en la próxima partida.</p>
			<button class="btn-secundario" onclick={onNuevaPartida}>Empezar ahora</button>
		</div>
	{/if}

	<hr />

	<button class="btn-peligro" onclick={confirmarBorrado}>Borrar todos mis datos</button>
</div>
