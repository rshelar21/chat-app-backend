const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 8080;
require("./config/mongoDB");
require("dotenv").config({ path: ".env" });
const userRouter = require("./routes/userRouter");
const chatsRouter = require("./routes/chatsRouter");
const userModel = require("./model/userModel");
const chatModel = require("./model/chatModel");
const {errorHandler, notFound } = require("./middleware/errorMiddleware");


app.use(cors());
app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({limit: '50mb', extended: true}));

app.use("/api/user", userRouter);

app.use("/api/chats", chatsRouter);

app.get("/api/delete", async (req, res) => {
  await userModel.deleteMany({});
  res.send("deleted");
});

app.get("/api/chat", async (req, res) => {
    await userModel.deleteMany({});
    res.send("deleted");
});

app.use(notFound);
app.use(errorHandler)



app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
