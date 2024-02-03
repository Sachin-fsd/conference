const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connection } = require("./configs/db");
const { RegisterModel } = require("./models/register.model");
const app = express();
const jwt = require("jsonwebtoken");
const { userRouter } = require("./routes/user.router");
const { authenticator } = require("./middleware/authenticator.middleware");
const { postRouter } = require("./routes/post.route");
const { googleAuthRouter } = require("./auth/oauth.google");
const { githubAuthRouter } = require("./auth/oauth.github");
const path = require("path");
const hbs = require("hbs");
const { registerRouter } = require("./routes/register.router");
const { loginRouter } = require("./routes/login.router");
const { PostModel } = require("./models/post.model");
const { forgetRouter } = require("./routes/forget_pwd.route");
require("dotenv").config();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "/views"));
app.use("/styles", express.static(__dirname + "/views/styles"));
app.use("/scripts", express.static(__dirname + "/views/scripts"));
hbs.registerHelper('json', function(context) {
  return JSON.stringify(context);
});
hbs.registerHelper('formatDate', function(date) {
    return date.toString().substring(0, 24);
});


app.get("/usersList", async (req, res) => {
  const users = await RegisterModel.find();
  res.send(users);
});

app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/forgetpwd",forgetRouter)
app.use("/user", userRouter);

app.use("/auth", googleAuthRouter);
app.use("/auth", githubAuthRouter);

// app.use(authenticator);

app.get("/", authenticator, async (req, res) => {
  try {
    // const UserID = req.body.UserDetails.UserID;
    // const Users = await RegisterModel.find({},{name:1, email:1, _id:1}).sort({CreatedAt: -1}).limit(7);
    // const userLikes = await LikeModel.find({ UserID }).limit(20);

    // const likedPostIds = new Set(
    //   userLikes.map((like) => like.postID.toString())
    // );

    const posts = await PostModel.find().sort({ CreatedAt: -1 }).limit(20);

    // const postWithLikes = posts.map((post) => {
    //   const liked = likedPostIds.has(post._id.toString());
    //   return { ...post._doc, liked };
    // });
    // console.log(req.body.UserDetails, posts);
  res.render("index",{ UserDetails: req.body.UserDetails, posts });

  } catch (error) {
    console.log(error);
    res.redirect("/login")
  }
});
app.use("/posts", postRouter);

app.get("/data", (req, res) => {
  res.json({ task: "bath", time: "evening", Founder: "sachin" });
});

app.listen(process.env.port, async () => {
  try {
    await connection;
    console.log("Connected to db");
  } catch (error) {
    console.log(error);
  }
  console.log(`Server running at ${process.env.port}`);
});
