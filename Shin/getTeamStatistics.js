const express = require("express");
const app = express();
const db = require("./db.js");
const https = require("https");
const moment = require("moment");
const bodyParser = require("body-parser");

app.use(
  "/",
  express.static(__dirname + "/Shin", {
    setHeaders: function (res, path, stat) {
      if (path.endsWith(".js")) {
        res.setHeader("Content-Type", "text/javascript");
      } else if (path.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
    },
  })
);

app.get("/cal/epl", function (req, res) {
  res.sendFile(__dirname + "/calepl.html");
});

app.get("/cal/laliga", function (req, res) {
  res.sendFile(__dirname + "/callaliga.html");
});

app.get("/cal/ligue1", function (req, res) {
  res.sendFile(__dirname + "/calligue1.html");
});

app.get("/cal/seriea", function (req, res) {
  res.sendFile(__dirname + "/calseriea.html");
});

app.get("/cal/bundesliga", function (req, res) {
  res.sendFile(__dirname + "/calbundesliga.html");
});

app.get("/team", function (req, res) {
  res.sendFile(__dirname + "/team.html");
});

app.get("/cal/statistics", function (req, res) {
  res.sendFile(__dirname + "/calStatistics.html");
});

app.get("/SelectName.js", function (req, res) {
  res.sendFile(__dirname + "/SelectName.js");
});

// Body-parser 미들웨어 사용
app.use(bodyParser.json());

// fixtureId를 저장할 변수
let savedFixtureId = null;

// fixtureId 저장 엔드포인트
app.post("/save-fixture", (req, res) => {
  const { fixtureId } = req.body;
  savedFixtureId = fixtureId;
  res.sendStatus(200);
});

// fixtureId 가져오기 엔드포인트
app.get("/get-fixture", (req, res) => {
  res.json({ fixtureId: savedFixtureId });
});

// 특정 팀 정보를 조회하는 라우트
app.get("/teams/:teamName", (req, res) => {
  const teamName = req.params.teamName;
  db.query(
    `SELECT team_id FROM teams WHERE team_name = '${teamName}'`,
    function (error, results, fields) {
      if (error) {
        console.log(error);
        res.status(500).send("Internal server error");
        return;
      }
      const teamId = results[0].team_id;
      console.log(`Team ID: ${teamId}`);
      const options = {
        method: "GET",
        hostname: "api-football-v1.p.rapidapi.com",
        port: null,
        path: `/v3/fixtures?season=2023&team=${teamId}&last=6`,
        headers: {
          "x-rapidapi-key":
            "96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332",
          "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
          useQueryString: true,
        },
      };

      const req = https.request(options, function (response) {
        const chunks = [];

        response.on("data", function (chunk) {
          chunks.push(chunk);
        });

        response.on("end", function () {
          const body = Buffer.concat(chunks);
          const fixtures = JSON.parse(body.toString()).response;
          const fixtureIds = fixtures.map((fixture) => fixture.fixture.id);
          //console.log(fixtureIds);

          const options2 = {
            method: "GET",
            hostname: "api-football-v1.p.rapidapi.com",
            port: null,
            headers: {
              "x-rapidapi-key":
                "96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332",
              "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
              useQueryString: true,
            },
          };

          const statsPromises = fixtureIds.map((fixtureId) => {
            return new Promise((resolve, reject) => {
              options2.path = `/v3/fixtures/statistics?fixture=${fixtureId}`;

              const req2 = https.request(options2, function (response2) {
                const chunks2 = [];

                response2.on("data", function (chunk) {
                  chunks2.push(chunk);
                });

                response2.on("end", function () {
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
                  if (
                    item.hasOwnProperty("team") &&
                    item.hasOwnProperty("statistics")
                  ) {
                    const teamInfo = item.team;
                    const statistics = item.statistics;

                    const teamName = teamInfo.name; // 팀 이름 가져오기

                    console.log("Team Name:", teamName);
                    console.log("Statistics:", statistics);

                    // 값 중에서 null인 경우 0으로 바꾸고 % 문자가 있다면 제거
                    const processedStatistics = {};

                    statistics.forEach((stat) => {
                      if (
                        stat.hasOwnProperty("type") &&
                        stat.hasOwnProperty("value")
                      ) {
                        let processedValue = stat.value;

                        if (processedValue === null) {
                          processedValue = 0;
                        } else if (
                          typeof processedValue === "string" &&
                          processedValue.includes("%")
                        ) {
                          processedValue = parseFloat(
                            processedValue.replace("%", "")
                          );
                        }

                        processedStatistics[stat.type] = processedValue;
                      }
                    });

                    allStats.push({
                      teamName,
                      statistics: processedStatistics,
                      fixtureId,
                    }); // fixtureId 추가
                  } else {
                    console.log("Invalid data:", item);
                  }
                });
              });

              res.json({ stats: allStats });
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Internal server error");
            });
        });
      });

      req.end();
    }
  );
});

// 다음 달 구하기
function getNextMonth() {
  return moment().add(1, "month").format("YYYY-MM");
}

// 이전 달 구하기
function getPrevMonth() {
  return moment().subtract(1, "month").format("YYYY-MM");
}

app.get("/cal/cal/epl", (req, res) => {
  const options = {
    method: "GET",
    hostname: "api-football-v1.p.rapidapi.com",
    port: null,
    path: "/v3/fixtures?league=39&season=2023", // EPL의 리그 ID인 39로 수정
    headers: {
      "x-rapidapi-key": "96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332",
      "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
      useQueryString: true,
    },
  };

  const req3 = https.request(options, function (response) {
    const chunks = [];

    response.on("data", function (chunk) {
      chunks.push(chunk);
    });

    response.on("end", function () {
      const body = Buffer.concat(chunks);
      const fixtures = JSON.parse(body.toString()).response;

      const events = fixtures.map((fixture) => ({
        title: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
        start: moment.utc(fixture.fixture.date).format(),
        end: moment.utc(fixture.fixture.date).format(),
        fixtureId: fixture.fixture.id, // fixtureId 값을 추가합니다.
      }));

      res.json(events);
    });
  });

  req3.end();
});

app.get("/cal/stats/:fixtureId", (req, res) => {
  const fixtureId = req.params.fixtureId;
  console.log("Fixture ID:", fixtureId);

  const options = {
    method: "GET",
    hostname: "api-football-v1.p.rapidapi.com",
    port: null,
    path: `/v3/fixtures/statistics?fixture=${fixtureId}`,
    headers: {
      "x-rapidapi-key": "96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332",
      "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
      useQueryString: true,
    },
  };

  const req4 = https.request(options, function (response) {
    const chunks = [];

    response.on("data", function (chunk) {
      chunks.push(chunk);
    });

    response.on("end", function () {
      const body = Buffer.concat(chunks);
      const responseData = JSON.parse(body.toString()).response;

      const stats = {};

      responseData.forEach((item) => {
        const teamName = item.team.name;
        const statistics = item.statistics.map((statistic) => ({
          type: statistic.type,
          value: statistic.value !== null ? statistic.value : 0,
        }));

        if (!stats[teamName]) {
          stats[teamName] = {
            teamName,
            statistics,
          };
        } else {
          stats[teamName].statistics =
            stats[teamName].statistics.concat(statistics);
        }
      });

      const statsArray = Object.values(stats);

      console.log(statsArray); // 팀 이름과 통계 값만 출력

      // 통계 데이터를 클라이언트에 전송
      res.json(statsArray);
    });
  });

  req4.end();

  req4.on("error", function (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching statistics" });
  });
});

app.get("/cal/cal/laliga", function (req, res) {
  const options = {
    method: "GET",
    hostname: "api-football-v1.p.rapidapi.com",
    port: null,
    path: "/v3/fixtures?league=140&season=2023",
    headers: {
      "x-rapidapi-key": "96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332",
      "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
      useQueryString: true,
    },
  };

  const req4 = https.request(options, function (response) {
    const chunks = [];

    response.on("data", function (chunk) {
      chunks.push(chunk);
    });

    response.on("end", function () {
      const body = Buffer.concat(chunks);
      const fixtures = JSON.parse(body.toString()).response;

      const events = fixtures.map((fixture) => ({
        title: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
        start: moment.utc(fixture.fixture.date).format(),
        end: moment.utc(fixture.fixture.date).format(),
        fixtureId: fixture.fixture.id, // fixtureId 값을 추가합니다.
      }));

      res.json(events);
    });
  });

  req4.end();
});

app.get("/cal/cal/ligue1", (req, res) => {
  const options = {
    method: "GET",
    hostname: "api-football-v1.p.rapidapi.com",
    port: null,
    path: "/v3/fixtures?league=61&season=2023", // Ligue1의 리그 ID인 61로 수정
    headers: {
      "x-rapidapi-key": "96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332",
      "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
      useQueryString: true,
    },
  };

  const req5 = https.request(options, function (response) {
    const chunks = [];

    response.on("data", function (chunk) {
      chunks.push(chunk);
    });

    response.on("end", function () {
      const body = Buffer.concat(chunks);
      const fixtures = JSON.parse(body.toString()).response;

      const events = fixtures.map((fixture) => ({
        title: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
        start: moment.utc(fixture.fixture.date).format(),
        end: moment.utc(fixture.fixture.date).format(),
        fixtureId: fixture.fixture.id, // fixtureId 값을 추가합니다.
      }));

      res.json(events);
    });
  });

  req5.end();
});

app.get("/cal/cal/seriea", (req, res) => {
  const options = {
    method: "GET",
    hostname: "api-football-v1.p.rapidapi.com",
    port: null,
    path: "/v3/fixtures?league=135&season=2023", // SerieA의 리그 ID인 135로 수정
    headers: {
      "x-rapidapi-key": "96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332",
      "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
      useQueryString: true,
    },
  };

  const req6 = https.request(options, function (response) {
    const chunks = [];

    response.on("data", function (chunk) {
      chunks.push(chunk);
    });

    response.on("end", function () {
      const body = Buffer.concat(chunks);
      const fixtures = JSON.parse(body.toString()).response;

      const events = fixtures.map((fixture) => ({
        title: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
        start: moment.utc(fixture.fixture.date).format(),
        end: moment.utc(fixture.fixture.date).format(),
        fixtureId: fixture.fixture.id, // fixtureId 값을 추가합니다.
      }));

      res.json(events);
    });
  });

  req6.end();
});

app.get("/cal/cal/bundesliga", (req, res) => {
  const options = {
    method: "GET",
    hostname: "api-football-v1.p.rapidapi.com",
    port: null,
    path: "/v3/fixtures?league=78&season=2023", // Bundesliga의 리그 ID인 78로 수정
    headers: {
      "x-rapidapi-key": "96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332",
      "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
      useQueryString: true,
    },
  };

  const req6 = https.request(options, function (response) {
    const chunks = [];

    response.on("data", function (chunk) {
      chunks.push(chunk);
    });

    response.on("end", function () {
      const body = Buffer.concat(chunks);
      const fixtures = JSON.parse(body.toString()).response;

      const events = fixtures.map((fixture) => ({
        title: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
        start: moment.utc(fixture.fixture.date).format(),
        end: moment.utc(fixture.fixture.date).format(),
        fixtureId: fixture.fixture.id, // fixtureId 값을 추가합니다.
      }));

      res.json(events);
    });
  });

  req6.end();
});

app.listen(4000, () => {
  console.log("Server running on port 4000");
});
