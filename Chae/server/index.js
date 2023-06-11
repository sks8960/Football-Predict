const express = require('express');
const app = express();
const port = 5000;
const https = require('https');
const http = require('http');
const axios = require('axios');
const db = require('./db.js');
const moment = require('moment');
const cors = require('cors');
const { User } = require('./models/User');
const { Post } = require('./models/Post');
const { Room } = require('./models/Room.js');
const bodyParser = require('body-parser');
const coockieParser = require('cookie-parser');
const { auth } = require('./middleware/auth');
const socket = require("socket.io");
const { Server } = require('socket.io');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(coockieParser());
const config = require("./config/key.js");
const mongoose = require('mongoose');
mongoose.connect(config.mongoURI)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));
app.use('/', express.static(__dirname + '/Shin', {
    setHeaders: function (res, path, stat) {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'text/javascript');
        } else if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

const server = http.createServer(app);
// const io = socket(server);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})


app.get('/', (req, res) => res.send("hello World!!!"))


app.post('/api/users/register', (req, res) => {
    //회원 가입 할 때 필요한 정보들을 clinet에서 가져오면
    //그것들을 데이터 베이스에 넣어준다.
    const user = new User(req.body);

    const result = user.save().then(() => {
        console.log("성공");
        res.status(200).json({
            success: true
        })
    }).catch((err) => {
        console.log(err);
        res.json({ success: false, err })
    })
})

//요청된 이메일을 데이터베이스에서 있는지 찾는다.
app.post('/api/users/login', (req, res) => {
    // 요청된 이메일을 데이터베이스 찾기
    User.findOne({ email: req.body.email })
        .then(docs => {
            if (!docs) {
                return res.json({
                    loginSuccess: false,
                    messsage: "제공된 이메일에 해당하는 유저가 없습니다."
                })
            }
            docs.comparePassword(req.body.password, (err, isMatch) => {
                if (!isMatch) return res.json({ loginSuccess: false, messsage: "비밀번호가 틀렸습니다." })
                // Password가 일치하다면 토큰 생성
                docs.generateToken((err, user) => {
                    if (err) return res.status(400).send(err);
                    // 토큰을 저장
                    res.cookie("x_auth", user.token)
                        .status(200)
                        .json({ loginSuccess: true, userId: user._id })
                })
            })
        })
        .catch((err) => {
            return res.status(400).send(err);
        })
})


//role 1 어드인 role 2 특정 부서 어드민
// role 0 -> 일반유저 role 0이 아니면 관리자

app.get('/api/users/auth', auth, (req, res) => {

    //여기 까지 미들웨어를 통과해 왔다는 얘기는 Authentication 이 True 라는 말.
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

app.get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id }, { token: "" })
        .then(user => {
            console.log(user);
            return res.status(200).send({
                success: true
            })
        })
        .catch(err => {
            return res.json({ success: false, err })
        })
})
app.get('/api/posts', (req, res) => {
    Post.find()
        .then(posts => {
            res.json(posts);
        })
        .catch(error => {
            console.error('Error fetching posts:', error);
            res.status(500).json({ error: 'Failed to fetch posts' });
        });
});

app.post('/api/posts', (req, res) => {
    const { title, content } = req.body;
    const currentTime = new Date().toISOString();

    const newPost = new Post({ title, content, time: currentTime });
    newPost.save()
        .then(savedPost => {
            res.status(201).json({ _id: savedPost._id });

        })
        .catch(error => {
            console.error('Error creating post:', error);
            res.status(500).json({ error: 'Failed to create post' });
        });
});

app.get('/api/posts/:id', (req, res) => {
    const postId = req.params.id;

    // postId를 사용하여 게시물 조회
    Post.findById(postId)
        .then(post => {
            if (!post) {
                return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
            }
            //console.log(post);
            res.json(post);
        })
        .catch(error => {
            console.error('Error fetching post:', error);
            res.status(500).json({ error: '게시물 조회 중 오류가 발생했습니다.' });
        });
});

app.get('/api/posts/:id', (req, res) => {
    const postId = parseInt(req.params.id);
    const post = posts.find(p => p.id === postId);
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }
    return res.json(post);
});

app.post('/api/posts/:id/like', (req, res) => {
    const postId = req.params.id;

    Post.findByIdAndUpdate(postId, { $inc: { likes: 1 } }, { new: true })
        .then((post) => {
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }
            res.json({ likes: post.likes });
        })
        .catch((error) => {
            console.error('Error liking post:', error);
            res.status(500).send('Internal Server Error');
        });
});

