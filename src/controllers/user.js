import dotenv from "dotenv";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import Chat from "../models/chat.model.js";

export async function getUser(req, res) {
  const user = await User.findById(req._user.id);
  const { _id, name, lastName, email, number } = user;
  const userData = {
    _id,
    name,
    lastName,
    email,
    number,
  };
  return res.json(userData);
}

export async function getUsers() {
  console.log("Entró en getUsers");
  const users = await User.find();
  console.log(users);
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    const isPass = bcrypt.compareSync(password, user.password);
    if (isPass) {
      console.log("password valid");
      const token = jwt.sign(
        {
          email: user.email,
          name: user.name,
          lastname: user.lastName,
          number: user.number,
          id: user._id,
        },
        process.env.JWT,
        {
          expiresIn: "1h",
        }
      );
      return res.json(token);
    } else {
      console.log("password invalid");
    }
  }
}

export async function register(req, res) {
  const userData = req.body;
  let newUserData = userData;
  const isEmail = await User.findOne({ email: userData.email });
  if (isEmail) return res.status(500).json({ error: "email" });
  if (userData.number) {
    const isNumber = await User.findOne({ number: userData.number });
    if (isNumber) return res.status(500).json({ error: "number" });
  }
  try {
    newUserData.password = bcrypt.hashSync(newUserData.password, 10);
    const newUser = new User(newUserData);
    const newChat = new Chat({ user: newUser._id });
    await newChat.save();
    await newUser.save();
    return res.status(201).json({ user: "created" });
  } catch (error) {
    console.error(error);
  }
}

export async function isValidToken(token) {
  const isValid = jwt.verify(token, process.env.JWT);
  console.log(isValid);
}

// createUser();
// getUsers();
