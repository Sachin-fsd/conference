const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
// const { RegisterModel } = require('./models/register.model')
const app = express();
// const jwt = require('jsonwebtoken')
// const { userRouter } = require('./routes/user.router')
const { authenticator } = require("./middleware/authenticator.middleware");
const { postRouter } = require("./routes/post.router.js");
// const { googleAuthRouter } = require('./auth/oauth.google')
const path = require("path");
const hbs = require("hbs");
const { registerRouter } = require("./routes/register.router");
const { loginRouter } = require("./routes/login.router");
const { forgetRouter } = require("./routes/forget_pwd.route");
const { Server } = require("socket.io");
const http = require("http");
// const session = require('express-session')
const connectDB = require("./configs/db");
const { searchRouter } = require("./routes/search.router.js");
const { commentRouter } = require("./routes/comment.router.js");
const { chatRouter } = require("./routes/chat.router.js");
const { messageRouter } = require("./routes/message.router.js");
const { MessageModel } = require("./models/message.model.js");
const { ChatModel } = require("./models/chat.model.js");
const { PostModel } = require("./models/post.model.js");
const { followRouter } = require("./routes/follow.router.js");
const { settingsRouter } = require("./routes/settings.router.js");
const { RegisterModel } = require("./models/register.model.js");
const { profileRouter } = require("./routes/profile.router.js");
require("dotenv").config();

const server = http.createServer(app);
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// app.set('trust proxy', 1) // trust first proxy
// app.use(
//   session({
//     secret: process.env.secret_key,
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: true },
//   })
// );

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "/views"));
app.use("/styles", express.static(path.resolve(__dirname, "views", "styles")));
app.use(
  "/scripts",
  express.static(path.resolve(__dirname, "views", "scripts"))
);
hbs.registerHelper("json", function (context) {
  return JSON.stringify(context);
});
hbs.registerHelper("formatDate", function (date) {
  date = new Date(date);
  return date.toString().substring(0, 24);
});
hbs.registerHelper("formatText", function (text) {
  return new hbs.SafeString(text.replace(/\n/g, "<br>"));
});
hbs.registerHelper("eq", function (a, b) {
  return a === b;
});

app.get("/usersList", async (req, res) => {
  const users = await RegisterModel.find();
  res.send(users);
});
app.get("/messagesList", async (req, res) => {
  const users = await MessageModel.find();
  res.send(users);
});
app.get("/chatList", async (req, res) => {
  const users = await ChatModel.find();
  res.send(users);
});
app.get("/postList", async (req, res) => {
  const users = await PostModel.find();
  res.send(users);
});

app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/forgetpwd", forgetRouter);
app.get("/favicon.ico", (req, res) => {
  let filePath = path.join(__dirname, "favicon.ico");
  res.sendFile(filePath);
});
// app.use("/user", userRouter);

// app.use("/auth", googleAuthRouter);
// // app.use("/auth", githubAuthRouter);

// app.get("/auth/github", async (req, res) => {
//   const { code } = req.query;
//   const Access_details = await fetch(
//     "https://github.com/login/oauth/access_token",
//     {
//       method: "POST",
//       headers: {
//         "Content-type": "application/json",
//         Accept: "application/json",
//       },
//       body: JSON.stringify({
//         client_id: process.env.client_id_github,
//         client_secret: process.env.client_secret_github,
//         code,
//       }),
//     }
//   )
//     .then((res) => res.json())
//     .catch((err) => console.log(err));

//   const User_details = await fetch("https://api.github.com/user", {
//     headers: {
//       "Content-type": "application/json",
//       Authorization: `Bearer ${Access_details.access_token}`,
//       Accept: "application/json",
//     },
//   })
//     .then((res) => res.json())
//     .catch((err) => console.log(err));

//   const User_email = await fetch("https://api.github.com/user/emails", {
//     headers: {
//       "Content-type": "application/json",
//       Authorization: `Bearer ${Access_details.access_token}`,
//       Accept: "application/json",
//     },
//   })
//     .then((res) => res.json())
//     .catch((err) => console.log(err));

//   console.log(User_email, "line91");
//   const UserDetails = {
//     name: User_details.name,
//     email: User_email[0].email,
//     password: "dfgdgdgdr346t3tgdfgv",
//     dp: User_details.avatar_url,
//   };