// Dislike a post
app.post('/api/posts/:id/dislike', (req, res) => {
    const postId = req.params.id;

    Post.findByIdAndUpdate(postId, { $inc: { dislikes: 1 } }, { new: true })
        .then((post) => {
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }
            res.json({ dislikes: post.dislikes });
        })
        .catch((error) => {
            console.error('Error disliking post:', error);
            res.status(500).send('Internal Server Error');
        });
});
// ================================================

app.get('/cal/cal/epl', (req, res) => {
    const options = {
        method: 'GET',
        url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
        params: {
            league: 39,
            season: 2022,
        },
        headers: {
            'x-rapidapi-key': '96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332',
            'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
            useQueryString: true,
        },
    };

    axios
        .request(options)
        .then((response) => {
            const fixtures = response.data.response;

            const events = fixtures.map((fixture) => ({
                title: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
                start: moment.utc(fixture.fixture.date).format(),
                end: moment.utc(fixture.fixture.date).format(),
                fixtureId: fixture.fixture.id,
            }));

            res.json(events);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch fixtures' });
        });
});
app.get('/cal/cal/laliga', (req, res) => {
    const options = {
        method: 'GET',
        url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
        params: {
            league: 140,
            season: 2022,
        },
        headers: {
            'x-rapidapi-key': '96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332',
            'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
            useQueryString: true,
        },
    };

    axios
        .request(options)
        .then((response) => {
            const fixtures = response.data.response;

            const events = fixtures.map((fixture) => ({
                title: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
                start: moment.utc(fixture.fixture.date).format(),
                end: moment.utc(fixture.fixture.date).format(),
                fixtureId: fixture.fixture.id,
            }));

            res.json(events);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch fixtures' });
        });
});
app.get('/cal/cal/ligue1', (req, res) => {
    const options = {
        method: 'GET',
        url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
        params: {
            league: 61,
            season: 2022,
        },
        headers: {
            'x-rapidapi-key': '96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332',
            'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
            useQueryString: true,
        },
    };

    axios
        .request(options)
        .then((response) => {
            const fixtures = response.data.response;

            const events = fixtures.map((fixture) => ({
                title: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
                start: moment.utc(fixture.fixture.date).format(),
                end: moment.utc(fixture.fixture.date).format(),
                fixtureId: fixture.fixture.id,
            }));

            res.json(events);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch fixtures' });
        });
});
app.get('/cal/cal/seriea', (req, res) => {
    const options = {
        method: 'GET',
        url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
        params: {
            league: 135,
            season: 2022,
        },
        headers: {
            'x-rapidapi-key': '96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332',
            'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
            useQueryString: true,
        },
    };

    axios
        .request(options)
        .then((response) => {
            const fixtures = response.data.response;

            const events = fixtures.map((fixture) => ({
                title: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
                start: moment.utc(fixture.fixture.date).format(),
                end: moment.utc(fixture.fixture.date).format(),
                fixtureId: fixture.fixture.id,
            }));

            res.json(events);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch fixtures' });
        });
});
app.get('/cal/cal/bundesliga', (req, res) => {
    const options = {
        method: 'GET',
        url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
        params: {
            league: 78,
            season: 2022,
        },
        headers: {
            'x-rapidapi-key': '96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332',
            'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
            useQueryString: true,
        },
    };

    axios
        .request(options)
        .then((response) => {
            const fixtures = response.data.response;

            const events = fixtures.map((fixture) => ({
                title: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
                start: moment.utc(fixture.fixture.date).format(),
                end: moment.utc(fixture.fixture.date).format(),
                fixtureId: fixture.fixture.id,
            }));

            res.json(events);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch fixtures' });
        });
});
app.get('/cal/statistics', function (req, res) {
    res.sendFile(__dirname + '/calStatistics.html');
});
let savedFixtureId = null;

app.post('/save-fixture', (req, res) => {
    const { fixtureId } = req.body;
    savedFixtureId = fixtureId;
    res.sendStatus(200);
});


app.get('/get-fixture', (req, res) => {
    res.json({ fixtureId: savedFixtureId });
});

app.get('/cal/stats/:fixtureId', (req, res) => {
    const fixtureId = req.params.fixtureId;
    console.log('Fixture ID:', fixtureId);

    const options = {
        method: 'GET',
        hostname: 'api-football-v1.p.rapidapi.com',
        port: null,
        path: `/v3/fixtures/statistics?fixture=${fixtureId}`,
        headers: {
            'x-rapidapi-key': '96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332',
            'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
            useQueryString: true,
        },
    };

    const req4 = https.request(options, function (response) {
        const chunks = [];

        response.on('data', function (chunk) {
            chunks.push(chunk);
        });

        response.on('end', function () {
            const body = Buffer.concat(chunks);
            const responseData = JSON.parse(body.toString()).response;

            const stats = {};

            responseData.forEach(item => {
                const teamName = item.team.name;
                const statistics = item.statistics.map(statistic => ({
                    type: statistic.type,
                    value: statistic.value !== null ? statistic.value : 0,
                }));

                if (!stats[teamName]) {
                    stats[teamName] = {
                        teamName,
                        statistics,
                    };
                } else {
                    stats[teamName].statistics = stats[teamName].statistics.concat(statistics);
                }
            });

            const statsArray = Object.values(stats);

            console.log(statsArray); // 팀 이름과 통계 값만 출력

            // 통계 데이터를 클라이언트에 전송
            res.json(statsArray);
        });
    });

    req4.end();

    req4.on('error', function (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while fetching statistics' });
    });
});

