const http = require("https");
const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "shin9790",
  database: "db",
});
//epl만 출력
const options = {
  method: "GET",
  hostname: "api-football-v1.p.rapidapi.com",
  port: null,
  path: "/v3/teams?league=39&season=2022",
  headers: {
    "X-RapidAPI-Key": "96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332",
    "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
    useQueryString: true,
  },
};

const req = http.request(options, function (res) {
  const chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    const body = Buffer.concat(chunks);
    const parse = JSON.parse(body);
    console.log("Number of Teams: ", Object.values(parse.response).length);

    parse.response.forEach((element) => {
      const teamId = element.team.id;
      const teamName = element.team.name;

      // Insert teamId and teamName into MySQL
      const insertQuery = `INSERT INTO teams (team_id, team_name) VALUES (${teamId}, "${teamName}")`;
      connection.query(insertQuery, (err, result) => {
        if (err) throw err;
        console.log(`Inserted: ${teamId}, ${teamName}`);
      });
    });
    connection.end();
    console.log("Connection Closed");
  });
});

req.end();
