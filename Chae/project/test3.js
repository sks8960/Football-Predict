const https = require("https");

function getFixtureIds(callback) {
    const options = {
        method: "GET",
        hostname: "api-football-v1.p.rapidapi.com",
        port: null,
        path: "/v3/fixtures?season=2022&team=49&last=5",
        headers: {
            "X-RapidAPI-Key": "96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332",
            "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
            useQueryString: true,
        },
    };

    const req = https.request(options, function (res) {
        const chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", () => {
            const body = Buffer.concat(chunks);
            const data = JSON.parse(body.toString());
            const fixtureIds = [];
            for (let i = 0; i < 5; i++) {
                fixtureIds.push(data.response[i].fixture.id);
            }
            callback(fixtureIds);
        });
    });

    req.end();
}

module.exports = {
    getFixtureIds,
};