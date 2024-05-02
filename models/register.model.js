const mongoose = require("mongoose")

const registerSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    dp: { type: String , default:"https://cdn-icons-png.flaticon.com/128/3177/3177440.png"},
    bio: { type: String, default: "I Love Conference💖" }
  },
  { timestamps: true }
)

const RegisterModel = mongoose.model("user", registerSchema)

module.exports = { RegisterModel }