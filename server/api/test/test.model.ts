import * as mongoose from 'mongoose';

const TestSchema: any = new mongoose.Schema({
  name: String,
  info: String,
  active: Boolean
});

export default mongoose.model('Test', TestSchema);
