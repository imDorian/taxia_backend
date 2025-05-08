import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const cabifySchema = new Schema({
    amount: { type: String, required: true },
    date: { type: Date, required: true },
});

const Cabify = mongoose.model('Cabify', cabifySchema);

export default Cabify;
