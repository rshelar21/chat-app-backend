const express = require("express");
const router = express.Router();
const {
  searchUser,
  accessChat,
  fetchChats,
  createGroup,
  renameGroup,
  addToGroup,
  removeUserGrp,
  findUser,
} = require("../controller/chatsController");
const { authCheck } = require("../middleware/auth");

router.get("/users", authCheck, searchUser);
// create chat with one user
router.post("/createchat", authCheck, accessChat);
// fetch chats of a user
router.get("/fetchchats", authCheck, fetchChats);

router.get("/fuser", authCheck, findUser);

router.post("/group", authCheck, createGroup);
router.put("/rename",authCheck, renameGroup);
router.put("/adduser", authCheck, addToGroup);
router.put("/removeuser", authCheck, removeUserGrp);

module.exports = router;
