const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const db = require('./db.js');
const cors = require('cors');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); // cors 미들웨어를 적용합니다.

app.post('/sendDataToServer', (req, res) => {
  const selectedTeam = req.body.selectedTeam;
  console.log('selectedTeam:', selectedTeam);
  db.query(`SELECT team_id FROM teams WHERE team_name = '${selectedTeam}'`, function (error, results, fields) {
    if (error) {
      console.log(error);
      res.status(500).send('Internal server error');
      return;
    }
    const teamId = results[0].team_id;
    console.log(`Team ID: ${teamId}`);
    res.send(`Team ID: ${teamId}`);
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});