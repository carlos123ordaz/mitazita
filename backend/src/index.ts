import './env'; // must be first — loads .env before any other module initializes
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import orderRoutes from './routes/orders';
import uploadRoutes from './routes/upload';
import productRoutes from './routes/products';

const app = express();
const PORT = process.env.PORT || 4000;

const allowed = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: allowed.length ? allowed : '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/products', productRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

mongoose
  .connect(process.env.MONGODB_URI!, { family: 4 })
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(PORT, () => console.log(`Backend en http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Error conectando a MongoDB:', err);
    process.exit(1);
  });
