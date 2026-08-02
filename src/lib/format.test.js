import { describe, it, expect } from 'vitest';
import { formatearCatalogoGafas, formatearTiendas } from './format';

// Tests de la lógica pura de formateo usada por el chatbot (/api/chat).
// Solo comprueban la transformación datos -> texto, sin red ni Supabase.

describe('formatearCatalogoGafas', () => {
	// Caso vacío: sin datos debe devolver el mensaje por defecto.
	it('devuelve mensaje por defecto si no hay gafas', () => {
		expect(formatearCatalogoGafas(null)).toBe('No hay información de gafas disponible en este momento.');
		expect(formatearCatalogoGafas([])).toBe('No hay información de gafas disponible en este momento.');
	});

	// Caso feliz: cada atributo de la gafa debe aparecer formateado en el texto.
	it('formatea una gafa con todos sus atributos', () => {
		const gafas = [
			{
				nombre_modelo: 'Zoco Polar',
				coleccion: 'Classic',
				tipo: 'SUN',
				categoria_filtro: 'Polarizada',
				material: 'Acetato',
				forma: 'Cuadrada',
				color_montura: 'Negro',
				color_desc: 'Negro mate',
				color_lente: 'Gris',
				calibre: 52,
				puente: 18,
				varilla: 140,
			},
		];

		const resultado = formatearCatalogoGafas(gafas);

		expect(resultado).toContain('- Zoco Polar');
		expect(resultado).toContain('Colección: Classic');
		expect(resultado).toContain('Tipo: SUN');
		expect(resultado).toContain('Categoría: Polarizada');
		expect(resultado).toContain('Material: Acetato');
		expect(resultado).toContain('Forma: Cuadrada');
		expect(resultado).toContain('Color montura: Negro');
		expect(resultado).toContain('Descripción color: Negro mate');
		expect(resultado).toContain('Color de lente: Gris');
		expect(resultado).toContain('Calibre: 52mm');
		expect(resultado).toContain('Puente: 18mm');
		expect(resultado).toContain('Largo de varilla: 140mm');
	});

	// Datos incompletos: los campos vacíos se omiten (nunca sale "undefined").
	it('omite atributos vacíos o undefined', () => {
		const resultado = formatearCatalogoGafas([{ nombre_modelo: 'Zoco Minimal' }]);

		expect(resultado).toBe('- Zoco Minimal');
	});

	// Varias gafas se unen con un salto de línea.
	it('une varias gafas con salto de línea', () => {
		const gafas = [{ nombre_modelo: 'A' }, { nombre_modelo: 'B' }];

		expect(formatearCatalogoGafas(gafas)).toBe('- A\n- B');
	});
});

describe('formatearTiendas', () => {
	// Caso vacío: sin tiendas debe devolver el mensaje por defecto.
	it('devuelve mensaje por defecto si no hay tiendas', () => {
		expect(formatearTiendas(null)).toBe('No hay información de tiendas disponible en este momento.');
		expect(formatearTiendas([])).toBe('No hay información de tiendas disponible en este momento.');
	});

	// Caso feliz: todos los campos de la tienda aparecen formateados.
	it('formatea una tienda con todos sus campos', () => {
		const tiendas = [
			{
				nombre: 'ZOCO Sevilla',
				direccion: 'Calle Arcos 3',
				ciudad: 'Sevilla',
				telefono: '664 666 991',
				horario: 'L-V 10:00-20:00',
			},
		];

		const resultado = formatearTiendas(tiendas);

		expect(resultado).toContain('ZOCO Sevilla');
		expect(resultado).toContain('Dirección: Calle Arcos 3');
		expect(resultado).toContain('Ciudad: Sevilla');
		expect(resultado).toContain('Teléfono: 664 666 991');
		expect(resultado).toContain('Horario: L-V 10:00-20:00');
	});

	// Sin nombre, se usa "Tienda ZOCO" como nombre por defecto.
	it('usa "Tienda ZOCO" como nombre por defecto', () => {
		const resultado = formatearTiendas([{ ciudad: 'Sevilla' }]);

		expect(resultado).toContain('Tienda ZOCO');
		expect(resultado).toContain('Ciudad: Sevilla');
	});
});
