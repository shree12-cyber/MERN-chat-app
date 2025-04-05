import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudnary from "../lib/cloudnary.js";
import { getRecieverSocketId, io } from "../lib/socket.js";

export const getUserForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getuser for sidebar message controller " + error.message);

    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageurl;
    if (image) {
      //upload base64 to cloudnary
      const uploadResponse = await cloudnary.uploader.upload(image);
      imageurl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageurl,
    });

    await newMessage.save();
    const   recieverSocketId =getRecieverSocketId(receiverId);
    if(recieverSocketId){
      io.to(recieverSocketId).emit("newMessage",newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("error in send mesage controler: ", error.message);
    res.status(500).json({ error: "Internal Server error" });
  }
};
