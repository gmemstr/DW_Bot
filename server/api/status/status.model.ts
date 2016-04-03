import * as mongoose from 'mongoose';

export interface StatusInterface {
  module: 'default' | 'betting' | 'pointper' | 'frame' | 'voting' | 'status',
  message: string,
  rank: 'high' | 'normal' | 'low',
  data: any,
  date?: Date;
  timestamp: number;
  gameId: number;
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
