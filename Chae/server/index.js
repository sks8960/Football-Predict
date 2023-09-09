const express = require("express");
const app = express();
const port = 5000;
const https = require("https");
const http = require("http");
const axios = require("axios");
const db = require("./db.js");
const moment = require("moment");
const cors = require("cors");
const { User } = require("./models/User");
const { Post } = require("./models/Post");
const { Room } = require("./models/Room.js");
const bodyParser = require("body-parser");
const coockieParser = require("cookie-parser");
const { auth } = require("./middleware/auth");
const socket = require("socket.io");
const { Server } = require("socket.io");
const { ObjectId } = require("mongodb");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(coockieParser());
const config = require("./config/key.js");
const mongoose = require("mongoose");
mongoose
  .connect(config.mongoURI)
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));
app.use(
  "/",
  express.static(__dirname + "/Shin", {
    setHeaders: function (res, path, stat) {
      if (path.endsWith(".js")) {
        res.setHeader("Content-Type", "text/javascript");
      } else if (path.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
    },
  })
);
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

const server = http.createServer(app);
// const io = socket(server);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => res.send("hello World!!!"));

app.get("/user-list", async (req, res) => {
  try {
    const userList = await User.find({}, "name");
    res.json(userList);
  } catch (error) {
    console.error("Failed to fetch user list:", error);
    res.status(500).json({ error: "Failed to fetch user list" });
  }
});

app.get("/api/matching-request", async (req, res) => {
  try {
    if (!req.user) {
      throw new Error("사용자가 인증되지 않았습니다.");
    }

    const matchingRequest = await User.findOne({
      _id: req.user._id,
      "matchingRequests.accepted": false,
    })
      .populate("matchingRequests.fromUser", "name")
      .select("matchingRequests");

    if (!matchingRequest) {
      throw new Error("매칭 요청을 찾을 수 없습니다.");
    }

    res.json(matchingRequest.matchingRequests[0]);
  } catch (error) {
    console.error("Failed to fetch matching request:", error);
    res.status(500).json({ error: "Failed to fetch matching request" });
  }
});

// 매칭 요청 보내기 API 엔드포인트
app.post("/api/send-matching-request", async (req, res) => {
  const { fromUserId, toUserId, date, hour, minute, location } = req.body;

  try {
    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findByIdAndUpdate(
      toUserId,
      {
        $push: {
          matchingRequests: {
            fromUser: fromUserId,
            date,
            time: { hour, minute }, // 시간 정보를 객체로 추가합니다.
            location,
          },
        },
      },
      { new: true }
    );

    console.log("Matching request sent successfully");
    res.json({
      message: "Matching request sent successfully",
      fromUser,
      toUser,
    });
  } catch (error) {
    console.error("Failed to send matching request:", error);
    res.status(500).json({ error: "Failed to send matching request" });
  }
});

// 매칭 요청 수락 API 엔드포인트
app.post("/api/accept-matching-request", async (req, res) => {
  const { userId, requestId } = req.body;
  try {
    const matchingRequests = await User.find(
      { "matchingRequests.fromUser": userId },
      "matchingRequests"
    );
    const user = matchingRequests[matchingRequests.length - 1];
    const matchingRequest = user.matchingRequests.find(
      (request) => request._id.toString() === requestId
    );

    if (matchingRequest) {
      user.matchingRequests.pull(matchingRequest._id);

      if (!user.matchedEvents) {
        user.matchedEvents = [];
      }

      user.matchedEvents.push({
        fromUser: matchingRequest.fromUser,
        date: matchingRequest.date,
        time: matchingRequest.time,
        location: matchingRequest.location,
      });

      await user.save();

      console.log("Matching request accepted");
      res.json({ message: "Matching request accepted", user });
    } else {
      console.error("Matching request not found");
      res.status(404).json({ error: "Matching request not found" });
    }
  } catch (error) {
    console.error("Failed to accept matching request:", error);
    res.status(500).json({ error: "Failed to accept matching request" });
  }
});

// 매칭 요청 거절 API 엔드포인트
app.post("/reject-matching-request", async (req, res) => {
  const { userId, requestId } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { matchingRequests: { _id: requestId } } },
      { new: true }
    );

    console.log("Matching request rejected");
    res.json({ message: "Matching request rejected", user });
  } catch (error) {
    console.error("Failed to reject matching request:", error);
    res.status(500).json({ error: "Failed to reject matching request" });
  }
});

