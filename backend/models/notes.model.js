const mongoose = require("mongoose");

const noteSchema = mongoose.Schema({
    task:String,
    completed:Boolean,
    UserDetails:Object,
    CreatedAt:{type:Date, default:Date.now}
})

const NoteModel = mongoose.model("note",noteSchema);

module.exports = {NoteModel}