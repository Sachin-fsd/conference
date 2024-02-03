const mongoose = require("mongoose");

const otpSchema = mongoose.Schema({
    email:String,
    otp:Number,
    CreatedAt:{type:Date, default:Date.now()}
})

const OtpModel = mongoose.model("otp",otpSchema);

module.exports = {OtpModel}