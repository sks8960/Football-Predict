/*const test = require('./test3');
const axios = require("axios");

test.getFixtureIds((fixtureIds) => {
    const requests = fixtureIds.map(id => {
        const params = { fixture: id, team: '49' };
        return axios.request({ ...options, params });
    });

    Promise.all(requests)
        .then(responses => {
            console.log(responses.map(response => response.data.response[0].statistics));
        })
        .catch(error => {
            console.error(error);
        });
});*/
const axios = require('axios');
const test = require('./test3');
const options = {
    method: 'GET',
    url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures/statistics',
    headers: {
        'X-RapidAPI-Key': '96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332',
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
    }
};
async function getTeamFixtureStatistics(teamId) {
    const fixtureIds = await new Promise((resolve, reject) => {
        test.getFixtureIds((fixtureIds) => {
            resolve(fixtureIds);
        });
    });

    const requests = fixtureIds.map((id) => {
        const params = { fixture: id, team: teamId };
        return axios.request({ ...options, params });
    });

    const responses = await Promise.all(requests);
    const statistics = responses.map((response) => response.data.response[0].statistics);

    return statistics;
}

module.exports = {
    getTeamFixtureStatistics,
};