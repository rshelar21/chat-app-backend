const mongoose = require("mongoose");
const userModel = require("../model/userModel");
const chatModel = require("../model/chatModel");
const messageModel = require("../model/messageModel");


const sendMsg = async (req, res) => {
  const { content, chatId } = req.body;
  try {
    if (!content || !chatId) {
      return res
        .status(400)
        .json({ message: "All fields are required", status: false });
    }
    let message = await messageModel.create({
        sender: req.user.id,
        chat : chatId,
        content,
    })

    message = await message.populate("sender", "name email userImg")
    message = await message.populate("chat")
    message = await userModel.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    // console.log(message)
    await chatModel.findByIdAndUpdate(req.body.chatId, { latestMsg: message });


    res.status(200).json({message : message, status : true})
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error, status: false });
  }
};

const allMsgs = async(req, res) => {
    try {
        const messages = await messageModel.find({ chat: req.params.chatId })
          .populate("sender", "name email")
          .populate("chat");
        res.status(200).json({message : messages, status : true})
      } catch (error) {
        res.status(400);
        throw new Error(error.message);
      }
}

module.exports = { sendMsg, allMsgs };
