import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  let token;

  try {
    token=req?.cookies?.jwt
    // console.log("mighty raju ka karachi se amna samna", token);
    token = req?.cookies?.jwt;
  } catch (err) {
    console.log("impregnit", req.cookies);
    return res.status(409).json({ message: "Invalid token format" });
  }
  // console.log("kuch ni aaya", req.cookies);
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
    // console.log("mighty raju ka karachi se amna samna", token);
    token = req?.cookies?.jwt;
  } catch (err) {
    // console.log("impregnit", req.cookies);
    return res.status(409).json({ message: "Invalid token format" });
  }
  // console.log("kuch ni aaya", req.cookies);
  if (!token) return res.status(410).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
    if (err) return res.status(411).json({ message: "Token is not valid" });
    if (payload?.userId!=14) return res.status(401).send("You are not authenticated!");
    req.userId = payload?.userId;
    // console.log("abbdbf", req.userId);
    next();
  });
}
