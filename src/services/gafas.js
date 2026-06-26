import { supabase } from '../lib/supabase';

const TABLA_GAFAS = 'gafas';

export async function getGafas(limit = 12) {
	const { data, error } = await supabase
		.from(TABLA_GAFAS)
		.select('*')
		.limit(limit);

	if (error) {
		console.error('Error al obtener gafas:', error.message);
		return [];
	}

	return data ?? [];
}

export async function getGafaPorId(id) {
	const { data, error } = await supabase
		.from(TABLA_GAFAS)
		.select('*')
		.eq('id', id)
		.single();

	if (error) {
		console.error(`Error al obtener la gafa con id ${id}:`, error.message);
		return null;
	}

	return data;
}
