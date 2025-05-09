import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const fuelSchema = new Schema({
    type: { type: String, required: true },
    liters: { type: String, required: false },
    price: { type: String, required: false },
    amount: { type: String, required: true },
    date: { type: String, required: true },
});

const Fuel = mongoose.model('Fuel', fuelSchema);

export default Fuel;
