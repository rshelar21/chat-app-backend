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
        const searchUser = await userModel.find({name : {$regex : search, $options : "i"}})
        .find({_id : {$ne : req.user.id}}).select("-password");
        console.log(searchUser)

        if(!searchUser || searchUser.length === 0){
            return res.status(400).json({message : "User not found", status : false})
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
        console.log(isChat)
        // console.log('///////')

        isChat = await userModel.populate(isChat, {
            path: "latestMessage.sender",
            select: "name email",
        });
        console.log(isChat)

        if(isChat.length > 0){
            console.log('exit chat')
            res.status(200).json({isChat : isChat, status : true})
        }
        else{
            console.log('create chat')
            const chatData = {
                chatName : "sender",
                isGroupChat : false,
                users : [req.user.id, userId],
            }
            const createChat = await chatModel.create(chatData);
            console.log(createChat, "createChat") 
            const fullChat = await chatModel.findById({_id : createChat._id}).populate("users", "-password") // populate method use to get the data from other collection using the id of that collection
            res.status(200).json(fullChat);
        }

    } catch(error){
        res.status(500).json({message : "Internal server error", status : false})
    }
}


// fetch chats of a user
const fetchChats = async(req, res) => {
    try{
        // let chats = await chatModel.find({users : {$elemMatch : {$eq : req.user.id}}}).populate("groupAdmin", "-password").populate("latestMessage").sort({updatedAt : -1})

        // chats = await userModel.populate(chats, {
        //     path: "latestMessage.sender",
        //     select: "name email",
        // });
        await chatModel.find({users : {$elemMatch : {$eq : req.user.id}}}).populate("users", "-password")
        .populate("groupAdmin", "-password").populate("latestMsg").sort({updatedAt : -1}).then(async (result) => {
            result = await userModel.populate(result, {
                path: "latestMsg.sender",
                select: "name email userImg",
            })
            res.status(200).json({chats : result, status : true})
        } )  
        
        


        // res.status(200).json({chats : result, status : true})
    } catch(error){
        res.status(500).json({message : error, status : false})
    }
}


const createGroup = async(req, res) => {
    const {users, name} = req.body;
    console.log(users, name)
    try{
        // var user = JSON.parse(req.body.users);
        // if(!users || !name){
        //     res.status(400).json({message : "All fields are required", status : false});
        // }
        
        if(users.length < 2){
            res.status(400).json({message : "Please select atleast 2 users", status : false});
        }

        const existingGrp = await chatModel.find({chatName : name});
        console.log(existingGrp, "existingGrp")
        if(existingGrp.length > 0){
            return res.status(400).json({message : "Group name already exist", status : false});
        }
        // let usersData =
        let usersData = users
        usersData.push(req.user.id)
        console.log(usersData)


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
        res.status(500).json({message : error.message, status : false})
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


const findUser = async(req, res) => {
    try {
        console.log(req.user.id);
        const userId = req.user.id;
        if(!userId){
            return res.status(400).json({message : "User id is required", status : false});
        }
        const users = await userModel.findById(userId).select("-password")
        // const users = await userModel.find({})
        res.json(users)
      } catch (error) {
        console.log(error);
      }
}


module.exports = {
    searchUser,
    accessChat,
    fetchChats,
    createGroup,
    renameGroup,
    addToGroup,
    removeUserGrp,
    findUser
}