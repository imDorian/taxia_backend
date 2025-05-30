import { isValidToken } from "../middlewares/isValidToken.js";
import Billing from "../models/billing.model.js";
import Fuel from "../models/fuel.model.js";
import jwt from "jsonwebtoken";
export const createBilling = async (req, res) => {
  try {
    const newBilling = req.body;
    const { earnings, mistakes, fuel, apps, date, description, user } =
      newBilling;
    const billing = new Billing({
      earnings,
      mistakes,
      date,
      description,
      user,
    });

    if (Number(fuel.amount) > 0) {
      const newFuel = new Fuel(fuel);
      const savedFuel = await newFuel.save();
      billing.fuel = savedFuel._id;
      await billing.save();
      console.log(billing, "billing with fuel");
    } else {
      await billing.save();
      console.log(billing, "only billing");
    }
    const billingWithFuel = await Billing.findById(billing._id).populate(
      "fuel"
    );
    res.status(201).json(billingWithFuel);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error, "error");
  }
};

export const getBillings = async (req, res) => {
  const token = req._user;
  try {
    const billing = await Billing.find({ user: token.id })
      .sort({ date: -1 })
      .populate("fuel");
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
    console.log("Billing deleted successfully");
    res.status(200).json("Billing deleted successfully");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBillingById = async (req, res) => {
  const { id } = req.params;
  try {
    const billing = await Billing.findById(id).populate("fuel");
    res.status(200).json(billing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
