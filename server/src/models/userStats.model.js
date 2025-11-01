import mongoose from 'mongoose';

const userStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
  },
  streak: {
    type: Number,
    default: 0,
    min: 0,
  },
  lastCompletedDate: {
    type: String, // ISO format date string
    default: null,
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: 0,
  },
  completedExercisesToday: {
    type: [String], // Array of exercise IDs completed today
    default: [],
  },
  lastCompletedExerciseDate: {
    type: String, // Date when exercises were last completed
    default: null,
  },
}, {
  timestamps: true,
});

const UserStats = mongoose.model('UserStats', userStatsSchema);

export default UserStats;

