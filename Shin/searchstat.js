const sql = require('./search.js');

const axios = require('axios');
const mysql = require('mysql');

// MySQL 데이터베이스 연결 설정
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'shin9790',
  database: 'db'
});

// api-football API 키 설정
const API_KEY = '96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332';

connection.query(sql, async (err, results) => {
  if (err) throw err;

  // 각 fixture_id에 대한 통계 API 요청 보내기
  const promises = results.map(async (row) => {
    const fixtureId = row.fixture_id;
    const url = `https://api-football.com/v3/fixtures/statistics?fixture=${fixtureId}`;
    const config = {
      headers: {
        'X-RapidAPI-Key': '96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332',
      },
    };
    const response = await axios.get(url, config);
    return response.data.response;
  });

  // 모든 통계 API 요청이 완료될 때까지 기다린 후 결과 출력
  Promise.all(promises).then((stats) => {
    console.log(stats);
  });
});
