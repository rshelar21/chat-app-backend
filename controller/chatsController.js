const userModel = require("../model/userModel");
const chatModel = require("../model/chatModel");

// search user
// regex is used to search for a pattern in a string & option i is used to ignore case sensitivity
const searchUser = async(req, res) => {
    const search = req.query.search;
    console.log(search)
    try{
        // if(!search){
        //     return res.status(400).json({message : "Name is required", status : false})
        // }
        const searchUser = await userModel.find({name : {$regex : search, $options : "i"}}).find({_id : {$ne : req.user.id}})
        console.log(searchUser)

        if(!searchUser){
            return res.status(404).json({message : "User not found", status : false})
        }
        res.status(200).json({message : "User found", status : true, searchUser})
    } catch(error){
        res.status(500).json({message : "Internal server error", status : false})
    }
}


const accessChat = async(req, res) => {
    const { userId } = req.body;
    try{
        console.log(userId, "userId")
        console.log(req.user.id, "req.user.id")
        if(!userId){
            return res.status(400).json({message : "User id is required", status : false});
        }
        let isChat = await chatModel.find({
            isGroupChat: false,
            $and: [
            { users: { $elemMatch: { $eq: req.user.id } } },
            { users: { $elemMatch: { $eq: userId } } },
            ],
        }).populate("users", "-password").populate("latestMsg")

        isChat = await userModel.populate(isChat, {
            path: "latestMessage.sender",
            select: "name email",
        });
        console.log(isChat)

        if(isChat.length > 0){
            res.status(200).json({isChat : isChat, status : true})
        }
        else{
            const chatData = {
                chatName : "sender",
                isGroupChat : false,
                users : [req.user.id, userId],
            }
            const createChat = await chatModel.create(chatData);
            const fullChat = await chatModel.findById({_id : createChat._id}).populate("users", "-password")
            res.status(200).json(fullChat);
        }

    } catch(error){
        res.status(500).json({message : "Internal server error", status : false})
    }
}



const fetchChats = async(req, res) => {
    try{
        console.log(req.user.id)
        let chats = await chatModel.find({users : {$elemMatch : {$eq : req.user.id}}}).populate("users", "-password").populate("groupAdmin", "-password").populate("latestMessage").sort({updatedAt : -1})

        chats = await userModel.populate(chats, {
            path: "latestMessage.sender",
            select: "name email",
        });
        console.log(chats)

        

        res.status(200).json({chats : chats, status : true})
    } catch(error){
        res.status(500).json({message : error, status : false})
    }
}


const createGroup = async(req, res) => {
    const {users, name} = req.body;

    try{
        if(users.length < 2){
            res.status(400).json({message : "Please select atleast 2 users", status : false});
        }

        let usersData = JSON.parse(users)
        usersData.push(req.user.id)


        const groupData = {
            chatName : name,
            isGroupChat : true,
            users : usersData,
            groupAdmin : req.user.id
        }
        console.log(groupData)
        const group = await chatModel.create(groupData);
        console.log(group)
        const fullGroup = await chatModel.findById({_id : group._id}).populate("users", "-password").populate("groupAdmin", "-password");

        res.status(200).json({group : fullGroup, status : true})

    } catch(error){
        res.status(500).json({message : error, status : false})
    }
}

const renameGroup = async(req, res) => {
    const {id, chatName} = req.body;
    try{
        
        const changeName = await chatModel.findByIdAndUpdate(id, {
            chatName : chatName
        },
        {
            new : true
        }).populate("users", "-password").populate("groupAdmin", "-password");
        

        res.status(200).json({group : changeName, status : true})
    } catch(error){
        res.status(500).json({message : error, status : false})
    }
}

const addToGroup = async(req, res) => {
    const {userId, chatId} = req.body;
    try{
        
        const updatedGrp = await chatModel.findByIdAndUpdate(chatId, {
            $push : {users : userId}
        },
        {new : true}
        ).populate("users", "-password").populate("groupAdmin", "-password");
     

        res.status(200).json({group : updatedGrp, status : true})
    } catch(error){
        res.status(500).json({message : error, status : false})
    }
}

const removeUserGrp = async(req, res) => {
    const {userId, chatId} = req.body;
    try{
        
        const updatedGrp = await chatModel.findByIdAndUpdate(chatId, {
            $pull : {users : userId}
        },
        {new : true}
        ).populate("users", "-password").populate("groupAdmin", "-password");
     

        res.status(200).json({group : updatedGrp, status : true})
    } catch(error){
        res.status(500).json({message : error, status : false})
    }
}


module.exports = {
    searchUser,
    accessChat,
    fetchChats,
    createGroup,
    renameGroup,
    addToGroup,
    removeUserGrp
}