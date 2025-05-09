import Billing from '../models/billing.model.js';
import Fuel from '../models/fuel.model.js';
export const createBilling = async (req, res) => {
    try {
        const newBilling = req.body;
        const { earnings, mistakes, fuel, apps, date, description } = newBilling;
        const billing = new Billing({
            earnings,
            mistakes,
            date,
            description
        });

        if (Number(fuel.amount) > 0) {
            const newFuel = new Fuel(fuel)
            const savedFuel = await newFuel.save();
            billing.fuel = savedFuel._id;
            await billing.save();
            console.log(billing, "billing with fuel");
        } else {
            await billing.save();
            console.log(billing, "only billing");
        }
        res.status(201).json(billing);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getBilling = async (req, res) => {
    try {
        const billing = await Billing.find();
        res.status(200).json(billing);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateBilling = async (req, res) => {
    try {
        const { id } = req.params;
        const { billing } = req.body;
        const updatedBilling = await Billing.findByIdAndUpdate(id, billing);
        res.status(200).json(updatedBilling);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteBilling = async (req, res) => {
    try {
        const { id } = req.params;
        await Billing.findByIdAndDelete(id);
        res.status(200).json({ message: 'Billing deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

