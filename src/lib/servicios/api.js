import { leer, guardar } from '#lib/utilidades/storage.js';
import { CACHE_TTL_MS, JUEGOS_POR_SESION } from '#lib/juego/constants.js';
import { JUEGOS } from '#lib/datos/games.js';

/** @typedef {{ id: number | string, nombre: string, imagen: string | null, año: number }} Juego */
/** @typedef {'api' | 'cache' | 'respaldo'} Origen */

/** @type {Juego[]} */
const JUEGOS_RESPALDO = JUEGOS.map(([nombre, año], i) => ({ id: `local-${i}`, nombre: String(nombre), imagen: null, año: Number(año) }));

/** @returns {Promise<{ juegos: Juego[], origen: Origen }>} */
export async function obtenerJuegos() {
	const cache = /** @type {{ timestamp: number, juegos: Juego[] } | null} */ (leer('cacheJuegos', null));
	const cacheValido = cache && Array.isArray(cache.juegos) && cache.juegos.length >= JUEGOS_POR_SESION;

	// si ya los pedi hace menos de 24hs no los vuelvo a pedir
	if (cacheValido && Date.now() - cache.timestamp < CACHE_TTL_MS) {
		return { juegos: cache.juegos, origen: 'cache' };
	}

	try {
		// igdb no deja pedir desde el navegador, por eso va por /api/juegos
		const respuesta = await fetch('/api/juegos');
		if (!respuesta.ok) throw new Error(`/api/juegos respondió ${respuesta.status}`);

		/** @type {{ juegos: Juego[] }} */
		const { juegos } = await respuesta.json();
		if (juegos.length < JUEGOS_POR_SESION) throw new Error('La API devolvió muy pocos juegos');

		guardar('cacheJuegos', { timestamp: Date.now(), juegos });
		return { juegos, origen: 'api' };
	} catch (error) {
		console.warn('No se pudo usar IGDB:', error);
		// si falla uso la cache vieja o los juegos de games.js
		if (cacheValido) return { juegos: cache.juegos, origen: 'cache' };
		return { juegos: JUEGOS_RESPALDO, origen: 'respaldo' };
	}
}
