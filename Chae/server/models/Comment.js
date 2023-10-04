const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    text: String,
    // 추가 필드를 여기에 정의할 수 있습니다.
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
    text: String,
    author: String, // 댓글 작성자의 이름 필드 추가
    // 추가 필드를 여기에 정의할 수 있습니다.
    replies: [replySchema], // 대댓글을 저장하기 위한 배열
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = { Comment };
