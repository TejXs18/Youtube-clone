import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Token:", token); // ✅ Now token is declared
    console.log("JWT_SECRET:", process.env.JWT_SECERT);

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECERT);
    req.userId = decodedData?.id;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: "Invalid credentials." });
  }
};

export default auth;
