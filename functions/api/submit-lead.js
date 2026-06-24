export async function onRequestPost(context) {
    try {
        const data = await context.request.json();
        const { name, restaurant, phone, message } = data;

        // Validaciones básicas
        if (!name || !phone || !restaurant) {
            return new Response(
                JSON.stringify({ success: false, error: "Faltan campos obligatorios (nombre, teléfono o restaurante)" }),
                { 
                    status: 400, 
                    headers: { "Content-Type": "application/json" } 
                }
            );
        }

        const leadData = {
            name,
            restaurant,
            phone,
            message: message || "",
            timestamp: new Date().toISOString(),
            ip: context.request.headers.get("CF-Connecting-IP") || "desconocido"
        };

        // Generar una clave única usando timestamp e ip/telefono
        const leadId = `lead:${Date.now()}:${phone.replace(/\s+/g, '')}`;

        // Intentar guardar en Cloudflare KV (PORTAFOLIO_KV)
        if (context.env && context.env.PORTAFOLIO_KV) {
            await context.env.PORTAFOLIO_KV.put(leadId, JSON.stringify(leadData));
        } else {
            console.log("PORTAFOLIO_KV no está disponible en este entorno. Datos recibidos:", leadData);
        }

        return new Response(
            JSON.stringify({ 
                success: true, 
                message: "Lead guardado correctamente",
                leadId: leadId
            }),
            { 
                status: 200, 
                headers: { "Content-Type": "application/json" } 
            }
        );

    } catch (err) {
        return new Response(
            JSON.stringify({ success: false, error: "Error interno del servidor: " + err.message }),
            { 
                status: 500, 
                headers: { "Content-Type": "application/json" } 
            }
        );
    }
}
