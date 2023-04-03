const fetch = require('node-fetch');
const mysql = require('mysql');

// MySQL 데이터베이스 연결 설정
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'shin9790',
    database: 'db'
  });
  
  // 'db' 데이터베이스와 연결
  connection.connect(err => {
    if (err) throw err;
    console.log('Connected to database!');
  });
  
// API 요청을 보낼 URL
const url = 'https://api-football-v1.p.rapidapi.com/v3/fixtures';

// API 요청에 필요한 파라미터
const params = {
  league: '39',
  season: '2022'
};

// API 요청에 필요한 헤더
const headers = {
  'X-RapidAPI-Key': '96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332',
  'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
};

// API 요청 보내기
fetch(`${url}?${new URLSearchParams(params)}`, { headers })
  .then(res => res.json())
  .then(data => {
    // fixtures 데이터 추출
    const fixtures = data.response;

    // fixtures 데이터를 MySQL 데이터베이스에 저장
    const sql = `INSERT INTO fixtures (league_id, fixture_id, fixture_date, home_team, away_team, home_team_id, away_team_id) VALUES ?`;
    const values = fixtures.map(fixture => [fixture.league.id, fixture.fixture.id, fixture.fixture.date, fixture.teams.home.name, fixture.teams.away.name, fixture.teams.home.id, fixture.teams.away.id]);
    connection.query(sql, [values], (err, result) => {
      if (err) throw err;
      console.log(`${result.affectedRows} rows inserted`);
});

    // MySQL 연결 종료
    //connection.end();
  })
  .catch(err => console.error(err));