app.get('/teams/:teamName', (req, res) => {
    const teamName = req.params.teamName;
    db.query(`SELECT team_id FROM teams WHERE team_name = '${teamName}'`, function (
        error,
        results,
        fields
    ) {
        if (error) {
            console.log(error);
            res.status(500).send('Internal server error');
            return;
        }
        const teamId = results[0].team_id;
        console.log(`Team ID: ${teamId}`);
        const options = {
            method: 'GET',
            hostname: 'api-football-v1.p.rapidapi.com',
            port: null,
            path: `/v3/fixtures?season=2022&team=${teamId}&last=6`,
            headers: {
                'x-rapidapi-key': '96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332',
                'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
                useQueryString: true,
            },
        };

        const req = https.request(options, function (response) {
            const chunks = [];

            response.on('data', function (chunk) {
                chunks.push(chunk);
            });

            response.on('end', function () {
                const body = Buffer.concat(chunks);
                const fixtures = JSON.parse(body.toString()).response;
                const fixtureIds = fixtures.map((fixture) => fixture.fixture.id);
                //console.log(fixtureIds);

                const options2 = {
                    method: 'GET',
                    hostname: 'api-football-v1.p.rapidapi.com',
                    port: null,
                    headers: {
                        'x-rapidapi-key': '96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332',
                        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
                        useQueryString: true,
                    },
                };

                const statsPromises = fixtureIds.map((fixtureId) => {
                    return new Promise((resolve, reject) => {
                        options2.path = `/v3/fixtures/statistics?fixture=${fixtureId}`;

                        const req2 = https.request(options2, function (response2) {
                            const chunks2 = [];

                            response2.on('data', function (chunk) {
                                chunks2.push(chunk);
                            });

                            response2.on('end', function () {
                                const body2 = Buffer.concat(chunks2);
                                const stats = JSON.parse(body2.toString()).response;
                                resolve(stats);
                            });
                        });

                        req2.end();
                    });
                });

                Promise.all(statsPromises)
                    .then((statsArray) => {
                        const allStats = [];

                        statsArray.forEach((stats, index) => {
                            const fixtureId = fixtureIds[index]; // fixtureId 추출

                            stats.forEach((item) => {
                                if (item.hasOwnProperty('team') && item.hasOwnProperty('statistics')) {
                                    const teamInfo = item.team;
                                    const statistics = item.statistics;

                                    const teamName = teamInfo.name; // 팀 이름 가져오기

                                    console.log('Team Name:', teamName);
                                    console.log('Statistics:', statistics);

                                    // 값 중에서 null인 경우 0으로 바꾸고 % 문자가 있다면 제거
                                    const processedStatistics = {};

                                    statistics.forEach((stat) => {
                                        if (stat.hasOwnProperty('type') && stat.hasOwnProperty('value')) {
                                            let processedValue = stat.value;

                                            if (processedValue === null) {
                                                processedValue = 0;
                                            } else if (typeof processedValue === 'string' && processedValue.includes('%')) {
                                                processedValue = parseFloat(processedValue.replace('%', ''));
                                            }

                                            processedStatistics[stat.type] = processedValue;
                                        }
                                    });

                                    allStats.push({ teamName, statistics: processedStatistics, fixtureId }); // fixtureId 추가
                                } else {
                                    console.log('Invalid data:', item);
                                }
                            });
                        });

                        res.json({ stats: allStats });
                    })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Internal server error');
                    });
            });
        });

        req.end();
    });
});

// =====================================================

// let roomList = [];

// // 방 생성 및 방 목록 가져오기
// app.post('/api/chat/createRoom', (req, res) => {
//     const { roomName } = req.body;

//     // 방 이름 중복 체크
//     const existingRoom = roomList.find((room) => room.name === roomName);
//     if (existingRoom) {
//         return res.json({ success: false, message: '이미 존재하는 방 이름입니다.' });
//     }

//     // 새로운 방 객체 생성
//     const newRoom = {
//         id: Date.now().toString(),
//         name: roomName,
//         users: [],
//     };

