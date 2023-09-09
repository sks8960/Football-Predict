const http = require('https');
const express = require("express");
const app = express();

let fixtureId = 1035080;

const options = {
	method: 'GET',
	hostname: 'api-football-v1.p.rapidapi.com',
	port: null,
	path: `/v3/predictions?fixture=${fixtureId}`,
	headers: {
		'X-RapidAPI-Key': '96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332',
		'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
	}
};

const req = http.request(options, function (res) {
	const chunks = [];

	res.on('data', function (chunk) {
		chunks.push(chunk);
	});

	res.on('end', function () {
		const body = Buffer.concat(chunks);
		const responseData = JSON.parse(body.toString());
  
		// 'predictions' 객체에 접근하여 클라이언트로 응답을 보냅니다.
		if (responseData) {
		  
		  console.log(responseData);
		} else {
		  res.status(500).json({ error: "No predictions found" });
		}
	  });
	});

req.end();