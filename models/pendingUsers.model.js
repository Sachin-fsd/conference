const mongoose = require("mongoose")

const pendingusersScheme = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    school: { type: String },
    course: { type: String },
    section: { type: String },
    rollno: { type: String },
    token: { type: String, required: true },
    role: {type: String, enum:["student", "faculty"], require:true}

  },
  { timestamps: true }
)

const PendingUserModel = mongoose.model("pendingUser", pendingusersScheme)

module.exports = { PendingUserModel }