app.post("/api/users/register", (req, res) => {
  //회원 가입 할 때 필요한 정보들을 clinet에서 가져오면
  //그것들을 데이터 베이스에 넣어준다.
  const user = new User(req.body);

  const result = user
    .save()
    .then(() => {
      console.log("성공");
      res.status(200).json({
        success: true,
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({ success: false, err });
    });
});

//요청된 이메일을 데이터베이스에서 있는지 찾는다.
app.post("/api/users/login", (req, res) => {
  // 요청된 이메일을 데이터베이스 찾기
  User.findOne({ email: req.body.email })
    .then((docs) => {
      if (!docs) {
        return res.json({
          loginSuccess: false,
          messsage: "제공된 이메일에 해당하는 유저가 없습니다.",
        });
      }
      docs.comparePassword(req.body.password, (err, isMatch) => {
        if (!isMatch)
          return res.json({
            loginSuccess: false,
            messsage: "비밀번호가 틀렸습니다.",
          });
        // Password가 일치하다면 토큰 생성
        docs.generateToken((err, user) => {
          if (err) return res.status(400).send(err);
          // 토큰을 저장
          res
            .cookie("x_auth", user.token)
            .status(200)
            .json({ loginSuccess: true, userId: user._id });
        });
      });
    })
    .catch((err) => {
      return res.status(400).send(err);
    });
});

//role 1 어드인 role 2 특정 부서 어드민
// role 0 -> 일반유저 role 0이 아니면 관리자

app.get("/api/users/auth", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("matchingRequests.fromUser", "name")
      .select("-password");

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    res.status(200).json({
      _id: user._id,
      isAdmin: user.role === 0 ? false : true,
      isAuth: true,
      email: user.email,
      name: user.name,
      lastname: user.lastname,
      role: user.role,
      image: user.image,
      matchingRequests: user.matchingRequests,
      matchedEvents: user.matchedEvents,
    });
  } catch (error) {
    console.error("Failed to fetch user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

app.get("/api/users/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" })
    .then((user) => {
      console.log(user);
      return res.status(200).send({
        success: true,
      });
    })
    .catch((err) => {
      return res.json({ success: false, err });
    });
});
app.get("/api/posts", (req, res) => {
  Post.find()
    .then((posts) => {
      res.json(posts);
    })
    .catch((error) => {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    });
});

app.post("/api/posts", (req, res) => {
  const { title, content } = req.body;
  const currentTime = new Date().toISOString();

  const newPost = new Post({ title, content, time: currentTime });
  newPost
    .save()
    .then((savedPost) => {
      res.status(201).json({ _id: savedPost._id });
    })
    .catch((error) => {
      console.error("Error creating post:", error);
      res.status(500).json({ error: "Failed to create post" });
    });
});

app.get("/api/posts/:id", (req, res) => {
  const postId = req.params.id;

  // postId를 사용하여 게시물 조회
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.status(404).json({ error: "게시물을 찾을 수 없습니다." });
      }
      //console.log(post);
      res.json(post);
    })
    .catch((error) => {
      console.error("Error fetching post:", error);
      res.status(500).json({ error: "게시물 조회 중 오류가 발생했습니다." });
    });
});

