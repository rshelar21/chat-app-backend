const mongoose = require("mongoose");

// populate method use to get the data from other collection using the id of that collection 

const chatSchema = new mongoose.Schema({
    users : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }],
    isGroupChat: { type: Boolean, default: false },
    chatName : {
        type : String,
        required : true,
        trim : true,
    },
    latestMsg : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Message"
    },
    groupAdmin : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
}, {timestamps : true});


const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;