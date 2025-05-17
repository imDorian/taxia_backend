import mongoose from "mongoose";
const Schema = mongoose.Schema;

const flightSchema = new Schema({
  ariline: { type: String, required: true },
  terminal: { type: String, required: true },
  scheduledTime: { type: String, required: true },
  delay: { type: String, required: true },
  flight: { type: String, required: true },
  status: { type: String, required: true },
  departureCode: { type: String, required: true },
});

const Flight = mongoose.model("Flight", flightSchema);

export default Flight;
