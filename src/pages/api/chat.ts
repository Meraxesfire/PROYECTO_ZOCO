// ============================================================================
// ARCHIVO: src/pages/api/chat.ts
// PROPÓSITO: Endpoint de API que recibe mensajes del chatbot y los envía a
//            Groq (Llama 3.3 70B) junto con el contexto completo de la tienda.
//
// CÓMO FUNCIONA:
//   1. El frontend (ChatWidget.astro) envía un POST a /api/chat con:
//      - mensajeUsuario: el texto que escribió el usuario
//      - historial: array con los mensajes anteriores de la conversación
//   2. Este endpoint carga datos dinámicos de Supabase (gafas + tiendas)
//   3. Construye un system instruction con toda la info de la tienda
//   4. Envía todo a Groq y devuelve la respuesta
//
// PARA MODIFICAR:
//   - Para cambiar info de envíos, FAQ, contacto, etc: edita systemInstructionBase
//   - Para cambiar qué columnas de gafas se cargan: edita la query de Supabase
//   - Para cambiar el modelo de Groq: cambia 'llama-3.3-70b-versatile'
//   - Para cambiar la API key: edita .env (variable GROQ_API_KEY)
// ============================================================================

import type { APIRoute } from 'astro';
import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// Inicializar el cliente de Groq con la API key del .env
// IMPORTANTE: GROQ_API_KEY NO debe tener prefijo PUBLIC_ para que solo sea accesible en servidor
const groq = new Groq({ apiKey: import.meta.env.GROQ_API_KEY });


