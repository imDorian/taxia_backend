import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const uberSchema = new Schema({
    amount: { type: String, required: true },
    date: { type: Date, required: true },
});

const Uber = mongoose.model('Uber', uberSchema);

export default Uber;

