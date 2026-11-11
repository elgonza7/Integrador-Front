import { leer, guardar, borrarTodo, guardarNombre } from '#lib/utilidades/storage.js';
import { obtenerJuegos } from '#lib/servicios/api.js';
import { guardarPuntaje } from '#lib/servicios/ranking.js';
import { pistas } from '#lib/datos/ayudas.js';
import {
	AÑO_MIN,
	AÑO_MAX,
	AÑOS_EN_LINEA,
	JUEGOS_POR_SESION,
	INTENTOS_NORMAL,
	INTENTOS_HARDCORE,
	PUNTOS_POR_INTENTO,
	MULTIPLICADOR_HARDCORE,
	COSTOS_PISTA
} from '#lib/juego/constants.js';

/** @typedef {import('#lib/servicios/api.js').Juego} Juego */
/** @typedef {import('#lib/servicios/api.js').Origen} Origen */
/** @typedef {'jugando' | 'acertado' | 'fallado'} EstadoRonda */
/** @typedef {{ juego: Juego, linea: number[], intentos: number[], estado: EstadoRonda, puntos: number, pistasCompradas?: number[] }} Ronda */
/** @typedef {{ hardcore: boolean, rondas: Ronda[], actual: number, guardada: boolean }} Sesion */
/** @typedef {'nada' | 'guardando' | 'error'} EstadoGuardado */

// mezcla la lista (fisher-yates)
/**
 * @template T
 * @param {T[]} lista
 */
function mezclar(lista) {
	const copia = [...lista];
	for (let i = copia.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copia[i], copia[j]] = [copia[j], copia[i]];
	}
	return copia;
}

// arma los 5 años de la linea, el real queda en cualquier posicion
/**
 * @param {number} año
 */
export function generarLinea(año) {
	const desde = Math.max(AÑO_MIN, año - AÑOS_EN_LINEA + 1);
	const hasta = Math.min(año, AÑO_MAX - AÑOS_EN_LINEA + 1);
	const inicio = desde + Math.floor(Math.random() * (hasta - desde + 1));
	return Array.from({ length: AÑOS_EN_LINEA }, (_, i) => inicio + i);
}

/** @param {unknown} valor @returns {valor is Sesion} */
function esSesionValida(valor) {
	const s = /** @type {Sesion} */ (valor);
	return !!s && Array.isArray(s.rondas) && s.rondas.length > 0 && typeof s.actual === 'number';
}

// las pistas salen en este orden, cada vez mas faciles
/** @type {{ clave: 'capciosa' | 'medio' | 'regalada', titulo: string }[]} */
const NIVELES_PISTA = [
	{ clave: 'capciosa', titulo: 'Pista' },
	{ clave: 'medio', titulo: 'Pista' },
	{ clave: 'regalada', titulo: 'Última esperanza' }
];

/** @param {Sesion} sesion */
function usaRespaldo(sesion) {
	return sesion.rondas.some((r) => !r.juego.imagen);
}

class EstadoJuego {
	/** @type {Sesion | null} */
	sesion = $state(null);
	hardcore = $state(false);
	/** @type {EstadoGuardado} */
	estadoGuardado = $state('nada');
	/** @type {number | null} */
	mejorPuntaje = $state(null);
	cargando = $state(true);
	/** @type {Origen | null} */
	origen = $state(null);

	/** @type {Juego[]} */
	#pool = [];

	ronda = $derived(this.sesion?.rondas[this.sesion.actual] ?? null);
	terminada = $derived(!!this.sesion && this.sesion.actual >= this.sesion.rondas.length);
	intentosMax = $derived(this.sesion?.hardcore ? INTENTOS_HARDCORE : INTENTOS_NORMAL);
	puntosTotales = $derived(this.sesion?.rondas.reduce((total, r) => total + r.puntos, 0) ?? 0);

	// en hardcore no hay pistas
	hayPistas = $derived(
		!!this.sesion && !this.sesion.hardcore && this.ronda?.estado === 'jugando' && !!pistas[this.ronda.juego.año]
	);

	// cada intento tiene su pista: intento 1 la capciosa, intento 2 la media, intento 3 la regalada
	nivelPista = $derived(this.ronda?.intentos.length ?? 0);

	// se muestra la ultima que compro, que es la mas facil
	pistaActual = $derived.by(() => {
		const ronda = this.ronda;
		const compradas = ronda?.pistasCompradas ?? [];
		if (!this.hayPistas || !ronda || compradas.length === 0) return null;
		const nivel = NIVELES_PISTA[Math.max(...compradas)];
		return { titulo: nivel.titulo, texto: pistas[ronda.juego.año][nivel.clave] };
	});