//     // 방 목록에 추가
//     roomList.push(newRoom);

//     // 클라이언트에게 방 목록 전달
//     io.emit('roomListUpdated', { roomList });

//     return res.json({ success: true, message: '방 생성 성공', roomList });
// });

// app.get('/api/chat/rooms', (req, res) => {
//     const roomListWithUsersCount = roomList.map((room) => ({
//         ...room,
//         usersCount: room.users.length,
//     }));

//     return res.json({ roomList: roomListWithUsersCount });
// });

// // Socket.IO 연결 및 이벤트 처리
// io.on('connection', (socket) => {
//     console.log('새로운 사용자가 연결되었습니다.');

//     // 클라이언트에게 초기 방 목록 전송
//     socket.emit('roomListUpdated', { roomList });

//     // 사용자가 방에 입장하는 이벤트 처리
//     socket.on('enterRoom', (roomId, userName) => {
//         // 방 ID에 해당하는 방 찾기
//         const room = roomList.find((room) => room.id === roomId);

//         if (room) {
//             // 사용자 정보 저장
//             room.users.push(userName);

//             // 클라이언트에게 방 입장 완료 이벤트 전송
//             socket.emit('enterRoomSuccess', room);
//             socket.broadcast.emit('userEnteredRoom', room);

//             // 방 목록 업데이트
//             const roomListWithUpdatedUsersCount = roomList.map((room) => ({
//                 ...room,
//                 usersCount: room.users.length,
//             }));
//             io.emit('roomListUpdated', { roomList: roomListWithUpdatedUsersCount });
//         } else {
//             // 방이 존재하지 않을 경우 에러 이벤트 전송
//             socket.emit('enterRoomError', '방이 존재하지 않습니다.');
//         }
//     });

//     // 사용자가 방에서 나가는 이벤트 처리
//     socket.on('leaveRoom', (roomId, userName) => {
//         // 방 ID에 해당하는 방 찾기
//         const room = roomList.find((room) => room.id === roomId);

//         if (room) {
//             // 사용자 정보 제거
//             const userIndex = room.users.indexOf(userName);
//             if (userIndex !== -1) {
//                 room.users.splice(userIndex, 1);

//                 // 클라이언트에게 사용자가 방에서 나갔음을 알림
//                 socket.broadcast.emit('userLeftRoom', room);

//                 // 방 목록 업데이트
//                 const roomListWithUpdatedUsersCount = roomList.map((room) => ({
//                     ...room,
//                     usersCount: room.users.length,
//                 }));
//                 io.emit('roomListUpdated', { roomList: roomListWithUpdatedUsersCount });
//             }
//         }
//     });

//     // 연결 종료 시 처리
//     socket.on('disconnect', () => {
//         console.log('사용자 연결이 종료되었습니다.');
//     });
// });
const rooms = {};
var count = 0;

const publicRooms = () => {
    const {
        sockets: {
            adapter: { sids, rooms },
        },
    } = io;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    return publicRooms;
};

io.on('connection', (socket) => {
    socket["nickname"] = `익명(${count})`;
    count++;

    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    });

    socket.on('enter_room', (roomName, done) => {
        socket.join(roomName);
        socket.room = roomName;
        if (!rooms[roomName]) {
            rooms[roomName] = { participants: 1 };
        } else {
            rooms[roomName].participants += 1;
        }
        io.to(roomName).emit('welcome', socket.nickname, rooms[roomName].participants);
        io.sockets.emit('room_change', publicRooms());
        done();
    });

    socket.on('leave_room', (roomName, done) => {
        if (rooms[roomName]) {
            rooms[roomName].participants -= 1;
            if (rooms[roomName].participants === 0) {
                delete rooms[roomName];
            }
        }
        socket.leave(roomName);
        io.to(roomName).emit('bye', socket.nickname, rooms[roomName]?.participants);
        io.sockets.emit('room_change', publicRooms());
        done();
    });

    socket.on('new_message', (message, roomName, done) => {
        io.to(roomName).emit('new_message', `${socket.nickname}: ${message}`);
        done();
    });

    socket.on('nickname', (nickname) => {
        socket["nickname"] = nickname;
    });

    socket.on('disconnect', () => {
        const roomName = socket.room;
        if (roomName && rooms[roomName]) {
            rooms[roomName].participants -= 1;
            if (rooms[roomName].participants === 0) {
                delete rooms[roomName];
            }
            io.to(roomName).emit('bye', socket.nickname, rooms[roomName]?.participants);
        }
        io.sockets.emit('room_change', publicRooms());
    });
});




server.listen(port, () => console.log(`Example app listening on port ${port}!`));
//app.listen(port, () => console.log(`Example app listening on port ${port}!`))