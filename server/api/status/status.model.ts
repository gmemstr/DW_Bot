import * as mongoose from 'mongoose';

export interface StatusInterface {
  module: 'other' | 'betting' | 'pointper' | 'frame' | 'voting' | 'game' | 'user' | 'firebase' | 'twitch',
  message?: string,
  rank: 'high' | 'normal' | 'low',
  timestamp: number;
  gameId?: number;
  data?: any,
}

const StatusSchema = new mongoose.Schema({
  module: String,
  message: String,
  rank: String,
  data: mongoose.Schema.Types.Mixed,
  date: { type: Date, default: Date.now },
  timestamp: Number,
});

export default mongoose.model('Status', StatusSchema);
