import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del servicio de datos gafas.js.
// NO se usa la BBDD real: se mockea (simula) Supabase con vi.mock, para
// poder controlar qué "devuelve" la base de datos en cada test.

const mocks = vi.hoisted(() => {
	// makeBuilder recrea la cadena de Supabase: .select() devuelve el propio objeto
	// para poder encadenar .limit()/.eq()/.single(). Al final se resuelve la "respuesta".
	const makeBuilder = (result) => {
		const builder = {
			select: vi.fn(() => builder),
			limit: vi.fn(() => Promise.resolve(result)),
			eq: vi.fn(() => builder),
			single: vi.fn(() => Promise.resolve(result)),
		};
		return builder;
	};
	return { makeBuilder, fromMock: vi.fn() };
});

vi.mock('../lib/supabase', () => ({
	supabase: { from: mocks.fromMock },
}));

import { supabase } from '../lib/supabase';
import { getGafas, getGafaPorId } from './gafas';

describe('getGafas', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// Supabase responde con datos -> getGafas los devuelve tal cual.
	it('devuelve las gafas cuando supabase responde con datos', async () => {
		const gafas = [{ id: '1', nombre_modelo: 'Zoco Polar' }];
		mocks.fromMock.mockReturnValue(mocks.makeBuilder({ data: gafas, error: null }));

		const resultado = await getGafas();

		expect(resultado).toEqual(gafas);
		expect(supabase.from).toHaveBeenCalledWith('gafas');
	});

	// El límite recibido por parámetro se pasa a .limit().
	it('aplica el límite pasado por parámetro', async () => {
		mocks.fromMock.mockReturnValue(mocks.makeBuilder({ data: [], error: null }));

		await getGafas(5);

		const builder = mocks.fromMock.mock.results[0].value;
		expect(builder.limit).toHaveBeenCalledWith(5);
	});

	// Si Supabase devuelve error -> array vacío (la web no se rompe).
	it('devuelve un array vacío cuando supabase devuelve error', async () => {
		mocks.fromMock.mockReturnValue(mocks.makeBuilder({ data: null, error: { message: 'boom' } }));

		const resultado = await getGafas();

		expect(resultado).toEqual([]);
		expect(console.error).toHaveBeenCalled();
	});
});

describe('getGafaPorId', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// Caso feliz: busca por id con .eq() y devuelve la gafa.
	it('devuelve la gafa encontrada', async () => {
		const gafa = { id: 'abc', nombre_modelo: 'Zoco Avant' };
		mocks.fromMock.mockReturnValue(mocks.makeBuilder({ data: gafa, error: null }));

		const resultado = await getGafaPorId('abc');

		expect(resultado).toEqual(gafa);

		const builder = mocks.fromMock.mock.results[0].value;
		expect(builder.eq).toHaveBeenCalledWith('id', 'abc');
		expect(builder.single).toHaveBeenCalled();
	});

	// Si no existe o hay error -> null (la página redirige a /404).
	it('devuelve null si supabase devuelve error o no encuentra', async () => {
		mocks.fromMock.mockReturnValue(mocks.makeBuilder({ data: null, error: { message: 'not found' } }));

		const resultado = await getGafaPorId('no-existe');

		expect(resultado).toBeNull();
		expect(console.error).toHaveBeenCalled();
	});
});
