import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  let token;

  try {
    token=req?.cookies?.jwt
    token = req?.cookies?.jwt;
  } catch (err) {
    return res.status(409).json({ message: "Invalid token format" });
  }
  if (!token) return res.status(410).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
    if (err) return res.status(411).json({ message: "Token is not valid" });
    req.userId = payload?.userId;
    console.log("abbdbf", req.userId);
    next();
  });
};



export const verifyAdmin = (req, res, next)=>{
    let token;

  try {
    token=req?.cookies?.jwt
    token = req?.cookies?.jwt;
  } catch (err) {
    return res.status(409).json({ message: "Invalid token format" });
  }
  if (!token) return res.status(410).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
    if (err) return res.status(411).json({ message: "Token is not valid" });
    if (payload?.userId!=14 && payload?.userId!=32) return res.status(401).send("You are not authenticated!");
    req.userId = payload?.userId;
    next();
  });
}
