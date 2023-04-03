const test = require('./test.js');

const axios = require("axios");

var test1 = test();
const options = {
  method: 'GET',
  url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures/statistics',
  params: {fixture: `${}`, team: '49'},
  headers: {
    'X-RapidAPI-Key': '96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332',
    'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
  }
};


axios.request(options).then(function (response) {
	console.log(response.data);
}).catch(function (error) {
	console.error(error);
});

// fixture와 팀 id로 통계 가져오기