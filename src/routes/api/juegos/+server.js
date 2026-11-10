import { json } from '@sveltejs/kit';
import { configurado, juegosIgdb } from '#lib/server/igdb.js';

export async function GET() {
	// si no estan las claves en el .env el front usa los juegos de respaldo
	if (!configurado) {
		return json({ error: 'Faltan IGDB_CLIENT_ID / IGDB_CLIENT_SECRET en el .env' }, { status: 503 });
	}
	try {
		const juegos = await juegosIgdb();
		return json({ juegos }, { headers: { 'Cache-Control': 'public, max-age=3600' } });
	} catch (error) {
		console.error('[IGDB]', error);
		return json({ error: 'No se pudo consultar IGDB' }, { status: 502 });
	}
}
