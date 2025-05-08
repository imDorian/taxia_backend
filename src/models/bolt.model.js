import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const boltSchema = new Schema({
    amount: { type: String, required: true },
    date: { type: Date, required: true },
});

const Bolt = mongoose.model('Bolt', boltSchema);

export default Bolt;

