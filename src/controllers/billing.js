import Billing from '../models/billing.model';

export const createBilling = async (req, res) => {
    const { earnings, errors, fuel, apps, date } = req.body;
    const billing = new Billing({ earnings, errors, fuel, apps, date });
    await billing.save();
    res.status(201).json(billing);
};

export const getBilling = async (req, res) => {
    const billing = await Billing.find();
    res.status(200).json(billing);
};

export const updateBilling = async (req, res) => {
    const { id } = req.params;
    const { billing } = req.body;
    const updatedBilling = await Billing.findByIdAndUpdate(id, billing);
    res.status(200).json(updatedBilling);
};

export const deleteBilling = async (req, res) => {
    const { id } = req.params;
    await Billing.findByIdAndDelete(id);
    res.status(200).json({ message: 'Billing deleted successfully' });
};

