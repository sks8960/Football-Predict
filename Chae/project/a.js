const http = require("https");

const options = {
    "method": "GET",
    "hostname": "api-football-v1.p.rapidapi.com",
    "port": null,
    "path": "/v3/predictions?fixture=1016057",
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
        console.log(JSON.parse(body).response[0]);
        /*console.log(JSON.parse(body).response[0].h2h);
        console.log(JSON.parse(body).response[0].comparison);*/
    });
});

req.end();