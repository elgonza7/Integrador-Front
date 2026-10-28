const PREFIJO = 'trivia-anios:';

/**
 * @template T
 * @param {string} clave
 * @param {T} porDefecto
 * @returns {T}
 */
export function leer(clave, porDefecto) {
	try {
		const crudo = localStorage.getItem(PREFIJO + clave);
		return crudo === null ? porDefecto : JSON.parse(crudo);
	} catch {
		return porDefecto;
	}
}

/**
 * @param {string} clave
 * @param {unknown} valor
 */
export function guardar(clave, valor) {
	try {
		localStorage.setItem(PREFIJO + clave, JSON.stringify(valor));
	} catch {
		// localStorage lleno o bloqueado: el juego sigue funcionando sin persistir
	}
}

export function borrarTodo() {
	try {
		Object.keys(localStorage)
			.filter((k) => k.startsWith(PREFIJO))
			.forEach((k) => localStorage.removeItem(k));
	} catch {
		// sin acceso a localStorage
	}
}
