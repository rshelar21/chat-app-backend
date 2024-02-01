const jwt = require("jsonwebtoken");

const authCheck = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token)
      res.status(401).json({ message: "Unauthorized", result: false });
    const verifyUser = jwt.verify(token, process.env.JWT_SECRET, (err, res) => {
      if (err) {
        console.log(err);
        return "token expired";
      }
      return res;
    });
    if (verifyUser === "token expired") {
      return res.status(401).json({ message: "token expired", result: false });
    }
    req.user = verifyUser;
    // console.log(req.user);

    next();
  } catch (error) {
    console.log(error);
  }
};

module.exports = { authCheck };
