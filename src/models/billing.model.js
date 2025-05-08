import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import Fuel from './fuel.model';
import Uber from './uber.model';
import Bolt from './bolt.model';
import Cabify from './cabify.model';
import FreeNow from './freeNow.model';

const billingSchema = new Schema({
    earnings: {
        type: {
            amount: { type: String, required: true },
            card: { type: String, required: true },
            cash: { type: String, required: true },
        }, required: true
    },
    error: {
        type: {
            errors: { type: String, required: true },
            amount: { type: String, required: true },
        }, required: false
    },
    fuel: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Fuel' }],
    apps: {
        type: {
            uber: { type: Uber.schema, required: false },
            bolt: { type: Bolt.schema, required: false },
            cabify: { type: Cabify.schema, required: false },
            freeNow: { type: FreeNow.schema, required: false }
        }
    },
    date: { type: Date, required: true },
    description: { type: String, required: false },
});

const Billing = mongoose.model('Billing', billingSchema);

export default Billing;
