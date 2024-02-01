const express = require("express");
const router = express.Router();
const { authCheck } = require("../middleware/auth");
const { sendMsg, allMsgs } = require("../controller/messageController");

router.post("/", authCheck, sendMsg);
router.get("/:chatId", authCheck, allMsgs)


module.exports = router;