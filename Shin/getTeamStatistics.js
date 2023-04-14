const express = require('express');
const app = express();
const db = require('./db.js');

app.use('/', express.static(__dirname + '/Shin', { 
  setHeaders: function (res, path, stat) {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'text/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/team.html');
});

app.get('/SelectName.js', function (req, res) {
  res.sendFile(__dirname + '/SelectName.js');
});

// 특정 팀 정보를 조회하는 라우트
app.get('/teams/:teamName', (req, res) => {
  const teamName = req.params.teamName;
  db.query(`SELECT team_id FROM teams WHERE team_name = '${teamName}'`, function (error, results, fields) {
    if (error) {
      console.log(error);
      res.status(500).send('Internal server error');
      return;
    }
    const teamId = results[0].team_id;
    console.log(`Team ID: ${teamId}`);
    res.json({ teamId }); // JSON 형태로 데이터를 전송합니다.
  });
});


app.listen(3000, () => {
  console.log('Server running on port 3000');
});