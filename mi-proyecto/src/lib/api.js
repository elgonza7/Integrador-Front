import { leer, guardar } from './storage.js';
import { ANIO_MIN, ANIO_MAX, CACHE_TTL_MS, JUEGOS_POR_SESION } from './constants.js';

/** @typedef {{ id: number | string, nombre: string, imagen: string | null, anio: number }} Juego */
/** @typedef {'api' | 'cache' | 'respaldo'} Origen */
/** @typedef {{ id: number, name: string, background_image: string | null, released: string | null }} JuegoRawg */

const URL_RAWG = 'https://api.rawg.io/api/games';
const PAGINAS_A_PEDIR = 3;
const PAGINAS_POSIBLES = 15;

/** @type {Juego[]} */
const JUEGOS_RESPALDO = [
	['Halo: Combat Evolved', 2001],
	['Metroid Prime', 2002],
	['Half-Life 2', 2004],
	['Grand Theft Auto: San Andreas', 2004],
	['World of Warcraft', 2004],
	['Shadow of the Colossus', 2005],
	['The Elder Scrolls IV: Oblivion', 2006],
	['BioShock', 2007],
	['Portal', 2007],
	['Call of Duty 4: Modern Warfare', 2007],
	['Grand Theft Auto IV', 2008],
	['Minecraft', 2011],
	['The Elder Scrolls V: Skyrim', 2011],
	['Dark Souls', 2011],
	['Grand Theft Auto V', 2013],
	['The Witcher 3: Wild Hunt', 2015],
	['Overwatch', 2016],
	['The Legend of Zelda: Breath of the Wild', 2017],
	['God of War', 2018],
	['Red Dead Redemption 2', 2018],
	['Hades', 2020],
	['Elden Ring', 2022],
	["Baldur's Gate 3", 2023]
].map(([nombre, anio], i) => ({ id: `local-${i}`, nombre: String(nombre), imagen: null, anio: Number(anio) }));

/** @returns {Promise<{ juegos: Juego[], origen: Origen }>} */
export async function obtenerJuegos() {
	const cache = /** @type {{ timestamp: number, juegos: Juego[] } | null} */ (leer('cacheJuegos', null));
	const cacheValido = cache && Array.isArray(cache.juegos) && cache.juegos.length >= JUEGOS_POR_SESION;

	if (cacheValido && Date.now() - cache.timestamp < CACHE_TTL_MS) {
		return { juegos: cache.juegos, origen: 'cache' };
	}

	const key = import.meta.env.VITE_RAWG_KEY;
	if (!key) return { juegos: JUEGOS_RESPALDO, origen: 'respaldo' };

	try {
		const paginas = elegirPaginas();
		const resultados = await Promise.all(paginas.map((p) => pedirPagina(key, p)));
		const porId = new Map(resultados.flat().map((j) => [j.id, j]));
		const juegos = [...porId.values()];
		if (juegos.length < JUEGOS_POR_SESION) throw new Error('La API devolvió muy pocos juegos');

		guardar('cacheJuegos', { timestamp: Date.now(), juegos });
		return { juegos, origen: 'api' };
	} catch (error) {
		console.warn('No se pudo usar RAWG:', error);
		if (cacheValido) return { juegos: cache.juegos, origen: 'cache' };
		return { juegos: JUEGOS_RESPALDO, origen: 'respaldo' };
	}
}

function elegirPaginas() {
	/** @type {Set<number>} */
	const paginas = new Set();
	while (paginas.size < PAGINAS_A_PEDIR) {
		paginas.add(1 + Math.floor(Math.random() * PAGINAS_POSIBLES));
	}
	return [...paginas];
}

/**
 * @param {string} key
 * @param {number} pagina
 * @returns {Promise<Juego[]>}
 */
async function pedirPagina(key, pagina) {
	const hoy = new Date().toISOString().slice(0, 10);
	const params = new URLSearchParams({
		key,
		dates: `${ANIO_MIN}-01-01,${hoy}`,
		ordering: '-added',
		page_size: '40',
		page: String(pagina)
	});
	const respuesta = await fetch(`${URL_RAWG}?${params}`);
	if (!respuesta.ok) throw new Error(`RAWG respondió ${respuesta.status}`);

	/** @type {{ results: JuegoRawg[] }} */
	const datos = await respuesta.json();
	return datos.results.map(normalizar).filter((j) => j !== null);
}

/**
 * @param {JuegoRawg} juego
 * @returns {Juego | null}
 */
function normalizar(juego) {
	if (!juego.name || !juego.background_image || !juego.released) return null;
	// Se lee el año del string: new Date('2014-01-01') en Argentina (UTC-3) da 2013.
	const anio = Number(juego.released.slice(0, 4));
	if (!(anio >= ANIO_MIN && anio <= ANIO_MAX)) return null;
	return { id: juego.id, nombre: juego.name, imagen: juego.background_image, anio };
}