// ============================================================================
// SYSTEM INSTRUCTION (CONTEXTO ESTÁTICO DEL CHATBOT)
// ----------------------------------------------------------------------------
// Este es el texto que define QUIÉN es el chatbot y QUÉ SABE.
// Las secciones con {PLACEHOLDER} se reemplazan dinámicamente con datos de Supabase.
//
// PARA AÑADIR/INFO NUEVA: Simplemente añade una nueva sección === NOMBRE ===
// PARA MODIFICAR INFO EXISTENTE: Edita el texto dentro de la sección correspondiente
// ============================================================================
const systemInstructionBase = `
Eres el asistente virtual de ZOCO®, una marca de gafas premium con sede en Sevilla, España. Nacimos en 2024 con la visión de fusionar la artesanía óptica tradicional con el diseño contemporáneo. Respondes de forma amable, cercana y profesional. Si no sabes algo, sé honesto y ofrece ponerle en contacto con el equipo de ZOCO.

// --- Para modificar datos de la empresa, edita esta sección ---
=== DATOS DE LA EMPRESA ===
Razón social: ISPAL EYEWEAR SL
CIF: B10606499
Sede registrada: calle Trajano, 20, 41002 Sevilla
Dirección comercial: calle Arcos, 3 Local, 41011 Sevilla
Teléfono: 664 666 991
Teléfono de protección de datos: +34 673 99 54 85
Email general: info@zocoeyewear.com
Email empleo/profesional: profesional@zocoeyewear.com
Instagram: https://www.instagram.com/zocoeyewear
Facebook: https://www.facebook.com/zocoeyewear
Web: www.zocoeyewear.com

// --- Para modificar info de envíos, edita esta sección ---
=== INFORMACIÓN DE ENVÍOS ===
- Tiempo de entrega: 24 a 48 horas hábiles (lunes a viernes). Sábados, domingos y festivos no cuentan. Pedidos después de las 14:00h se procesan desde el siguiente día hábil.
- Envío gratuito en Peninsular España e Islas Baleares.
- Transportistas: Correos Express, DHL y Genesis. Se proporciona número de seguimiento por email.
- Envíos a Canarias: 20€
- Envíos a Ceuta y Melilla: 30€
- Envíos a Europa: 30€
- Resto del mundo: consultar con la tienda.
- Si hay retraso, el equipo de ZOCO contacta al cliente para informarle.

// --- Para modificar FAQ, edita esta sección ---
=== PREGUNTAS FRECUENTES (FAQ) ===
PRODUCTOS:
- Todos los productos son 100% originales. Como ópticos, trabajamos solo con fabricantes de máxima calidad.
- Cada producto incluye: estuche o funda original, paño de limpieza y documentación de autenticidad.
- Productos en stock: envío en 24-48 horas. Si hay algún problema, el equipo de atención al cliente contacta al cliente.
- Si un producto está descatalogado, se contacta al cliente para ofrecer alternativas o reembolso completo.
- Todos los precios incluyen IVA. Gastos de envío según la zona (ver sección de envíos).

PEDIDOS:
- Proceso de compra: añadir al carrito → "Finalizar Compra" → Identificación/Registro → Entrega → Pago → Confirmación.
- Email de confirmación se envía tras el pedido (revisar spam si no se recibe).
- Seguimiento de pedido: cada cambio de estado genera una notificación por email. Estados: Pedido, Proceso, Entregado, Incompleto, Incidencia, Pendiente de pago, Cancelado.
- Si te equivocas de producto, contacta a atención al cliente con el número de referencia para hacer el cambio.

// --- Para modificar términos, edita esta sección ---
=== TÉRMINOS Y CONDICIONES (RESUMEN) ===
- El sitio web www.zocoeyewear.com es propiedad de ISPAL EYEWEAR SL.
- El uso del sitio implica la aceptación de los términos y condiciones.
- ISPAL EYEWEAR SL se reserva el derecho de modificar contenidos, estructura y funcionamiento del sitio.
- Los usuarios se comprometen a usar el sitio de forma diligente y conforme a la ley.

// --- Para modificar política de privacidad, edita esta sección ---
=== POLÍTICA DE PRIVACIDAD (RESUMEN) ===
- Responsable del tratamiento: ISPAL EYEWEAR SL, C/ TRAJANO 20, 41002 Sevilla.
- Finalidad: gestión de ventas de productos ópticos y comunicación sobre servicios, promociones y eventos.
- Base legal: consentimiento, contractual o precontractual.
- Los datos se mantienen durante 5 años.
- Derechos del usuario: acceso, rectificación, cancelación, oposición, limitación, bloqueo y portabilidad. Ejercer gratis contactando a info@zocoeyewear.com.
- Autoridad de control: Agencia Española de Protección de Datos (www.aepd.es).

// --- Para modificar política de cookies, edita esta sección ---
=== POLÍTICA DE COOKIES (RESUMEN) ===
- Se usan cookies técnicas, de personalización y de análisis (propias y de terceros).
- NO se capturan hábitos de navegación con fines publicitarios.
- Tipos: técnicas (funcionamiento básico), de análisis (estadísticas de uso), publicitarias (anuncios personalizados).
- Se pueden gestionar/bloquear desde la configuración del navegador.
- Bloquearlas puede impedir el acceso a algunos servicios del sitio.

// --- Para modificar info de empleo, edita esta sección ---
=== EMPLEO ===
- ZOCO busca talento. Si quieres formar parte del equipo, envía tu candidatura a profesional@zocoeyewear.com

// =============================================================================
// CATÁLOGO DE GAFAS (DATOS DINÁMICOS DESDE SUPABASE)
// ----------------------------------------------------------------------------
// Este bloque se rellena automáticamente con los datos de la tabla "gafas".
// NO edites manualmente el contenido de abajo, se sobreescribe en cada petición.
// Para cambiar qué columnas se cargan, edita la query de Supabase más abajo
// en la función POST.
// =============================================================================
=== CATÁLOGO DE GAFAS ===
{CATALOGO_GAFAS}

// =============================================================================
// TIENDAS FÍSICAS (DATOS DINÁMICOS DESDE SUPABASE)
// ----------------------------------------------------------------------------
// Este bloque se rellena automáticamente con los datos de la tabla "tiendas".
// NO edites manualmente el contenido de abajo, se sobreescribe en cada petición.
// =============================================================================
=== TIENDAS FÍSICAS ===
{TIENDAS}
`;


