import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  callId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Call',
    required: true,
  },
  sentimentAnalysis: {
    type: String,
    required: false,
    enum: ['Positive', 'Neutral', 'Negative'],
  },
  confidenceLevel: {
    type: Number,
    required: false,
    min: 0,
    max: 100,
  },
  vocabularyRichness: {
    type: Number,
    required: false,
    min: 0,
    max: 100,
  },
  speakingTimeSplit: {
    caller: {
      type: Number,
      required: false,
      default: 0,
    },
    callee: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  areasToImprove: {
    type: [String],
    required: false,
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
reportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Check if model already exists to avoid overwrite error
const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);

export default Report;

