import cloudnary from "../lib/cloudnary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: " ALL Fields Are Required To Be Filled" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters " });
    }
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email Already Exist" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      await newUser.save();
      generateToken(newUser._id, res);
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "INVALID USER DATA" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "INTERNAL SERVER ERROR" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    generateToken(user._id,res);
    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,  
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logged Out Sucessfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile Pic is Required" });
    }

    const uploadResponse = await cloudnary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server error" });
  }
};
