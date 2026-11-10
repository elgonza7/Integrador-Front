import { initializeApp } from 'firebase/app';
import {
	getFirestore,
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	where,
	orderBy,
	limit,
	getCountFromServer,
	runTransaction
} from 'firebase/firestore';

/** @typedef {{ id: string, nombre: string, puntos: number }} Fila */

// la config de firebase web es publica, lo que protege los datos son las reglas (firestore.rules)
const firebaseConfig = {
	apiKey: 'AIzaSyAJVgKcZ7Exy499-GPx5BN3_6vOmzdzbK8',
	authDomain: 'frontend-93c8b.firebaseapp.com',
	projectId: 'frontend-93c8b',
	storageBucket: 'frontend-93c8b.firebasestorage.app',
	messagingSenderId: '192824255098',
	appId: '1:192824255098:web:830c36a2851bb3327211c3'
};

const db = getFirestore(initializeApp(firebaseConfig));

export const TOP = 4;

/** @param {boolean} hardcore */
const coleccion = (hardcore) => collection(db, hardcore ? 'ranking_hardcore' : 'ranking_normal');

// un documento por nombre, asi cada jugador aparece una sola vez
/** @param {string} nombre */
const idJugador = (nombre) => 'j_' + nombre.trim().toLowerCase().replaceAll('/', '-');

/**
 * @param {string} nombre
 * @param {number} puntos
 * @param {boolean} hardcore
 * @returns {Promise<number>}
 */
export function guardarPuntaje(nombre, puntos, hardcore) {
	const ref = doc(coleccion(hardcore), idJugador(nombre));
	// solo piso el puntaje si es mejor que el que ya tenia
	return runTransaction(db, async (t) => {
		const actual = await t.get(ref);
		const anterior = actual.exists() ? Number(actual.data().puntos) : -1;
		if (puntos <= anterior) return anterior;
		t.set(ref, { nombre, puntos });
		return puntos;
	});
}

/**
 * @param {boolean} hardcore
 * @param {string} nombre
 * @returns {Promise<{ top: Fila[], yo: (Fila & { posicion: number }) | null }>}
 */
export async function obtenerRanking(hardcore, nombre) {
	const col = coleccion(hardcore);
	const snap = await getDocs(query(col, orderBy('puntos', 'desc'), limit(TOP)));
	const top = snap.docs.map((d) => ({ id: d.id, nombre: String(d.data().nombre), puntos: Number(d.data().puntos) }));

	if (!nombre.trim()) return { top, yo: null };

	const miDoc = await getDoc(doc(col, idJugador(nombre)));
	if (!miDoc.exists()) return { top, yo: null };

	const puntos = Number(miDoc.data().puntos);
	// mi posicion = cuantos tienen mas puntos que yo + 1
	const mejores = await getCountFromServer(query(col, where('puntos', '>', puntos)));
	return {
		top,
		yo: { id: miDoc.id, nombre: String(miDoc.data().nombre), puntos, posicion: mejores.data().count + 1 }
	};
}
