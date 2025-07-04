import jwt from "jsonwebtoken";
const auth = (req, res, next) => {
  console.log("Token:", token);
console.log("JWT_SECRET:", process.env.JWT_SECRET);


  try {
    console.log('Auth header:', req.headers.authorization);
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    let decodedData = jwt.verify(token, process.env.JWT_SECERT);
    req.userId = decodedData?.id;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: "Invalid credentials." });
  }
};

export default auth;
