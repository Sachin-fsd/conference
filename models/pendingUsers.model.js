const mongoose = require("mongoose")

const pendingusersScheme = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    school: { type: String, required: true },
    course: { type: String, required: true },
    section: { type: String, required: true },
    rollno: { type: String, required: true },
    token: { type: String, required: true },
  },
  { timestamps: true }
)

const PendingUserModel = mongoose.model("pendingUser", pendingusersScheme)

module.exports = { PendingUserModel }