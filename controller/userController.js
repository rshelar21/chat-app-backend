const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../model/userModel");

// login route
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "All fields are required", result: false });
    }
    const searchUser = await userModel.findOne({ email });
    console.log(searchUser);

    if (!searchUser)
      return res
        .status(404)
        .json({ message: "User does not exist", result: false });

    const checkPassword = await bcrypt.compare(password, searchUser.password);
    console.log(checkPassword, "checkPassword");

    if (!checkPassword) {
      return res
        .status(404)
        .json({ message: "Invalid Password", status: false });
    }

    const token = await jwt.sign(
      {
        email: searchUser.email,
        id: searchUser._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    console.log(token);
    const data = {
      name: searchUser.name,
      userImg: searchUser.userImg,
      token,
      _id: searchUser._id,
      email: searchUser.email,
    };
    res
      .status(200)
      .json({ message: "Login successful", status: true, user: data });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// register route
const registerUser = async (req, res) => {
  const { email, password, name, userImg } = req.body;
  try {
    if (!email || !password || !userImg || !name) {
      return res
        .status(400)
        .json({ message: "All fields are requiered", status: false });
    }
    const alreadyUser = await userModel.findOne({ email });
    if (alreadyUser) {
      return res
        .status(400)
        .json({ message: "User already exists", status: false });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
      email,
      password: hashPassword,
      name,
      userImg,
    });
  

    const token = await jwt.sign(
      {
        email: newUser.email,
        id: newUser._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    const data = {
      name: newUser.name,
      userImg: newUser.userImg,
      token,
      _id: newUser._id,
      email: newUser.email,
    }

    res.status(200).json({
      message: "User created successfully",
      status: true,
      user : data
    });
  } catch (err) {
    res.status(500).json({ message: err.message, status: false });
  }
};

module.exports = {
  loginUser,
  registerUser,
};
