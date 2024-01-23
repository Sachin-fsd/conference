const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticator = (req, res, next) => {
  const token = req.headers.authorization;
  jwt.verify(token, process.env.secret_key, (err, decoded) => {
    if (err) {
      res.status(401).json({ err,token:"Token Verification error" });
    } else {
      
      req.body.UserDetails = decoded.UserDetails
      console.log("decoded=>",decoded);
      next();
    }
  });
};

module.exports = { authenticator };
