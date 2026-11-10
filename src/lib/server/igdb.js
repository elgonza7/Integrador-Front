import { IGDB_CLIENT_ID, IGDB_CLIENT_SECRET } from '$app/env/private';
import { ANIO_MIN, ANIO_MAX } from '#lib/constants.js';

/** @typedef {import('#lib/api.js').Juego} Juego */
/** @typedef {{ id: number, name?: string, first_release_date?: number, cover?: { image_id?: string } }} JuegoIgdb */

const URL_TOKEN = 'https://id.twitch.tv/oauth2/token';
const URL_JUEGOS = 'https://api.igdb.com/v4/games';
const URL_IMAGEN = 'https://images.igdb.com/igdb/image/upload/t_cover_big';
const CACHE_JUEGOS_MS = 6 * 60 * 60 * 1000;

export const configurado = Boolean(IGDB_CLIENT_ID && IGDB_CLIENT_SECRET);

/** @type {{ valor: string, vence: number } | null} */
let token = null;

/** @type {{ juegos: Juego[], vence: number } | null} */
let cacheJuegos = null;

async function obtenerToken() {
	if (token && Date.now() < token.vence) return token.valor;

	const params = new URLSearchParams({
		client_id: String(IGDB_CLIENT_ID),
		client_secret: String(IGDB_CLIENT_SECRET),
		grant_type: 'client_credentials'
	});
	const respuesta = await fetch(`${URL_TOKEN}?${params}`, { method: 'POST' });
	if (!respuesta.ok) throw new Error(`Twitch respondió ${respuesta.status} al pedir el token`);

	/** @type {{ access_token: string, expires_in: number }} */
	const datos = await respuesta.json();
	// el token dura unos dias, lo guardo y lo renuevo 1 minuto antes de que venza
	token = { valor: datos.access_token, vence: Date.now() + (datos.expires_in - 60) * 1000 };
	return token.valor;
}

function consulta() {
	const desde = Date.UTC(ANIO_MIN, 0, 1) / 1000;
	const hasta = Math.min(Date.now(), Date.UTC(ANIO_MAX + 1, 0, 1)) / 1000;
	// los 500 juegos mas votados desde el 2000 hasta hoy, sin remasters ni dlcs
	return `
		fields name, first_release_date, cover.image_id;
		where first_release_date >= ${desde} & first_release_date < ${Math.floor(hasta)}
			& cover != null & version_parent = null & parent_game = null
			& total_rating_count >= 50;
		sort total_rating_count desc;
		limit 500;
	`;
}

/** @param {boolean} reintentar */
async function pedirJuegos(reintentar = true) {
	const respuesta = await fetch(URL_JUEGOS, {
		method: 'POST',
		headers: {
			'Client-ID': String(IGDB_CLIENT_ID),
			Authorization: `Bearer ${await obtenerToken()}`,
			Accept: 'application/json'
		},
		body: consulta()
	});

	// si el token se vencio pido uno nuevo y pruebo una vez mas
	if (respuesta.status === 401 && reintentar) {
		token = null;
		return pedirJuegos(false);
	}
	if (!respuesta.ok) throw new Error(`IGDB respondió ${respuesta.status}: ${await respuesta.text()}`);

	/** @type {JuegoIgdb[]} */
	const datos = await respuesta.json();
	return datos.map(normalizar).filter((j) => j !== null);
}

/**
 * @param {JuegoIgdb} juego
 * @returns {Juego | null}
 */
function normalizar(juego) {
	const imageId = juego.cover?.image_id;
	if (!juego.name || !juego.first_release_date || !imageId) return null;
	// la fecha viene en segundos y en UTC, con la hora de aca el 1 de enero quedaria en el anio anterior
	const anio = new Date(juego.first_release_date * 1000).getUTCFullYear();
	if (anio < ANIO_MIN || anio > ANIO_MAX) return null;
	return { id: juego.id, nombre: juego.name, imagen: `${URL_IMAGEN}/${imageId}.jpg`, anio };
}

export async function juegosIgdb() {
	// guardo la lista 6 horas en memoria asi no le pego a igdb todo el tiempo
	if (cacheJuegos && Date.now() < cacheJuegos.vence) return cacheJuegos.juegos;
	const juegos = await pedirJuegos();
	cacheJuegos = { juegos, vence: Date.now() + CACHE_JUEGOS_MS };
	return juegos;
}
