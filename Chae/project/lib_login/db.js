var mysql = require('mysql');
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'cotmdgus1!',
    database: 'test'
});
db.connect();

module.exports = db;