const express = require('express');
const ExcelJS = require('exceljs'); //엑셀 파일 열기위한거
const db = require('./db');
const app = express();
const port = 3000;
const url = require('url');

app.set('views', './views');
app.set('view engine', 'ejs');
//위 2개는 잘은 모름, gpt가 이렇게 해야 렌더링 할수 있다해서 함, 원래는 다른 방식으로 해서 잘 모름

// 메인 화면 시작 시
app.get('/', (req, res) => {
    const workbook = new ExcelJS.Workbook();
    workbook.xlsx.readFile('fixtures1.xlsx').then(() => {
        const worksheet = workbook.getWorksheet(1);
        const rows = [];
        worksheet.getRow(1);
        worksheet.eachRow((row) => {
            rows.push(row.values);
        })
        rows.forEach(item => item.splice(0, 1));    // 처음 객체 받아오면 empty 떠서 없애려고 넣음
        let obj = {};
        for (let i = 0; i < rows[0].length - 1; i++) {
            const key = rows[0][i];
            const values = [];
            for (let j = 1; j < rows.length; j++) {
                values.push(rows[j][i]);
            }
            obj[key] = values;
        }
        for (var a = 0; a < Object.keys(rows).length - 1; a++) {
            db.query(`INSERT ignore INTO test VALUES (?, ?, ?, ?, ?, ?);`, [obj['fixture.id'][a], obj['fixture.referee'][a], obj['fixture.periods.first'][a], obj['fixture.periods.second'][a], obj['fixture.venue.id'][a], obj['fixture.venue.city'][a]]);
        }                 //데이터베이스 넣는거
        // 데이터베이스에서 select문으로 꺼내온거 test에 들어감
        db.query(`select * from test`, (err, test) => {
            if (err) {
                throw err;
            }
            let abcd = [];
            abcd = JSON.parse(JSON.stringify(test));
            console.log(abcd);
            res.render('index', { abcd: abcd });
        });
    });
});

app.get('/search_process', (req, res) => {
    var _url = req.url;
    var queryData = url.parse(_url, true).query;
    db.query(`select * from test where referee=?`, [queryData.name], function (error2, topic) {
        if (error2) {
            throw error2;
        }
        res.render('index', { abcd: topic });
    })
}); //원하는 심판 

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
