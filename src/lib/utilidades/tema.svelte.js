import { guardar } from '#lib/utilidades/storage.js';

/** @typedef {'claro' | 'oscuro'} Tema */

class EstadoTema {
	// arranca con lo que ya puso el script de app.html
	/** @type {Tema} */
	actual = $state(
		typeof document !== 'undefined' && document.documentElement.dataset.tema === 'oscuro' ? 'oscuro' : 'claro'
	);

	oscuro = $derived(this.actual === 'oscuro');

	/** @param {Tema} valor */
	cambiar(valor) {
		this.actual = valor;
		document.documentElement.dataset.tema = valor;
		guardar('tema', valor);
	}

	alternar() {
		this.cambiar(this.oscuro ? 'claro' : 'oscuro');
	}
}

export const tema = new EstadoTema();
