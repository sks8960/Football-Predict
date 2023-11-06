const http = require("https");
const mysql = require("mysql");

//epl : 39, La liga : 140, Bundesliga : 78, Serie A : 135, Ligue 1 : 61
const options = {
  method: "GET",
  hostname: "api-football-v1.p.rapidapi.com",
  port: null,
  path: "/v3/teams?league=61&season=2023",
  headers: {
    "X-RapidAPI-Key": "96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332",
    "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
    useQueryString: true,
  },
};

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "shin9790",
  database: "db",
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("Connected to MySQL database!");
});

const req = http.request(options, function (res) {
  const chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    const body = Buffer.concat(chunks);
    const parse = JSON.parse(body);
    console.log(Object.values(parse.response).length);
    parse.response.forEach((element) => {
      const team_id = element.team.id;
      const team_name = element.team.name;
      const league_id = 61;
      const sql = `INSERT INTO teams (team_id, team_name, league_id) VALUES (${team_id}, '${team_name}', '${league_id}')`;
      connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log(`Team ${team_name}`);
        console.log(`ID ${team_id}`);
        console.log(`ID ${league_id}`);
      });
    });
    connection.end();
    console.log("Disconnected database!");
  });
});

req.end();
