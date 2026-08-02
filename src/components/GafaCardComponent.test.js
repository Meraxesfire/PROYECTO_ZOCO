import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import GafaCardComponent from './GafaCardComponent.astro';

// Tests de componente: renderizamos GafaCardComponent con Astro Container
// (sin navegador) y comprobamos qué HTML genera.

const propsBase = {
	portadaImgUrl: '/gafas/zoco-polar.jpg',
	nombreModelo: 'Zoco Polar',
	codigoColorModelo: 'ZCO-001',
};

describe('GafaCardComponent', () => {
	// El nombre y el código de color se pintan en la tarjeta.
	it('renderiza el nombre y el código de color', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(GafaCardComponent, {
			props: propsBase,
		});

		expect(result).toContain('Zoco Polar');
		expect(result).toContain('ZCO-001');
	});

	// La imagen sale con su src y alt correctos (accesibilidad).
	it('renderiza la imagen con su alt', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(GafaCardComponent, {
			props: propsBase,
		});

		expect(result).toContain('/gafas/zoco-polar.jpg');
		expect(result).toContain('alt="Zoco Polar"');
	});

	// Con esNovedad=true aparece la etiqueta "New".
	it('muestra el badge New cuando esNovedad es true', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(GafaCardComponent, {
			props: { ...propsBase, esNovedad: true },
		});

		expect(result).toContain('New');
	});

	// Sin esNovedad no aparece la etiqueta "New" (valor por defecto).
	it('no muestra el badge New por defecto', async () => {
		const container = await AstroContainer.create();
		const result = await container.renderToString(GafaCardComponent, {
			props: propsBase,
		});

		expect(result).not.toContain('New');
	});
});
