import mongoose from "mongoose";
const Schema = mongoose.Schema;

const flightSchema = new Schema({
  airline: { type: String, required: false },
  terminal: { type: String, required: false },
  scheduledTime: { type: String, required: false },
  delay: { type: String, required: false },
  flight: { type: String, required: false },
  status: { type: String, required: false },
  departureCode: { type: String, required: false },
});

const Flight = mongoose.model("Flight", flightSchema);

export default Flight;
