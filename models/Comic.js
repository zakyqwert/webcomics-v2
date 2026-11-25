import mongoose from 'mongoose';

export const VALID_STATUSES = ['Reading', 'Plan to Read', 'Completed', 'Dropped'];

const comicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Judul komik wajib diisi'],
      trim: true,
      maxlength: [200, 'Judul komik maksimal 200 karakter']
    },
    author: {
      type: String,
      trim: true,
      default: 'Unknown'
    },
    genre: {
      type: [String],
      default: ['General']
    },
    status: {
      type: String,
      enum: {
        values: VALID_STATUSES,
        message: 'Status harus salah satu dari: Reading, Plan to Read, Completed, Dropped'
      },
      default: 'Plan to Read'
    },
    currentChapter: {
      type: Number,
      min: [0, 'Chapter saat ini tidak boleh negatif'],
      default: 0
    },
    totalChapters: {
      type: Number,
      min: [0, 'Total chapter tidak boleh negatif'],
      default: 0
    },
    rating: {
      type: Number,
      min: [0, 'Rating minimal 0'],
      max: [10, 'Rating maksimal 10'],
      default: 0
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    // Field tambahan untuk integrasi eksternal MangaDex API
    mangadexId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true // Mengizinkan banyak dokumen tanpa mangadexId (input manual)
    },
    coverUrl: {
      type: String,
      trim: true,
      default: ''
    },
    source: {
      type: String,
      enum: ['manual', 'mangadex'],
      default: 'manual'
    }
  },
  {
    timestamps: true // Otomatis menambahkan createdAt dan updatedAt
  }
);

// Auto-update status menjadi 'Completed' jika currentChapter >= totalChapters
comicSchema.pre('save', function (next) {
  if (this.totalChapters > 0 && this.currentChapter >= this.totalChapters) {
    this.status = 'Completed';
  }
  next();
});

const Comic = mongoose.model('Comic', comicSchema);

export default Comic;
