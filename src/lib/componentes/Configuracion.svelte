<script>
	import './estilos/configuracion.css';
	import { tema } from '#lib/utilidades/tema.svelte.js';
	import Switch from './base/Switch.svelte';
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
	<Switch
		titulo="Modo Hardcore"
		descripcion="Un solo intento por juego. Cada acierto vale el doble."
		activo={hardcore}
		onCambiar={() => onCambiar(!hardcore)}
	/>

	<Switch titulo="Modo oscuro" activo={tema.oscuro} onCambiar={() => tema.alternar()} />

	{#if cambioPendiente}
		<div class="aviso">
			<p>El cambio se aplica en la próxima partida.</p>
			<button class="btn-secundario" onclick={onNuevaPartida}>Empezar ahora</button>
		</div>
	{/if}

	<hr />

	<button class="btn-peligro" onclick={confirmarBorrado}>Borrar todos mis datos</button>
</div>
