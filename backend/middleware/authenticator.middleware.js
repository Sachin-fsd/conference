const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticator = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    jwt.verify(token, process.env.secret_key, (err, decoded) => {
      if (err) {
        res.status(401).json({ err,token:"Token Verification error" });
      } else {
        req.body.UserDetails = decoded.UserDetails
        next();
      }
    });
  } catch (error) {
    res.json({msg:"error while authentication", error})
  }
 
};

module.exports = { authenticator };
