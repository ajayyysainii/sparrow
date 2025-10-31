import mongoose from 'mongoose';

const callSchema = new mongoose.Schema({
  duration: {
    type: Number,
    required: false,
  },
  callid: {
    type: String,
    required: false,
    unique: true,
  },
  callrecording_url: {
    type: String,
    required: false,
  },
  cost: {
    type: Number,
    required: false,
  },
  time: {
    type: Date,
    required: false,
    default: Date.now,
  },
});

const Call = mongoose.model('Call', callSchema);

export default Call;
