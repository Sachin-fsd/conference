const express = require("express");
const cors = require("cors");
const { connection } = require("./configs/db");
const { RegisterModel } = require("./models/register.model");
const app = express();
const jwt = require("jsonwebtoken");
const { noteRouter } = require("./routes/note.route");
const { userRouter } = require("./routes/user.router");
const { authenticator } = require("./middleware/authenticator.middleware");
const path = require("path")
require("dotenv").config()

app.use(cors())

app.use(express.json());

app.get("/",async(req,res)=>{
    // const filepath = path.resolve(__dirname+'../frontend/register.html')
    // res.sendFile(filepath);
    const users =await RegisterModel.find();
    res.send(users);
})

app.use("/user",userRouter)
app.use(authenticator)
app.use("/note",noteRouter)

app.get("/data",(req,res)=>{
    res.json({task:"bath",time:"evening",Founder:"sachin"})
})

app.listen(process.env.port,async()=>{
    try {
        await connection;
        console.log("Connected to db");
    } catch (error) {
        console.log(error);
    }
    console.log(`Server running at ${process.env.port}`);
})