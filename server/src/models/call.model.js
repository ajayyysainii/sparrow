import mongoose from 'mongoose';

const callSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  callid: {
    type: String,
    required: true,
    unique: true,
  },
});

const Call = mongoose.model('Call', callSchema);

export default Call;
