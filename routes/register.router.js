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
    try {
        res.render("register", {})
    } catch (error) {
        console.log(error)
    }
})

registerRouter.post("/", upload.single("idcard"), async (req, res) => {
    try {
        const { name, email, password, section, course, rollno, school, role } = req.body;
        const existingUser = await Promise.all([
            RegisterModel.findOne({ email }),
            PendingUserModel.findOne({ email })
        ]);

        if (existingUser.some(user => user)) {
            return res.status(400).json({ msg: "User already exists." });
        }

        if (!password) {
            return res.status(400).json({ msg: "Password is required." });
        }

        console.log(req.file, "req.file");
        const token = crypto.randomBytes(16).toString('hex');
        const hashedPassword = await bcrypt.hash(password, 10);

        const data = role === "student"
            ? { name, email, password: hashedPassword, section, course, rollno, school, token, role }
            : { name, email, password: hashedPassword, token, role };

        await PendingUserModel.create(data);

        const commonFields = `
            <p>Name: ${name}</p>
            <p>Email: ${email}</p>
            <p>Role: ${role}</p>
        `;

        const studentFields = `
            <p>School: ${school}</p>
            <p>Course: ${course}</p>
            <p>Section: ${section}</p>
            <p>Roll No: ${rollno}</p>
        `;

        const mail_html = `
            <p>New ${role} registration:</p>
            ${commonFields}
            ${role === "student" ? studentFields : ""}
            <button><a href="https://conference-pkoe.onrender.com/register/verify?token=${encodeURIComponent(token)}">Click here to verify</a></button>
            <br/>
            <button><a href="https://conference-pkoe.onrender.com/register/decline?token=${encodeURIComponent(token)}">Click here to decline</a></button>
        `;

        const mailOptions = {
            from: process.env.mail_admin,
            to: process.env.mail_admin,
            subject: 'New Registration',
            text: `New ${role} registration: \nName: ${name} \nEmail: ${email} \nRole: ${role}`,
            html: mail_html,
            attachments: req.file ? [{ filename: name, content: req.file.buffer }] : []
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('Email sent successfully');
        } catch (emailError) {
            console.error('Error sending email:', emailError);
            return res.status(500).json({ msg: "Email sending failed", ok: false });
        }

        res.status(200).json({ msg: "Sent for verification", ok: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Something went wrong", ok: false });
    }
});

registerRouter.get("/verify", async (req, res) => {
    try {
        const { token } = req.query;
        console.log("Received verification request with token:", token);

        // Check if the user is in PendingUserModel
        const pending_user = await PendingUserModel.findOne({ token });
        if (!pending_user) {
            return res.status(400).send("Invalid or expired verification token.");
        }

        const { name, email, password, role } = pending_user;

        // Check if the user already exists in RegisterModel
        const existingUser = await RegisterModel.findOne({ email });
        if (existingUser) {
            await PendingUserModel.deleteOne({ token });
            return res.status(409).json({ msg: "User already exists" });
        }

        // Generate a unique handle
        const handle_token = crypto.randomBytes(2).toString('hex');
        const newUser = {
            name,
            email,
            password,
            handle: `${name}${handle_token}`,
            role
        };

        // If the role is "student", include additional fields
        if (role === "student") {
            newUser.school = pending_user.school;
            newUser.course = pending_user.course;
            newUser.section = pending_user.section;
            newUser.rollno = pending_user.rollno;
        }

        // Save user and remove from pending
        await RegisterModel.create(newUser);
        await PendingUserModel.deleteOne({ token });

        // Send welcome email
        const mailOptions = {
            to: email,
            from: process.env.mail_admin,
            subject: 'Welcome to UniVerse!',
            text: `Dear ${name},

Thank you for registering at UniVerse! We're thrilled to have you on board.

We're committed to providing you with the best experience possible.
If you have any questions, need help, want to report a bug, or just want to share your thoughts,
please feel free to reply to this email. We're here to help!

Looking forward to seeing you on UniVerse.

Best,
Sachin
Founder and CEO`
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log("Welcome email sent successfully!");
        } catch (emailError) {
            console.error("Error while sending mail:", emailError);
        }

        return res.status(201).json({ msg: "Verified, account created successfully!" });

    } catch (error) {
        console.error("Error in verification process:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

registerRouter.get("/decline", async (req, res) => {
    try {
        const { token } = req.query;

        // Find the user in PendingUserModel
        const user = await PendingUserModel.findOne({ token });
        if (!user) {
            return res.status(400).json({ msg: "User already removed or does not exist." });
        }

        console.log("Declining user:", user);

        const { name, email } = user;

        // Send rejection email
        const mailOptions = {
            to: email,
            from: process.env.mail_admin,
            subject: 'Registration Declined - UniVerse',
            text: `Dear ${name},

We regret to inform you that your account creation request at UniVerse has been declined. This decision was made due to discrepancies in the details provided during registration.

If you believe this is a mistake or have any questions, please reply to this email. We’re here to assist you and will do our best to resolve any issues.

We appreciate your understanding and look forward to assisting you in the future.

Best Regards,  
Sachin  
Founder and CEO`
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Rejection email sent to ${email}`);
        } catch (emailError) {
            console.error("Error sending rejection email:", emailError);
        }

        // Remove user from pending list
        await PendingUserModel.deleteOne({ token });

        return res.status(200).json({ msg: "User account creation declined successfully." });

    } catch (error) {
        console.error("Error in decline process:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

module.exports = registerRouter