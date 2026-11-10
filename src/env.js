import { defineEnvVars } from '@sveltejs/kit/env';

/** @param {string | undefined} valor */
const opcional = (valor) => valor || undefined;

export const variables = defineEnvVars({
	IGDB_CLIENT_ID: { schema: opcional },
	IGDB_CLIENT_SECRET: { schema: opcional }
});
