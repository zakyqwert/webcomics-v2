import mongoose from 'mongoose';

/**
 * Menghubungkan aplikasi Express ke database MongoDB menggunakan Mongoose.
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI belum dikonfigurasi di file .env');
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Terhubung: ${conn.connection.host} (DB: ${conn.connection.name})`);
  } catch (error) {
    console.error(`❌ Gagal terhubung ke MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
