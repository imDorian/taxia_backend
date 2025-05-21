import dotenv from "dotenv";
import jwt from "jsonwebtoken";
async function isValidToken(req, res, next) {
  const auth = req.headers.authorization;
  console.log(auth);
  if (!auth) return res.status(401).json({ error: "no autorizado" });
  const token = auth.split(" ")[1];
  if (!token) return res.status(401).json({ error: "no token" });
  console.log(token);
  try {
    const userToken = jwt.verify(token, process.env.JWT);
    if (userToken) {
      console.log(userToken);
      req._user = userToken;
    } else {
      console.log("no hay userToken");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "token no valido" });
  }

  next();
}

export { isValidToken };
