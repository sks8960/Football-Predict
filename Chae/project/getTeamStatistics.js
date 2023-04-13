const http = require('http');
const mysql = require('mysql');
const db = require('./db.js');
const getTeamName = require('./selectname.js');

const server = http.createServer((req, res) => {
    const teamName = getTeamName();
    db.query(`SELECT team_id FROM teams WHERE name = '${teamName}'`, function (error, results, fields) {
        if (error) throw error;
        const teamId = results[0].team_id;
        res.write(`Team ID: ${teamId}`);
        res.end();
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});