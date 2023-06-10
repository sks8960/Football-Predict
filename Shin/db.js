const mysql = require('mysql'); // db연동 필요
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'cotmdgus1!',
  database: 'test'
});
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }
  console.log('Connected to database with thread ID: ' + connection.threadId);
});
module.exports = connection;