	// lo que cuesta la pista de este intento, o null si ya la compro
	costoProximaPista = $derived.by(() => {
		if (!this.hayPistas || !this.ronda) return null;
		if ((this.ronda.pistasCompradas ?? []).includes(this.nivelPista)) return null;
		return COSTOS_PISTA[this.nivelPista] ?? null;
	});

	ultimoError = $derived.by(() => {
		const ronda = this.ronda;
		if (!ronda || ronda.estado !== 'jugando' || ronda.intentos.length === 0) return null;
		return ronda.intentos[ronda.intentos.length - 1];
	});

	async iniciar() {
		this.hardcore = leer('hardcore', false);

		const { juegos, origen } = await obtenerJuegos();
		this.#pool = juegos;
		this.origen = origen;

		const guardada = /** @type {unknown} */ (leer('sesion', null));
		const enCurso = esSesionValida(guardada) && guardada.actual < guardada.rondas.length;
		// si la partida guardada se armo con los juegos de respaldo y ahora igdb anda, arranco una nueva con portadas
		const descartar = enCurso && origen !== 'respaldo' && usaRespaldo(guardada);
		this.sesion = esSesionValida(guardada) && !descartar ? guardada : this.#crearSesion();
		this.cargando = false;
		this.#persistir();
	}

	nuevaPartida() {
		this.sesion = this.#crearSesion();
		this.estadoGuardado = 'nada';
		this.mejorPuntaje = null;
		this.#persistir();
	}

	/** @param {number} año */
	elegir(año) {
		const sesion = this.sesion;
		const ronda = this.ronda;
		if (!sesion || !ronda || ronda.estado !== 'jugando' || ronda.intentos.includes(año)) return;

		// si acierta suma segun el intento, si se queda sin intentos pierde la ronda
		ronda.intentos.push(año);
		if (año === ronda.juego.año) {
			const base = PUNTOS_POR_INTENTO[ronda.intentos.length - 1];
			// += porque ya pueden estar restadas las pistas que pidio
			ronda.puntos += base * (sesion.hardcore ? MULTIPLICADOR_HARDCORE : 1);
			ronda.estado = 'acertado';
		} else if (ronda.intentos.length >= this.intentosMax) {
			ronda.estado = 'fallado';
		}
		this.#persistir();
	}

	pedirPista() {
		const ronda = this.ronda;
		const costo = this.costoProximaPista;
		if (!ronda || costo === null) return;
		ronda.pistasCompradas = [...(ronda.pistasCompradas ?? []), this.nivelPista];
		ronda.puntos -= costo;
		this.#persistir();
	}

	siguiente() {
		if (!this.sesion || !this.ronda || this.ronda.estado === 'jugando') return;
		this.sesion.actual += 1;
		this.#persistir();
	}

	/** @param {string} nombre */
	async guardarEnRanking(nombre) {
		const sesion = this.sesion;
		const limpio = nombre.trim().slice(0, 20);
		if (!sesion || sesion.guardada || !this.terminada || !limpio || this.estadoGuardado === 'guardando') return;

		this.estadoGuardado = 'guardando';
		try {
			// si gasto mas en pistas de lo que gano queda negativo, al ranking va 0
			this.mejorPuntaje = await guardarPuntaje(limpio, Math.max(0, this.puntosTotales), sesion.hardcore);
			sesion.guardada = true;
			this.estadoGuardado = 'nada';
			guardarNombre(limpio);
			this.#persistir();
		} catch (error) {
			console.error('No se pudo guardar en Firebase:', error);
			this.estadoGuardado = 'error';
		}
	}

	/** @param {boolean} valor */
	setHardcore(valor) {
		this.hardcore = valor;
		guardar('hardcore', valor);
	}

	borrarDatos() {
		borrarTodo();
		this.hardcore = false;
		this.nuevaPartida();
	}

	/** @returns {Sesion} */
	#crearSesion() {
		// trato de no repetir juegos que salieron en las ultimas partidas
		/** @type {Set<Juego['id']>} */
		const recientes = new Set(leer('recientes', []));
		let candidatos = this.#pool.filter((j) => !recientes.has(j.id));
		if (candidatos.length < JUEGOS_POR_SESION) {
			candidatos = this.#pool;
			recientes.clear();
		}

		const elegidos = mezclar(candidatos).slice(0, JUEGOS_POR_SESION);
		guardar('recientes', [...recientes, ...elegidos.map((j) => j.id)].slice(-60));

		return {
			hardcore: this.hardcore,
			actual: 0,
			guardada: false,
			rondas: elegidos.map((juego) => ({
				juego,
				linea: generarLinea(juego.año),
				intentos: [],
				estado: /** @type {EstadoRonda} */ ('jugando'),
				puntos: 0,
				pistasCompradas: []
			}))
		};
	}

	#persistir() {
		guardar('sesion', $state.snapshot(this.sesion));
	}
}

export const juego = new EstadoJuego();
