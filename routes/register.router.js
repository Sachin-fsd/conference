const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
require("dotenv").config();
const nodemailer = require("nodemailer")
const crypto = require('crypto');
const bcrypt = require("bcrypt");
const { PendingUserModel } = require("../models/pendingUsers.model");
const { RegisterModel } = require("../models/register.model");

const storage = multer.memoryStorage({
    destination: (req, file, cb) => {
        cb(null, "");
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype.startsWith("image/") ||
        file.mimetype == "application/pdf" ||
        file.mimetype == "video/mp4"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({ storage, fileFilter });


const registerRouter = express.Router();
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.mail_admin,
        pass: process.env.mail_password
    }
})
registerRouter.get("/", async (req, res) => {
    // console.log("hitcame")
    try {
        res.render("register", {})
    } catch (error) {
        console.log(error)
    }
})
registerRouter.post("/", upload.single("idcard"), async (req, res) => {
    try {
        let { name, email, password, section, course, rollno, school } = req.body;
        const user = await RegisterModel.findOne({ email });
        const pendinguser = await PendingUserModel.findOne({ email })
        if (user || pendinguser) {
            return res.status(400).json({ message: "User already exists." })
        } else {
            console.log(req.file, "req.file")
            const token = crypto.randomBytes(16).toString('hex');

            const hashed = await bcrypt.hash(password, 2);
            const data = { name, email, password: hashed, section, course, rollno, school, token };
            console.log(data)
            await PendingUserModel.create(data)

            let mailOptions = {
                from: process.env.mail_admin,
                to: process.env.mail_admin,
                subject: 'New Registration',
                text: `
              Name: ${req.body.name}
              School: ${req.body.school}
              Course: ${req.body.course}
              Section: ${req.body.section}
              Rollno: ${req.body.rollno}
              Email: ${req.body.email}
            `,
                html: `
              <p>New user registration:</p>
              <p>Name: ${req.body.name}</p>
              <p>School: ${req.body.school}</p>
              <p>Course: ${req.body.course}</p>
              <p>Section: ${req.body.section}</p>
              <p>Rollno: ${req.body.rollno}</p>
              <p>Email: ${req.body.email}</p>
              <button><a href="http://localhost:8080/register/verify?token=${encodeURIComponent(token)}">Click here to verify</a></button>
              <button><a href="http://localhost:8080/register/decline?token=${encodeURIComponent(token)}">Click here to decline</a></button>
            `,
                attachments: [
                    {
                        filename: req.file.originalname,
                        content: req.file.buffer
                    }
                ]
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
            })
            res.status(200).send({ "msg": "Send for verification" })
        }
    } catch (err) {
        console.log(err);

    }
})

registerRouter.get("/verify", async (req, res) => {
    try {
        const token = req.query.token;
        const { name, email, password, section, course, rollno, school } = await PendingUserModel.findOne({ token })

        const user = await RegisterModel.findOne({ email })
        if (user) {
            await PendingUserModel.deleteOne({ token })
            res.status(409).send({ msg: "User already exists" })
        } else {
            await RegisterModel.create({
                name: name,
                email: email,
                password: password,
                school: school,
                course: course,
                section: section,
                rollno: rollno,
                handle:name
            });
            const user = await RegisterModel.findOne({ email });
            console.log(user)

            transporter.sendMail({
                to: email,
                from: process.env.mail_admin,
                subject: 'Welcome to Conference!',
                text: `Dear ${name},
            
Thank you for registering at Conference! We're thrilled to have you on board.

We're committed to providing you with the best experience possible.
If you have any questions, need help, want to report a bug, or just want to share your thoughts,
Please feel free to reply to this email. We're here to help!

Looking forward to seeing you on Conference.

Best,
Sachin
Founder and CEO`
            })

                .then(() => {
                    console.log("mail send successfully!")
                })
                .catch((err) => {
                    console.log("Error while sendig mail")
                    console.log(err)
                })
            await PendingUserModel.deleteOne({ token })
            res.status(201).send("verified, Account Created")
        }
    } catch (error) {
        console.log(error)
    }
})

registerRouter.get("/decline", async (req, res) => {

    try {
        const token = req.query.token;
        const user = await PendingUserModel.findOne({ token });
        console.log(user, "user")
        let { name, email, password, section, course, rollno, school } = user;

        transporter.sendMail({
            to: email,
            from: process.env.mail_admin,
            subject: 'Welcome to Conference!',
            text: `Dear ${name},

We regret to inform you that your account creation request at Conference has been cancelled. This decision was made due to some discrepancies in the details provided during registration.

We understand that this might be disappointing, but please rest assured that this measure is taken to ensure the security and authenticity of all our users.

If you believe this is a mistake or if you have any questions, please don’t hesitate to reply to this email. We’re here to assist you and we’ll do our best to resolve any issues you may have.

We appreciate your understanding and we’re looking forward to helping you complete your registration successfully.

Best Regards,
Sachin
Founder and CEO`
        })


        await PendingUserModel.deleteOne({ token })

        res.status(401).send("User Account Creation cancelled")
    } catch (error) {
        console.log(error)
    }
})

module.exports = registerRouter