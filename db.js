var mysql = require('mysql');
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'shin9790',
    database: 'test'
});
db.connect();

module.exports = db;