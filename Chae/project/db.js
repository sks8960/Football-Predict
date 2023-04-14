var mysql = require('mysql');
var db = mysql.createConnection({
    host: 'localhost',
    user: '이름',
    password: '비번',
    database: '사용 데이터베이스'
});
db.connect();

module.exports = db;