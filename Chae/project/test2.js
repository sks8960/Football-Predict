const axios = require("axios");

const options = {
    method: 'GET',
    url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
    params: { season: '2022', team: '49', last: "5" },
    headers: {
        'X-RapidAPI-Key': '96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332',
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
    }
};
function fixture() {
    var fixtures = [];
    axios.request(options).then(function (response) {
        for (a = 0; a < 5; a++) {
            fixtures[a] = response.data.response[a].fixture.id;
        }
    }).catch(function (error) {
        console.error(error);
    });
    return fixtures;
}
// 팀id로 fixture 구하기
