import * as mongoose from 'mongoose';

const TestSchema = new mongoose.Schema({
  active: Boolean
});

export default mongoose.model('Test', TestSchema);
