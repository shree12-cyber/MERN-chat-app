import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    
    const token = req.cookies.jwt;
    // console.log(token);
    

    if (!token) {
      return res
        .status(401)
        .json({ message: "unauthorize -No Token Provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Token Invalid" });
    }
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Error" });
  }
};
