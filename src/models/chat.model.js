import mongoose from "mongoose";
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  timeRange: { type: String },
  locationName: { type: String },
  reason: { type: String },
  arrivalTime: { type: String },
  departureTime: { type: String },
  demandLevel: { type: String },
  googleMaps: { type: String },
  waze: { type: String },
  notes: { type: String },
});

const ChatSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  chat: [MessageSchema],
});

const Chat = mongoose.model("Chat", ChatSchema);

export default Chat;
