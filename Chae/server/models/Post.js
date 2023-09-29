const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    username: String,
    title: String, // 제목
    content: String, // 내용
    time: { type: Date, default: Date.now }, // 현재 시간 값 (기본값으로 현재 시간을 사용)
    category: String, // 분류(리그)
    likes: [{
        // 추가된 부분: 사용자 이름
        userName: String,
    }],
    dislikes: [{
        // 추가된 부분: 사용자 이름
        userName: String,
    }],
    views: { type: Number, default: 0 }, // 조회수
    likeCount: { type: Number, default: 0 }, // 추천 개수
    dislikeCount: { type: Number, default: 0 }, // 비추천 개수
});

const Post = mongoose.model('Post', postSchema);

module.exports = { Post };
