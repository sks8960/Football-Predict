const express = require('express');
const app = express();
const db = require('./db.js');
const https = require('https');

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
  db.query(`SELECT team_id FROM teams WHERE team_name = '${teamName}'`, function (
    error,
    results,
    fields
  ) {
    if (error) {
      console.log(error);
      res.status(500).send('Internal server error');
      return;
    }
    const teamId = results[0].team_id;
    console.log(`Team ID: ${teamId}`);
    const options = {
      method: 'GET',
      hostname: 'api-football-v1.p.rapidapi.com',
      port: null,
      path: `/v3/fixtures?season=2022&team=${teamId}&last=6`,
      headers: {
        'x-rapidapi-key': '96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332',
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
        useQueryString: true,
      },
    };

    const req = https.request(options, function (response) {
      const chunks = [];

      response.on('data', function (chunk) {
        chunks.push(chunk);
      });

      response.on('end', function () {
        const body = Buffer.concat(chunks);
        const fixtures = JSON.parse(body.toString()).response;
        const fixtureIds = fixtures.map((fixture) => fixture.fixture.id);
        //console.log(fixtureIds);

        const options2 = {
          method: 'GET',
          hostname: 'api-football-v1.p.rapidapi.com',
          port: null,
          headers: {
            'x-rapidapi-key': '96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332',
            'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
            useQueryString: true,
          },
        };

        const statsPromises = fixtureIds.map((fixtureId) => {
          return new Promise((resolve, reject) => {
            options2.path = `/v3/fixtures/statistics?fixture=${fixtureId}`;

            const req2 = https.request(options2, function (response2) {
              const chunks2 = [];

              response2.on('data', function (chunk) {
                chunks2.push(chunk);
              });

              response2.on('end', function () {
                const body2 = Buffer.concat(chunks2);
                const stats = JSON.parse(body2.toString()).response;
                resolve(stats);
                
                
              });
            });

            req2.end();
          });
        });

        Promise.all(statsPromises)
  .then((statsArray) => {
    const allStats = [];

    statsArray.forEach((stats, index) => {
      const fixtureId = fixtureIds[index]; // fixtureId 추출

      stats.forEach((item) => {
        if (item.hasOwnProperty('team') && item.hasOwnProperty('statistics')) {
          const teamInfo = item.team;
          const statistics = item.statistics;

      
                const teamName = teamInfo.name; // 팀 이름 가져오기
      
                console.log('Team Name:', teamName);
                console.log('Statistics:', statistics);
      
                // 값 중에서 null인 경우 0으로 바꾸고 % 문자가 있다면 제거
                const processedStatistics = {};
      
                statistics.forEach((stat) => {
                  if (stat.hasOwnProperty('type') && stat.hasOwnProperty('value')) {
                    let processedValue = stat.value;
      
                    if (processedValue === null) {
                      processedValue = 0;
                    } else if (typeof processedValue === 'string' && processedValue.includes('%')) {
                      processedValue = parseFloat(processedValue.replace('%', ''));
                    }
      
                    processedStatistics[stat.type] = processedValue;
                  }
                });
      
                allStats.push({ teamName, statistics: processedStatistics, fixtureId }); // fixtureId 추가
        } else {
          console.log('Invalid data:', item);
        }
      });
    });

    res.json({ stats: allStats });
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Internal server error');
  });
      });
    });

    req.end();
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});