import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  let token;

  try {
    token = JSON.parse(req?.cookies?.jwt)?.jwt;
  } catch (err) {
    return res.status(409).json({ message: "Invalid token format" });
  }

  if (!token) return res.status(410).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
    if (err) return res.status(411).json({ message: "Token is not valid" });
    req.userId = payload.userId;
    next();
  });
};



export const verifyAdmin = (req, res, next)=>{
    const token = JSON.parse(req.cookies.jwt).jwt;
    if (!token) return res.status(401).send("You are not authenticated!");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) return res.status(403).send("Token is not valid!");
      if (payload?.userId!=11) return res.status(401).send("You are not authenticated!");
      req.userId = payload?.userId;
      next();
    });
}