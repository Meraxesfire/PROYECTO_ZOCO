// ============================================================================
// ARCHIVO: src/pages/api/contact.ts
// PROPÓSITO: Endpoint que recibe el formulario de contacto y reenvía los
//            datos a Web3Forms, que a su vez envía el email a info@zocoeyewear.com
//
// CÓMO FUNCIONA:
//   1. El frontend (contact.astro) envía un POST a /api/contact con:
//      - name, email, company, phone, message
//   2. Este endpoint reenvía los datos a Web3Forms (la API key nunca sale del servidor)
//   3. Web3Forms envía el email a la dirección configurada en su dashboard
//
// PARA MODIFICAR:
//   - Para cambiar la API key: edita .env (variable WEB3FORMS_API_KEY)
//   - Para cambiar el destinatario: configúralo en el dashboard de Web3Forms
// ============================================================================

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, company, phone, message } = body;

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nombre, email y mensaje son obligatorios.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: import.meta.env.WEB3FORMS_API_KEY,
        name,
        email,
        company: company || '',
        phone: phone || '',
        message,
        subject: `Contacto desde web: ${name}`,
        from_name: 'ZOCO Eyewear - Formulario de Contacto',
      }),
    });

    const result = await response.json();

    if (result.success) {
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Error al enviar el mensaje.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error en contact API:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error del servidor.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
