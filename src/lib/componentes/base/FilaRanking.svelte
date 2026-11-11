<script>
	import '../estilos/fila-ranking.css';

	// una fila del leaderboard, se usa para el top y para "tu posicion"
	/**
	 * @type {{
	 *   posicion: number,
	 *   nombre: string,
	 *   puntos: number,
	 *   podio?: boolean,
	 *   yo?: boolean
	 * }}
	 */
	let { posicion, nombre, puntos, podio = false, yo = false } = $props();
</script>

<li class="fila-ranking" class:podio class:yo>
	<span class="pos">{posicion}</span>
	<span class="nombre">{nombre}</span>
	<span class="pts">{puntos}</span>
</li>
