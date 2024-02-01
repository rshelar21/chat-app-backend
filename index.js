const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 8000;
require("./config/mongoDB");
require("dotenv").config({ path: ".env" });
const userRouter = require("./routes/userRouter");
const chatsRouter = require("./routes/chatsRouter");
const messageRouter = require("./routes/messageRouter");
const userModel = require("./model/userModel");
const chatModel = require("./model/chatModel");
const msgModel = require("./model/messageModel");
const {errorHandler, notFound } = require("./middleware/errorMiddleware");


app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({limit: '50mb', extended: true}));

app.use("/api/user", userRouter);
app.use("/api/chats", chatsRouter);
app.use("/api/message", messageRouter)

app.get("/api/delete", async (req, res) => {
  await userModel.deleteMany({});
  res.send("deleted");
});

app.get("/api/chat/delete", async (req, res) => {
  try {
    await chatModel.deleteMany({});
    res.send("deleted");
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/msg/delete", async (req, res) => {
  try {
    await msgModel.deleteMany({});
    res.send("deleted");
  } catch (error) {
    console.log(error);
  }
});


app.use(notFound);
app.use(errorHandler)



app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
