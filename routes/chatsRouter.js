const express = require("express");
const router = express.Router();
const {
  searchUser,
  accessChat,
  fetchChats,
  createGroup,
  renameGroup,
  addToGroup,
  removeUserGrp
} = require("../controller/chatsController");
const { authCheck } = require("../middleware/auth");

router.get("/users", searchUser);
router.post("/createchat", authCheck, accessChat);
router.get("/fetchchats", authCheck, fetchChats);
router.post("/group", authCheck, createGroup);
router.patch("/rename", renameGroup);
router.patch("/adduser", addToGroup);
router.patch("/removeuser", removeUserGrp);

module.exports = router;
