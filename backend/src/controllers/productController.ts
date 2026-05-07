import { Request, Response } from 'express';
import Product from '../models/Product';
import { uploadFile, deleteFile } from '../services/storageService';

export const getActiveProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({ active: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};

export const getAllProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) { res.status(404).json({ error: 'Producto no encontrado' }); return; }
    res.json(product);
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, oldPrice, category, stock, active } = req.body;
    if (!name || price === undefined) {
      res.status(400).json({ error: 'Nombre y precio son requeridos' });
      return;
    }

    let imageUrl = req.body.imageUrl || '';
    if (req.file) {
      imageUrl = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    }
    if (!imageUrl) {
      res.status(400).json({ error: 'Se requiere una imagen' });
      return;
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      imageUrl,
      category: category || 'Diseños exclusivos',
      stock: stock !== undefined ? Number(stock) : 99,
      active: active !== undefined ? Boolean(active) : true,
    });

    res.status(201).json(product);
  } catch {
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) { res.status(404).json({ error: 'Producto no encontrado' }); return; }

    const { name, description, price, oldPrice, category, stock, active } = req.body;

    let imageUrl = product.imageUrl;
    if (req.file) {
      const oldUrl = product.imageUrl;
      imageUrl = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
      try { await deleteFile(oldUrl); } catch { /* ignore */ }
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (oldPrice !== undefined) product.oldPrice = oldPrice === '' ? undefined : Number(oldPrice);
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = Number(stock);
    if (active !== undefined) product.active = active === 'true' || active === true;
    product.imageUrl = imageUrl;

    await product.save();
    res.json(product);
  } catch {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

export const toggleProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) { res.status(404).json({ error: 'Producto no encontrado' }); return; }
    product.active = !product.active;
    await product.save();
    res.json(product);
  } catch {
    res.status(500).json({ error: 'Error interno' });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) { res.status(404).json({ error: 'Producto no encontrado' }); return; }
    try { await deleteFile(product.imageUrl); } catch { /* ignore */ }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};
