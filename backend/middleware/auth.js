import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No token provided. Please log in." });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // contains user info
      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        console.error("⚠️ Token expired:", err);
        return res
          .status(401)
          .json({ message: "Token expired. Please log in again." });
      } else {
        console.error("❌ Invalid token:", err);
        return res
          .status(401)
          .json({ message: "Invalid token. Please log in again." });
      }
    }
  } catch (error) {
    console.error("❌ Auth middleware error:", error);
    res.status(500).json({ message: "Server error during authentication" });
  }
};

export default auth;
