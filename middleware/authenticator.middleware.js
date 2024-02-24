const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authenticator = (req, res, next) => {
  console.log("auth start", req.url, "line 6");
  try {
    const token = req.cookies.token || req.headers.authorization || "";
    jwt.verify(token, process.env.secret_key, (err, decoded) => {
      if (err) {
        console.log("auth start", req.route, "line 10");
        return res.redirect("/welcome");
      } else {
        req.body.UserDetails = decoded.UserDetails;
        console.log("auth start", req.url, "line 17");

        next();
      }
    });
  } catch (error) {
    return res.redirect("/welcome");
  }
};

module.exports = { authenticator };
