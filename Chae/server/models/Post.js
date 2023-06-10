const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    content: String,
    title: String,
    time: Date,
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
});
const Post = mongoose.model('Post', postSchema);

module.exports = { Post };
