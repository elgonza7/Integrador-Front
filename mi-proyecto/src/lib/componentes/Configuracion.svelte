<script>
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
		if (confirm('Se borran el ranking, la partida actual y la configuración. ¿Seguro?')) onBorrar();
	}
</script>

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

<button class="peligro" onclick={confirmarBorrado}>Borrar todos mis datos</button>

<style>
	.opcion {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	h3 {
		margin: 0 0 0.25rem;
		font-size: 1rem;
	}

	p {
		margin: 0;
		color: var(--gris);
		font-size: 0.9rem;
	}

	.switch {
		flex-shrink: 0;
		position: relative;
		width: 52px;
		height: 30px;
		border: 0;
		border-radius: 999px;
		background: var(--linea);
		transition: background 0.2s;
	}

	.switch span {
		position: absolute;
		top: 3px;
		left: 3px;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: #fff;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
		transition: transform 0.2s;
	}

	.switch.on {
		background: var(--naranja);
	}

	.switch.on span {
		transform: translateX(22px);
	}

	.aviso {
		margin-top: 1rem;
		padding: 0.9rem 1rem;
		background: var(--naranja-claro);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.aviso p {
		color: var(--texto);
	}

	.aviso .btn-secundario {
		padding: 0.45rem 1rem;
		background: #fff;
	}

	hr {
		border: 0;
		border-top: 1px solid var(--linea);
		margin: 1.5rem 0 1rem;
	}

	.peligro {
		border: 0;
		background: transparent;
		color: var(--rojo);
		font-weight: 600;
		padding: 0.4rem 0;
	}

	.peligro:hover {
		text-decoration: underline;
	}
</style>
