import dotenv from "dotenv";
import User from "../models/user.model.js";

export async function createUser(req, res) {
  const newUser = new User({
    email: "dorian.esp44@gmail.com",
    name: "dorian",
  });
  await newUser.save();
  console.log(newUser, "usuario creado");
}

export async function getUser(id) {
  const user = await User.findById(id);
  console.log(user);
}

export async function getUsers() {
  console.log("Entró en getUsers");
  const users = await User.find();
  console.log(users);
}

// createUser();
// getUsers();