//   const user = await RegisterModel.findOne({ email: UserDetails.email });
//   if (user) {
//     const UserDetails = {
//       UserID: user._id,
//       UserName: user.name,
//       UserEmail: user.email,
//     };
//     const token = jwt.sign(
//       { UserDetails: UserDetails },
//       process.env.secret_key,
//       { expiresIn: "7 days" }
//     );
//     res.cookie("token", token, { httpOnly: true });
//     res.cookie("UserDetails", JSON.stringify(UserDetails));
//     res.redirect("/");
//   } else {
//     const newUser = new RegisterModel({
//       name: User_details.name,
//       email: User_email[0].email,
//       password: "sadkiaeubai734862hiw",
//     });
//     await newUser.save();
//     const user = await RegisterModel.findOne({ email: req.user.email });
//     const UserDetails = {
//       UserID: user._id,
//       UserName: user.name,
//       UserEmail: user.email,
//     };
//     const token = jwt.sign(
//       { UserDetails: UserDetails },
//       process.env.secret_key,
//       { expiresIn: "7 days" }
//     );
//     res.cookie("token", token, { httpOnly: true });
//     res.cookie("UserDetails", JSON.stringify(UserDetails));
//     res.redirect("/");
//   }
// });

app.get("/welcome", (req, res) => {
  res.render("landing");
});

// app.use(authenticator)

app.use("/search", authenticator, searchRouter);
app.use("/comment", authenticator, commentRouter);
app.use("/chat", authenticator, chatRouter);
app.use("/message", authenticator, messageRouter);
app.use("/follow", authenticator, followRouter);
app.use("/settings", authenticator, settingsRouter);
app.use("/profile",authenticator,profileRouter)

app.use("/", authenticator, postRouter);

const io = new Server(server);
io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("join room", (postID) => {
    socket.join(postID);
  });
  // socket.on("join message room", (receiverID) => {
  //   socket.join(receiverID);
  // });

  socket.on("leave room", (postID) => {
    socket.leave(postID);
  });

  socket.on("new comment", (comment) => {
    io.to(comment.postID).emit("new comment", comment);
  });

  socket.on("new chat", (comment) => {
    socket.to(comment.postID).emit("new chat", comment);
    socket.to(comment.receiverID).emit("new chat", comment);
  });

  socket.on("done reading", (comment) => {
    socket.to(comment.postID).emit("done reading", comment);
  });
});

const PORT = process.env.port || 8080;


connectDB().then(() => {
  server.listen(PORT, () => {
    console.log("listening for requests");
  });
});

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));


// async function updateDp() {
//   // Fetch all posts
//   let posts = await PostModel.find();

//   // Iterate over each post
//   await Promise.all(
//     posts.map(async (post) => {
//       // Fetch the corresponding user from RegisterModel
//       if (post.UserDetails) {
//         let user = await RegisterModel.findById(post.UserDetails.UserID);

//         // If the user exists and has a dp
//         if (user && user.dp) {
//           // Update the dp in the post's UserDetails
//           post.UserDetails.UserDp = user.dp;
//           post.markModified('UserDetails');
//           // Save the updated post
//           console.log(post.UserDetails.UserDp===user.dp)
//           return post.save().catch(err => console.error(err));

//         }
//       }
//     })
//   );
// }

// Call the function
// updateDp();

// Call the function
// updateDp();

// function dlt () {
//   PostModel.find()
//     .sort({ CreatedAt: 1 })
//     .limit(5)
//     .then((docs) => {
//       docs.forEach((doc) => {
//         PostModel.findByIdAndDelete(doc._id)
//           .then((deletedDoc) => {
//             console.log('Deleted document:', deletedDoc)
//           })
//           .catch((err) => {
//             console.error('Error deleting document:', err)
//           })
//       })
//     })
//     .catch((err) => {
//       console.error('Error finding documents:', err)
//     })
// }

// update()
 
// async function update() {
//   // Fetch all posts
//   let posts = await PostModel.find();

//   // Iterate over each post
//   await Promise.all(
//     posts.map(async(post) => {
//       if(!post.UserDetails){
//         // Delete the post if it doesn't have UserDetails
//         await PostModel.findByIdAndDelete(post._id);
//       } else {
//         // Update the post with authorID and remove UserDetails
//         post.authorID = post.UserDetails.UserID;
//         delete post.UserDetails;

//         // Mark the document as modified
//         post.markModified('UserDetails');
//         post.markModified('authorID');

//         console.log(post)
//         return post.save().catch((err) => console.log(err))
//       }
//     })
//   );
// }

// Your documents
// let documents = [
  
// ];

// // Insert the documents into the PostModel
// PostModel.insertMany(documents)
//   .then(() => console.log('Documents inserted'))
//   .catch(err => console.error(err));
