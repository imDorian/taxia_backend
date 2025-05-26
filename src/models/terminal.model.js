import mongoose from "mongoose";
const Schema = mongoose.Schema;

const terminalSchema = new Schema({
  date: { type: String },
  terminal1: [{ type: mongoose.Schema.Types.ObjectId, ref: "Flight" }],
  terminal2: [{ type: mongoose.Schema.Types.ObjectId, ref: "Flight" }],
  terminal4: [{ type: mongoose.Schema.Types.ObjectId, ref: "Flight" }],
});

const Terminal = mongoose.model("Terminal", terminalSchema);

export default Terminal;
