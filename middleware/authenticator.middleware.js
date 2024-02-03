const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser")
require("dotenv").config();

const authenticator = (req, res, next) => {
  try {
    const token = req.headers.authorization || req.cookies.token || "";
    jwt.verify(token, process.env.secret_key, (err, decoded) => {
      if (err) {
        res.status(401).json({ err,token:"Token Verification error" });
      } else {
        req.body.UserDetails = decoded.UserDetails
        next();
      }
    });
  } catch (error) {
    res.status(400).json({msg:"error while authentication", error})
  }
 
};

module.exports = { authenticator };
