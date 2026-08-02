//Script de lógica para el chatbot de ZOCO
export function formatearCatalogoGafas(gafas) {
	if (!gafas || gafas.length === 0) {
		return 'No hay información de gafas disponible en este momento.';
	}

	return gafas.map((g) => {
		const parts = [
			`- ${g.nombre_modelo}`,
			g.coleccion ? `Colección: ${g.coleccion}` : '',
			g.tipo ? `Tipo: ${g.tipo}` : '',
			g.categoria_filtro ? `Categoría: ${g.categoria_filtro}` : '',
			g.material ? `Material: ${g.material}` : '',
			g.forma ? `Forma: ${g.forma}` : '',
			g.color_montura ? `Color montura: ${g.color_montura}` : '',
			g.color_desc ? `Descripción color: ${g.color_desc}` : '',
			g.color_lente ? `Color de lente: ${g.color_lente}` : '',
			g.calibre ? `Calibre: ${g.calibre}mm` : '',
			g.puente ? `Puente: ${g.puente}mm` : '',
			g.varilla ? `Largo de varilla: ${g.varilla}mm` : '',
		].filter(Boolean);
		return parts.join(', ');
	}).join('\n');
}

export function formatearTiendas(tiendas) {
	if (!tiendas || tiendas.length === 0) {
		return 'No hay información de tiendas disponible en este momento.';
	}

	return tiendas.map((t) => {
		const parts = [
			t.nombre ? `${t.nombre}` : 'Tienda ZOCO',
			t.direccion ? `Dirección: ${t.direccion}` : '',
			t.ciudad ? `Ciudad: ${t.ciudad}` : '',
			t.telefono ? `Teléfono: ${t.telefono}` : '',
			t.horario ? `Horario: ${t.horario}` : '',
		].filter(Boolean);
		return parts.join(' - ');
	}).join('\n');
}
