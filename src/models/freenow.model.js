import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const freeNowSchema = new Schema({
    amount: { type: String, required: true },
    date: { type: Date, required: true },
});

const FreeNow = mongoose.model('FreeNow', freeNowSchema);

export default FreeNow;

