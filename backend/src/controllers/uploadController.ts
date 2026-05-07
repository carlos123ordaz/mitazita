import { Request, Response } from 'express';
import { uploadFile } from '../services/storageService';

export const uploadPhoto = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'No se recibió ningún archivo' });
    return;
  }

  try {
    const url = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );
    res.json({ url });
  } catch (err) {
    console.error('Error subiendo foto:', err);
    res.status(500).json({ error: 'Error al subir la foto' });
  }
};
