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
hbs.registerHelper("json", function (context) {
  return JSON.stringify(context);
});
hbs.registerHelper("formatDate", function (date) {
  return date.toString().substring(0, 24);
});
hbs.registerHelper("formatText", function (text) {
  return new hbs.SafeString(text.replace(/\n/g, "<br>"));
});

app.get("/usersList", async (req, res) => {
  const users = await RegisterModel.find();
  res.send(users);
});

app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/forgetpwd", forgetRouter);
app.use("/user", userRouter);

app.use("/auth", googleAuthRouter);
// app.use("/auth", githubAuthRouter);

app.get("/auth/github", async (req, res) => {
  const { code } = req.query;
  const Access_details = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.client_id_github,
        client_secret: process.env.client_secret_github,
        code,
      }),
    }
  )
    .then((res) => res.json())
    .catch((err) => console.log(err));

  const User_details = await fetch("https://api.github.com/user", {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${Access_details.access_token}`,
      Accept: "application/json",
    },
  })
    .then((res) => res.json())
    .catch((err) => console.log(err));

  const User_email = await fetch("https://api.github.com/user/emails", {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${Access_details.access_token}`,
      Accept: "application/json",
    },
  })
    .then((res) => res.json())
    .catch((err) => console.log(err));

  console.log(User_email, "line91");
  const UserDetails = {
    name: User_details.name,
    email: User_email[0].email,
    password: "dfgdgdgdr346t3tgdfgv",
    dp: User_details.avatar_url,
  };

  const user = await RegisterModel.findOne({ email: UserDetails.email });
  if (user) {
    const UserDetails = {
      UserID: user._id,
      UserName: user.name,
      UserEmail: user.email,
    };
    const token = jwt.sign(
      { UserDetails: UserDetails },
      process.env.secret_key,
      { expiresIn: "7 days" }
    );
    res.cookie("token", token, { httpOnly: true });
    res.cookie("UserDetails", JSON.stringify(UserDetails));
    res.redirect("/");
  } else {
    const newUser = new RegisterModel({
      name: User_details.name,
      email: User_email[0].email,
      password: "sadkiaeubai734862hiw",
    });
    await newUser.save();
    const user = await RegisterModel.findOne({ email: req.user.email });
    const UserDetails = {
      UserID: user._id,
      UserName: user.name,
      UserEmail: user.email,
    };
    const token = jwt.sign(
      { UserDetails: UserDetails },
      process.env.secret_key,
      { expiresIn: "7 days" }
    );
    res.cookie("token", token, { httpOnly: true });
    res.cookie("UserDetails", JSON.stringify(UserDetails));
    res.redirect("/");
  }
});

app.use(authenticator);
app.use("/", postRouter);
// app.use("/post", postRouter);

const PORT = process.env.port || 8080;

const connectDB = async () => {
  try {
    await connection;
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.log("EROOR in mongoDb ", error);
    process.exit(1);
  }
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("listening for requests");
  });
});

// app.listen(process.env.port, async () => {
//   try {
//     await connection;
//     console.log("Connected to db");
//   } catch (error) {
//     console.log(error);
//   }
//   console.log(`Server running at ${process.env.port}`);
// });
