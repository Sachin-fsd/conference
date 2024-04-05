const mongoose = require("mongoose")

const registerSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    dp: { type: String },
    bio: { type: String, default: "The only limit to our realization of tomorrow will be our doubts of today. 📷✈️🏕️" }
  },
  { timestamps: true }
)

const RegisterModel = mongoose.model("user", registerSchema)

module.exports = { RegisterModel }