app.get("/api/posts/:id", (req, res) => {
  const postId = parseInt(req.params.id);
  const post = posts.find((p) => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  return res.json(post);
});

app.post("/api/posts/:id/like", (req, res) => {
  const postId = req.params.id;

  Post.findByIdAndUpdate(postId, { $inc: { likes: 1 } }, { new: true })
    .then((post) => {
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json({ likes: post.likes });
    })
    .catch((error) => {
      console.error("Error liking post:", error);
      res.status(500).send("Internal Server Error");
    });
});

// Dislike a post
app.post("/api/posts/:id/dislike", (req, res) => {
  const postId = req.params.id;

  Post.findByIdAndUpdate(postId, { $inc: { dislikes: 1 } }, { new: true })
    .then((post) => {
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json({ dislikes: post.dislikes });
    })
    .catch((error) => {
      console.error("Error disliking post:", error);
      res.status(500).send("Internal Server Error");
    });
});
// ================================================

app.get("/cal/cal/epl", (req, res) => {
  const options = {
    method: "GET",
    url: "https://api-football-v1.p.rapidapi.com/v3/fixtures",
    params: {
      league: 39,
      season: 2023,
    },
    headers: {
      "x-rapidapi-key": "96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332",
      "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
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
      res.status(500).json({ error: "Failed to fetch fixtures" });
    });
});
app.get("/cal/cal/laliga", (req, res) => {
  const options = {
    method: "GET",
    url: "https://api-football-v1.p.rapidapi.com/v3/fixtures",
    params: {
      league: 140,
      season: 2023,
    },
    headers: {
      "x-rapidapi-key": "96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332",
      "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
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
      res.status(500).json({ error: "Failed to fetch fixtures" });
    });
});
app.get("/cal/cal/ligue1", (req, res) => {
  const options = {
    method: "GET",
    url: "https://api-football-v1.p.rapidapi.com/v3/fixtures",
    params: {
      league: 61,
      season: 2023,
    },
    headers: {
      "x-rapidapi-key": "96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332",
      "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
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
      res.status(500).json({ error: "Failed to fetch fixtures" });
    });
});
app.get("/cal/cal/seriea", (req, res) => {
  const options = {
    method: "GET",
    url: "https://api-football-v1.p.rapidapi.com/v3/fixtures",
    params: {
      league: 135,
      season: 2023,
    },
    headers: {
      "x-rapidapi-key": "96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332",
      "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
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
      res.status(500).json({ error: "Failed to fetch fixtures" });
    });
});
app.get("/cal/cal/bundesliga", (req, res) => {
  const options = {
    method: "GET",
    url: "https://api-football-v1.p.rapidapi.com/v3/fixtures",
    params: {
      league: 78,
      season: 2023,
    },
    headers: {
      "x-rapidapi-key": "96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332",
      "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
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
      res.status(500).json({ error: "Failed to fetch fixtures" });
    });
});
app.get("/cal/statistics", function (req, res) {
  res.sendFile(__dirname + "/calStatistics.html");
});

app.get("/cal/predict", function (req, res) {
  res.sendFile(__dirname + "/calPredict.html");
});

let savedFixtureId = null;

app.post("/save-fixture", (req, res) => {
  const { fixtureId } = req.body;
  savedFixtureId = fixtureId;
  res.sendStatus(200);
});

app.get("/get-fixture", (req, res) => {
  res.json({ fixtureId: savedFixtureId });
});

app.get("/cal/stats/:fixtureId", (req, res) => {
  const fixtureId = req.params.fixtureId;
  console.log("Fixture ID:", fixtureId);

  const options = {
    method: "GET",
    hostname: "api-football-v1.p.rapidapi.com",
    port: null,
    path: `/v3/fixtures/statistics?fixture=${fixtureId}`,
    headers: {
      "x-rapidapi-key": "96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332",
      "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
      useQueryString: true,
    },
  };

  

  const req4 = https.request(options, function (response) {
    const chunks = [];

    response.on("data", function (chunk) {
      chunks.push(chunk);
    });

    response.on("end", function () {
      const body = Buffer.concat(chunks);
      const responseData = JSON.parse(body.toString()).response;

      const stats = {};

      responseData.forEach((item) => {
        const teamName = item.team.name;
        const statistics = item.statistics.map((statistic) => ({
          type: statistic.type,
          value: statistic.value !== null ? statistic.value : 0,
        }));

        if (!stats[teamName]) {
          stats[teamName] = {
            teamName,
            statistics,
          };
        } else {
          stats[teamName].statistics =
            stats[teamName].statistics.concat(statistics);
        }
      });

      const statsArray = Object.values(stats);

      console.log(statsArray); // 팀 이름과 통계 값만 출력

      // 통계 데이터를 클라이언트에 전송
      res.json(statsArray);
    });
  });

  req4.end();

  req4.on("error", function (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching statistics" });
  });
});

app.get("/cal/predict/:fixtureId", (req, res) => {
  const fixtureId = req.params.fixtureId;
  console.log("서버 Fixture ID:", fixtureId);

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
  
  const req5 = http.request(options, function (res) {
    const chunks = [];
  
    res.on('data', function (chunk) {
      chunks.push(chunk);
    });
  
    res.on('end', function () {
      const body = Buffer.concat(chunks);
      const responseData = JSON.parse(body.toString());
      console.log(responseData);
      // 'predictions' 객체에 접근하여 클라이언트로 응답을 보냅니다.
      if (responseData) {
        res.json(responseData)
        console.log(responseData);
      } else {
        res.status(500).json({ error: "No predictions found" });
      }
      });
    });
  
  req5.end();

  req5.on("error", function (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred while fetching prediction" });
  });
});



app.get("/teams/:teamName", (req, res) => {
  const teamName = req.params.teamName;
  db.query(
    `SELECT team_id FROM teams WHERE team_name = '${teamName}'`,
    function (error, results, fields) {
      if (error) {
        console.log(error);
        res.status(500).send("Internal server error");
        return;
      }
      const teamId = results[0].team_id;
      console.log(`Team ID: ${teamId}`);
      const options = {
        method: "GET",
        hostname: "api-football-v1.p.rapidapi.com",
        port: null,
        path: `/v3/fixtures?season=2023&team=${teamId}&last=3`,
        headers: {
          "x-rapidapi-key":
            "96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332",
          "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
          useQueryString: true,
        },
      };

      const req = https.request(options, function (response) {
        const chunks = [];

        response.on("data", function (chunk) {
          chunks.push(chunk);
        });

        response.on("end", function () {
          const body = Buffer.concat(chunks);
          const fixtures = JSON.parse(body.toString()).response;
          const fixtureIds = fixtures.map((fixture) => fixture.fixture.id);
          //console.log(fixtureIds);

          const options2 = {
            method: "GET",
            hostname: "api-football-v1.p.rapidapi.com",
            port: null,
            headers: {
              "x-rapidapi-key":
                "96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332",
              "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
              useQueryString: true,
            },
          };

          const statsPromises = fixtureIds.map((fixtureId) => {
            return new Promise((resolve, reject) => {
              options2.path = `/v3/fixtures/statistics?fixture=${fixtureId}`;

              const req2 = https.request(options2, function (response2) {
                const chunks2 = [];

                response2.on("data", function (chunk) {
                  chunks2.push(chunk);
                });

                response2.on("end", function () {
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
                  if (
                    item.hasOwnProperty("team") &&
                    item.hasOwnProperty("statistics")
                  ) {
                    const teamInfo = item.team;
                    const statistics = item.statistics;

                    const teamName = teamInfo.name; // 팀 이름 가져오기

                    console.log("Team Name:", teamName);
                    console.log("Statistics:", statistics);

                    // 값 중에서 null인 경우 0으로 바꾸고 % 문자가 있다면 제거
                    const processedStatistics = {};

                    statistics.forEach((stat) => {
                      if (
                        stat.hasOwnProperty("type") &&
                        stat.hasOwnProperty("value")
                      ) {
                        let processedValue = stat.value;

                        if (processedValue === null) {
                          processedValue = 0;
                        } else if (
                          typeof processedValue === "string" &&
                          processedValue.includes("%")
                        ) {
                          processedValue = parseFloat(
                            processedValue.replace("%", "")
                          );
                        }

                        processedStatistics[stat.type] = processedValue;
                      }
                    });

                    allStats.push({
                      teamName,
                      statistics: processedStatistics,
                      fixtureId,
                    }); // fixtureId 추가
                  } else {
                    console.log("Invalid data:", item);
                  }
                });
              });

              res.json({ stats: allStats });
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Internal server error");
            });
        });
      });

      req.end();
    }
  );
});
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

io.on("connection", (socket) => {
  socket["nickname"] = `익명(${count})`;
  count++;

  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });

  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    socket.room = roomName;
    if (!rooms[roomName]) {
      rooms[roomName] = { participants: 1 };
    } else {
      rooms[roomName].participants += 1;
    }
    io.to(roomName).emit(
      "welcome",
      socket.nickname,
      rooms[roomName].participants
    );
    io.sockets.emit("room_change", publicRooms());
    done();
  });

  socket.on("leave_room", (roomName, done) => {
    if (rooms[roomName]) {
      rooms[roomName].participants -= 1;
      if (rooms[roomName].participants === 0) {
        delete rooms[roomName];
      }
    }
    socket.leave(roomName);
    io.to(roomName).emit("bye", socket.nickname, rooms[roomName]?.participants);
    io.sockets.emit("room_change", publicRooms());
    done();
  });

  socket.on("new_message", (message, roomName, done) => {
    io.to(roomName).emit("new_message", `${socket.nickname}: ${message}`);
    done();
  });

  socket.on("nickname", (nickname) => {
    socket["nickname"] = nickname;
  });

  socket.on("disconnect", () => {
    const roomName = socket.room;
    if (roomName && rooms[roomName]) {
      rooms[roomName].participants -= 1;
      if (rooms[roomName].participants === 0) {
        delete rooms[roomName];
      }
      io.to(roomName).emit(
        "bye",
        socket.nickname,
        rooms[roomName]?.participants
      );
    }
    io.sockets.emit("room_change", publicRooms());
  });
});

server.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);
//app.listen(port, () => console.log(`Example app listening on port ${port}!`))
