import { Request, Response } from 'express';
import Order from '../models/Order';
import { sendConfirmationEmail } from '../services/emailService';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'MZT-';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function uniqueCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = generateCode();
    const exists = await Order.findOne({ code });
    if (!exists) return code;
  }
  throw new Error('No se pudo generar código único');
}

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const { customer, mug, mugs, product, products, orderType = 'custom', basePrice, total } = req.body;

  if (!customer?.name || !customer?.surname || !customer?.phone || !customer?.email || !customer?.address) {
    res.status(400).json({ error: 'Datos del cliente incompletos' });
    return;
  }

  if (orderType === 'custom') {
    const mugList = mugs || (mug ? [mug] : []);
    if (mugList.length === 0 || !mugList[0]?.modelId || !mugList[0]?.modelName) {
      res.status(400).json({ error: 'Datos del modelo requeridos' });
      return;
    }
  }
  if (orderType === 'product' && (!product?.productId || !product?.productName)) {
    res.status(400).json({ error: 'Datos del producto requeridos' });
    return;
  }
  if (orderType === 'combined') {
    const hasMugs = Array.isArray(mugs) && mugs.length > 0;
    const hasProducts = Array.isArray(products) && products.length > 0;
    if (!hasMugs && !hasProducts) {
      res.status(400).json({ error: 'El carrito está vacío' });
      return;
    }
  }

  try {
    const code = await uniqueCode();
    const mugList = mugs || (mug ? [mug] : undefined);
    const order = await Order.create({
      code,
      orderType,
      customer,
      mug: orderType === 'custom' ? (mugList?.[0] ?? mug) : undefined,
      mugs: (orderType === 'custom' || orderType === 'combined') ? mugList : undefined,
      product: orderType === 'product' ? product : undefined,
      products: orderType === 'combined' ? products : undefined,
      basePrice,
      total,
    });
    res.status(201).json({ success: true, orderId: order._id, code: order.code });
  } catch {
    res.status(500).json({ error: 'Error al crear el pedido' });
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};

export const getOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }
    res.json(order);
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};

export const confirmOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }
    if (order.status !== 'pending') {
      res.status(400).json({ error: 'El pedido ya fue procesado' });
      return;
    }

    order.status = 'confirmed';
    order.confirmedAt = new Date();
    await order.save();

    try {
      await sendConfirmationEmail(order);
    } catch (emailErr) {
      console.error('Error enviando email de confirmación:', emailErr);
    }

    const phone = order.customer.phone.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `¡Hola ${order.customer.name}! 🎉\n\nTu pedido *${order.code}* de Mi Tazita ha sido confirmado.\n\nPronto te contactaremos para coordinar el pago y la entrega de tu taza personalizada.\n\n¡Gracias por confiar en nosotros! ☕`
    );
    const whatsappUrl = `https://wa.me/${phone}?text=${msg}`;

    res.json({ success: true, order, whatsappUrl });
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};

export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }
    if (order.status !== 'pending') {
      res.status(400).json({ error: 'El pedido ya fue procesado' });
      return;
    }

    order.status = 'cancelled';
    await order.save();
    res.json({ success: true, order });
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};
