import mongoose from "mongoose";
const Schema = mongoose.Schema;
import Uber from "./uber.model.js";
import Bolt from "./bolt.model.js";
import Cabify from "./cabify.model.js";
import FreeNow from "./freenow.model.js";

const billingSchema = new Schema({
  earnings: {
    type: {
      amount: { type: String, required: true },
      card: { type: String, required: true },
      cash: { type: String, required: true },
      tips: { type: String, required: false },
    },
    required: true,
  },
  mistakes: {
    type: {
      mistakes: { type: String, required: false },
      amount: { type: String, required: false },
    },
    required: false,
  },
  fuel: { type: mongoose.Schema.Types.ObjectId, ref: "Fuel", required: false },
  apps: {
    type: {
      uber: { type: Uber.schema, required: false },
      bolt: { type: Bolt.schema, required: false },
      cabify: { type: Cabify.schema, required: false },
      freeNow: { type: FreeNow.schema, required: false },
    },
    required: false,
  },
  date: { type: Date, required: true },
  description: { type: String, required: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Billing = mongoose.model("Billing", billingSchema);

export default Billing;