// ============================================================================
// HANDLER POST - Función principal que se ejecuta al recibir un mensaje
// ----------------------------------------------------------------------------
// Flujo:
//   1. Recibe el mensaje del usuario + historial de la conversación
//   2. Consulta Supabase para obtener gafas y tiendas actualizadas
//   3. Formatea los datos y los inserta en el system instruction
//   4. Envía todo a Groq (system instruction + historial + mensaje nuevo)
//   5. Devuelve la respuesta al frontend
// ============================================================================
export const POST: APIRoute = async ({ request }) => {
  try {
    // --- PASO 1: Leer el body del request ---
    // El frontend envía: { mensajeUsuario: "texto", historial: [{role, text}, ...] }
    const { mensajeUsuario, historial } = await request.json();


    // --- PASO 2: Cargar gafas desde Supabase ---
    // Si necesitas más columnas, añádelas aquí separadas por comas.
    // Ejemplo: .select('nombre_modelo, material, calibre, MI_COLUMNA_NUEVA')
    //
    // NOTA: Si la query falla (ej: la columna no existe), gafas será null
    // y el chatbot dirá "No hay información de gafas disponible"
    const { data: gafas } = await supabase
      .from('gafas')
      .select('nombre_modelo, coleccion, tipo, categoria_filtro, color_lente, calibre, puente, varilla, material, forma, color_montura, color_desc');


    // --- PASO 3: Formatear el catálogo de gafas como texto legible ---
    // Cada gafa se formatea como una línea con todos sus atributos.
    // Si un campo está vacío/undefined, se omite (gracias al .filter(Boolean))
    let catalogoGafas = 'No hay información de gafas disponible en este momento.';
    if (gafas && gafas.length > 0) {
      catalogoGafas = gafas.map((g: any) => {
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


    // --- PASO 4: Cargar tiendas desde Supabase ---
    const { data: tiendas } = await supabase
      .from('tiendas')
      .select('*');


    // --- PASO 5: Formatear las tiendas como texto legible ---
    let tiendasInfo = 'No hay información de tiendas disponible en este momento.';
    if (tiendas && tiendas.length > 0) {
      tiendasInfo = tiendas.map((t: any) => {
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


    // --- PASO 6: Construir el system instruction completo ---
    // Reemplaza los placeholders {CATALOGO_GAFAS} y {TIENDAS}
    // con los datos formateados de Supabase
    const systemInstruction = systemInstructionBase
      .replace('{CATALOGO_GAFAS}', catalogoGafas)
      .replace('{TIENDAS}', tiendasInfo);


    // --- PASO 7: Construir los mensajes para Groq ---
    // Groq usa formato compatible con OpenAI:
    //   - { role: 'system', content: '...' } → instrucciones del sistema
    //   - { role: 'user', content: '...' } → mensaje del usuario
    //   - { role: 'assistant', content: '...' } → respuestas anteriores de la IA
    const messages: Array<{ role: string; content: string }> = [];

    // Primer mensaje: system instruction con todo el contexto de la tienda
    messages.push({ role: 'system', content: systemInstruction });

    // Añadir historial de conversación (si existe)
    if (Array.isArray(historial)) {
      for (const msg of historial) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.text,
        });
      }
    }

    // Añadir el mensaje actual del usuario al final
    messages.push({ role: 'user', content: mensajeUsuario });


    // --- PASO 8: Llamar a Groq ---
    // Modelo: llama-3.3-70b-versatile (Llama 3.3 70B, gratis en Groq)
    // Otros modelos disponibles en Groq:
    //   - 'llama-3.1-8b-instant': más rápido, menos preciso
    //   - 'mixtral-8x7b-32768': alternativa, 32k contexto
    const response = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    });


    // --- PASO 9: Devolver la respuesta al frontend ---
    // El frontend recibe: { respuesta: "texto de la IA" }
    const respuesta = response.choices[0]?.message?.content || 'No pude generar una respuesta.';

    return new Response(JSON.stringify({ respuesta }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error en chat API:', error);

    const status = error?.status || error?.code || 500;

    // Error 429: Rate limit de Groq
    if (status === 429) {
      return new Response(JSON.stringify({ error: 'El servicio está temporalmente ocupado. Inténtalo de nuevo en unos segundos.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Cualquier otro error
    return new Response(JSON.stringify({ error: 'Error procesando IA' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
