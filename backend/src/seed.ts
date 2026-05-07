import './env';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from './models/Admin';

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI no configurado en .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Conectado a MongoDB');

  const email = 'admin@mitazita.pe';
  const existing = await Admin.findOne({ email });

  if (existing) {
    console.log('El admin ya existe:', email);
    await mongoose.disconnect();
    return;
  }

  const password = await bcrypt.hash('admin123', 10);
  await Admin.create({ email, password, name: 'Administrador Mi Tazita' });

  console.log('\n✅ Admin creado exitosamente');
  console.log('   Email:', email);
  console.log('   Contraseña: admin123');
  console.log('\n⚠️  Cambia la contraseña después del primer inicio de sesión.\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
