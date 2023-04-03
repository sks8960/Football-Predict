const mysql = require('mysql');

// MySQL 데이터베이스 연결 설정
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'shin9790',
  database: 'db'
});

// 현재 시간 이전에 진행된 경기 중에서 최근 5개의 fixture값 가져오기
const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
const sql = `
  SELECT *
  FROM fixtures
  WHERE (home_team = 'Liverpool' OR away_team = 'Liverpool')
  AND fixture_date < '${now}'
  ORDER BY fixture_date DESC
  LIMIT 5
`;
connection.query(sql, (err, results) => {
  if (err) throw err;

  console.log(results);
});
module.exports = sql;
