const http = require("https");

const options = {
    "method": "GET",
    "hostname": "api-football-v1.p.rapidapi.com",
    "port": null,
    "path": "/v3/fixtures?season=2022&team=50&next=5",
    "headers": {
        "X-RapidAPI-Key": "96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332",
        "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
        "useQueryString": true
    }
};

const req = http.request(options, function (res) {
    const chunks = [];

    res.on("data", function (chunk) {
        chunks.push(chunk);
    });

    res.on("end", function () {
        const body = Buffer.concat(chunks);
        console.log(body.toString());
    });
});

req.end();