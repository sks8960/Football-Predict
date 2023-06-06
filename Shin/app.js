const express = require('express');
const app = express();
const db = require('./db.js');
const https = require('https');

// 기존 코드

// 정적 파일 경로 설정
app.use('/', express.static(__dirname + '/Shin'));

// 기존 코드

app.listen(3000, () => {
  console.log('Server running on port 3000');
});