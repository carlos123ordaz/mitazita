import { Resend } from 'resend';
import { IOrder } from '../models/Order';

const resend = new Resend(process.env.RESEND_API_KEY);

const EXTRAS_LABELS: Record<string, string> = {
  caja: 'Caja de regalo',
  tarjeta: 'Tarjeta dedicatoria',
  magica: 'Convertir en taza mágica',
  delivery: 'Delivery Lima 24h',
};

const EXTRAS_PRICES: Record<string, number> = {
  caja: 8,
  tarjeta: 5,
  magica: 10,
  delivery: 12,
};

export async function sendConfirmationEmail(order: IOrder): Promise<void> {
  const isProduct = order.orderType === 'product';

  const activeExtrasRows = (!isProduct && order.mug) ? Object.entries(order.mug.extras)
    .filter(([, val]) => val)
    .map(
      ([key]) =>
        `<tr>
          <td style="padding:10px 0;color:#6b5b54;border-bottom:1px solid #e8dccf;">+ ${EXTRAS_LABELS[key]}</td>
          <td style="padding:10px 0;text-align:right;border-bottom:1px solid #e8dccf;">S/ ${EXTRAS_PRICES[key]}</td>
        </tr>`
    )
    .join('') : '';

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Pedido confirmado · Mi Tazita</title>
</head>
<body style="margin:0;padding:0;background:#faf4ee;font-family:'Helvetica Neue',Arial,sans-serif;color:#2a1f1c;-webkit-font-smoothing:antialiased;">
  <div style="max-width:580px;margin:0 auto;padding:40px 20px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:36px;">
      <h1 style="font-size:30px;font-weight:400;letter-spacing:-0.02em;margin:0;font-family:Georgia,serif;">Mi Tazita<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#c8788a;margin-left:4px;vertical-align:middle;"></span></h1>
      <p style="color:#9b8a82;font-size:12px;margin:6px 0 0;letter-spacing:.04em;">Lima, Perú · hola@mitazita.pe</p>
    </div>

    <!-- Card -->
    <div style="background:#ffffff;border-radius:16px;border:1px solid #e8dccf;padding:36px 32px;box-shadow:0 1px 2px rgba(60,30,20,.05),0 8px 24px rgba(60,30,20,.06);">

      <!-- Code badge -->
      <div style="background:linear-gradient(135deg,#c8788a,#a4546a);color:white;border-radius:12px;padding:18px 24px;text-align:center;margin-bottom:32px;">
        <p style="margin:0;font-size:11px;letter-spacing:.22em;text-transform:uppercase;opacity:.85;">Código de pedido</p>
        <p style="margin:10px 0 0;font-size:40px;font-weight:700;letter-spacing:.12em;font-family:'Courier New',monospace;">${order.code}</p>
      </div>

      <h2 style="font-size:24px;font-weight:400;margin:0 0 8px;font-family:Georgia,serif;">¡Pedido confirmado, ${order.customer.name}! 🎉</h2>
      <p style="color:#6b5b54;font-size:14px;margin:0 0 28px;line-height:1.6;">Pronto te contactaremos para coordinar el pago y la entrega. Guarda tu código de pedido.</p>

      <!-- Order details -->
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:12px 0;color:#6b5b54;border-bottom:1px solid #e8dccf;">${isProduct ? 'Producto' : 'Modelo'}</td>
          <td style="padding:12px 0;text-align:right;border-bottom:1px solid #e8dccf;font-weight:500;">${isProduct ? order.product?.productName : order.mug?.modelName}</td>
        </tr>
        ${!isProduct && order.mug?.text.name ? `
        <tr>
          <td style="padding:12px 0;color:#6b5b54;border-bottom:1px solid #e8dccf;">Nombre en taza</td>
          <td style="padding:12px 0;text-align:right;border-bottom:1px solid #e8dccf;">${order.mug?.text.name}</td>
        </tr>` : ''}
        ${!isProduct && order.mug?.text.dedication ? `
        <tr>
          <td style="padding:12px 0;color:#6b5b54;border-bottom:1px solid #e8dccf;">Dedicatoria</td>
          <td style="padding:12px 0;text-align:right;border-bottom:1px solid #e8dccf;font-style:italic;">"${order.mug?.text.dedication}"</td>
        </tr>` : ''}
        <tr>
          <td style="padding:12px 0;color:#6b5b54;border-bottom:1px solid #e8dccf;">Precio base</td>
          <td style="padding:12px 0;text-align:right;border-bottom:1px solid #e8dccf;">S/ ${order.basePrice}</td>
        </tr>
        ${activeExtrasRows}
        <tr>
          <td style="padding:18px 0 4px;font-size:20px;font-family:Georgia,serif;font-weight:400;">Total</td>
          <td style="padding:18px 0 4px;text-align:right;font-size:20px;font-family:Georgia,serif;color:#a4546a;font-weight:500;">S/ ${order.total}</td>
        </tr>
      </table>

      <!-- Delivery info -->
      <div style="background:#faf4ee;border-radius:10px;padding:20px 22px;margin-top:28px;">
        <p style="margin:0 0 12px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#9b8a82;font-weight:600;">Datos de entrega</p>
        <p style="margin:0;font-size:14px;font-weight:500;">${order.customer.name} ${order.customer.surname}</p>
        <p style="margin:5px 0 0;font-size:14px;color:#6b5b54;">${order.customer.address}</p>
        ${order.customer.reference ? `<p style="margin:4px 0 0;font-size:13px;color:#9b8a82;">Ref: ${order.customer.reference}</p>` : ''}
        <p style="margin:10px 0 0;font-size:14px;">${order.customer.phone} · ${order.customer.email}</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:32px;">
      <p style="font-size:13px;color:#9b8a82;line-height:1.6;">
        ¿Preguntas? Escríbenos por
        <a href="https://wa.me/${process.env.WA_PHONE}" style="color:#a4546a;text-decoration:none;">WhatsApp</a>
        o a
        <a href="mailto:hola@mitazita.pe" style="color:#a4546a;text-decoration:none;">hola@mitazita.pe</a>
      </p>
      <p style="font-size:11px;color:#9b8a82;margin-top:12px;letter-spacing:.04em;">© 2026 Mi Tazita · Lima, Perú · Hecho con cariño para mamás reales.</p>
    </div>

  </div>
</body>
</html>`;

  await resend.emails.send({
    from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
    to: order.customer.email,
    subject: `✨ Pedido confirmado #${order.code} — Mi Tazita`,
    html,
  });
}
