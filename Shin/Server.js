const http = require('http');
const mysql = require('mysql');
const db = require('./db.js');
const getTeamName = require('./SelectName.js');

const server = http.createServer((req, res) => {
  db.query(`SELECT team_id FROM teams WHERE name = '${getTeamName()}'`, function (error, results, fields) {
    if (error) throw error;
    const teamId = results[0].team_id;
    res.write(`Team ID: ${teamId}`);
    res.end();
  });
});