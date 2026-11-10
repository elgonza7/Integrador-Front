import { leer, guardar, borrarTodo } from './storage.js';
import { obtenerJuegos } from './api.js';
import {
	ANIO_MIN,
	ANIO_MAX,
	ANIOS_EN_LINEA,
	JUEGOS_POR_SESION,
	INTENTOS_NORMAL,
	INTENTOS_HARDCORE,
	PUNTOS_POR_INTENTO,
	MULTIPLICADOR_HARDCORE
} from './constants.js';

/** @typedef {import('./api.js').Juego} Juego */
/** @typedef {import('./api.js').Origen} Origen */
/** @typedef {'jugando' | 'acertado' | 'fallado'} EstadoRonda */
/** @typedef {{ juego: Juego, linea: number[], intentos: number[], estado: EstadoRonda, puntos: number }} Ronda */
/** @typedef {{ hardcore: boolean, rondas: Ronda[], actual: number, guardada: boolean }} Sesion */
/** @typedef {{ nombre: string, puntos: number, aciertos: number, hardcore: boolean, fecha: string }} EntradaRanking */

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

// arma los 5 anios de la linea, el real queda en cualquier posicion
/**
 * @param {number} anio
 */
export function generarLinea(anio) {
	const desde = Math.max(ANIO_MIN, anio - ANIOS_EN_LINEA + 1);
	const hasta = Math.min(anio, ANIO_MAX - ANIOS_EN_LINEA + 1);
	const inicio = desde + Math.floor(Math.random() * (hasta - desde + 1));
	return Array.from({ length: ANIOS_EN_LINEA }, (_, i) => inicio + i);
}

/** @param {unknown} valor @returns {valor is Sesion} */
function esSesionValida(valor) {
	const s = /** @type {Sesion} */ (valor);
	return !!s && Array.isArray(s.rondas) && s.rondas.length > 0 && typeof s.actual === 'number';
}

class EstadoJuego {
	/** @type {Sesion | null} */
	sesion = $state(null);
	hardcore = $state(false);
	/** @type {EntradaRanking[]} */
	ranking = $state([]);
	cargando = $state(true);
	/** @type {Origen | null} */
	origen = $state(null);

	/** @type {Juego[]} */
	#pool = [];

	ronda = $derived(this.sesion?.rondas[this.sesion.actual] ?? null);
	terminada = $derived(!!this.sesion && this.sesion.actual >= this.sesion.rondas.length);
	intentosMax = $derived(this.sesion?.hardcore ? INTENTOS_HARDCORE : INTENTOS_NORMAL);
	puntosTotales = $derived(this.sesion?.rondas.reduce((total, r) => total + r.puntos, 0) ?? 0);

	async iniciar() {
		this.hardcore = leer('hardcore', false);
		this.ranking = leer('ranking', []);

		const { juegos, origen } = await obtenerJuegos();
		this.#pool = juegos;
		this.origen = origen;

		const guardada = leer('sesion', null);
		this.sesion = esSesionValida(guardada) ? guardada : this.#crearSesion();
		this.cargando = false;
		this.#persistir();
	}

	nuevaPartida() {
		this.sesion = this.#crearSesion();
		this.#persistir();
	}

	/** @param {number} anio */
	elegir(anio) {
		const sesion = this.sesion;
		const ronda = this.ronda;
		if (!sesion || !ronda || ronda.estado !== 'jugando' || ronda.intentos.includes(anio)) return;

		// si acierta suma segun el intento, si se queda sin intentos pierde la ronda
		ronda.intentos.push(anio);
		if (anio === ronda.juego.anio) {
			const base = PUNTOS_POR_INTENTO[ronda.intentos.length - 1];
			ronda.puntos = base * (sesion.hardcore ? MULTIPLICADOR_HARDCORE : 1);
			ronda.estado = 'acertado';
		} else if (ronda.intentos.length >= this.intentosMax) {
			ronda.estado = 'fallado';
		}
		this.#persistir();
	}

	siguiente() {
		if (!this.sesion || !this.ronda || this.ronda.estado === 'jugando') return;
		this.sesion.actual += 1;
		this.#persistir();
	}

	/** @param {string} nombre */
	guardarEnRanking(nombre) {
		const sesion = this.sesion;
		if (!sesion || sesion.guardada || !this.terminada) return;

		/** @type {EntradaRanking} */
		const entrada = {
			nombre: nombre.trim().slice(0, 20) || 'Anónimo',
			puntos: this.puntosTotales,
			aciertos: sesion.rondas.filter((r) => r.estado === 'acertado').length,
			hardcore: sesion.hardcore,
			fecha: new Date().toISOString()
		};
		this.ranking = [...this.ranking, entrada].sort((a, b) => b.puntos - a.puntos).slice(0, 50);
		sesion.guardada = true;

		guardar('ranking', $state.snapshot(this.ranking));
		guardar('ultimoNombre', entrada.nombre);
		this.#persistir();
	}

	/** @param {boolean} valor */
	setHardcore(valor) {
		this.hardcore = valor;
		guardar('hardcore', valor);
	}

	borrarDatos() {
		borrarTodo();
		this.ranking = [];
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
				linea: generarLinea(juego.anio),
				intentos: [],
				estado: /** @type {EstadoRonda} */ ('jugando'),
				puntos: 0
			}))
		};
	}

	#persistir() {
		guardar('sesion', $state.snapshot(this.sesion));
	}
}

export const juego = new EstadoJuego();
