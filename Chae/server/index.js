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
const { Comment } = require("./models/Comment.js");
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
      res.clearCookie("x_auth");
      console.log(user);
      return res.status(200).send({
        success: true,
      });
    })
    .catch((err) => {
      return res.json({ success: false, err });
    });
});
// 클라이언트에게 카테고리 목록 전송
app.get("/api/categories", (req, res) => {
  // 여기에서 카테고리 목록을 가져오는 로직을 작성하십시오.
  // 예를 들어, DB에서 카테고리 목록을 가져오거나 하드 코딩된 목록을 생성할 수 있습니다.
  const categoryList = ["epl", "esp", "ita", "ger"];
  res.status(200).json(categoryList);
});

app.get("/api/posts", (req, res) => {
  const category = req.query.category; // 카테고리를 쿼리 문자열로 받음
  let query = {};

  if (category) {
    query = { category };
  }

  Post.find(query)
    .sort({ time: -1 }) // 날짜 기준으로 역순 정렬
    .then((posts) => {
      res.status(200).json(posts);
    })
    .catch((error) => {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    });
});


app.post("/api/posts", (req, res) => {
  const { title, content, category, username } = req.body;
  const currentTime = new Date().toISOString();

  const newPost = new Post({ title, content, category, username, time: currentTime, views: 0 }); // 초기 조회수를 0으로 설정
  newPost
    .save()
    .then((savedPost) => {
      res.status(201).json({ _id: savedPost._id }); // 생성된 포스트의 _id를 응답에 추가
    })
    .catch((error) => {
      console.error("Error creating post:", error);
      res.status(500).json({ error: "Failed to create post" });
    });
});




// 백엔드 코드 수정
app.get("/api/posts/:postId", (req, res) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        res.status(404).json({ error: "Post not found" });
      } else {
        // 글을 조회할 때 조회수를 증가시킵니다.
        Post.findByIdAndUpdate(postId, { $inc: { views: 1 } })
          .then(() => {
            res.status(200).json(post);
          })
          .catch((error) => {
            console.error("Error updating view count:", error);
            res.status(500).json({ error: "Failed to update view count" });
          });
      }
    })
    .catch((error) => {
      console.error("Error fetching post:", error);
      res.status(500).json({ error: "Failed to fetch post" });
    });
});

app.get('/api/posts/:category/:search', async (req, res) => {
  const category = req.params.category;
  const search = req.params.search; // 검색어를 파라미터로 받아옴

  let query = { category };

  if (search) {
    query.title = { $regex: search, $options: 'i' }; // 검색어를 제목에 포함하는 조건 추가
  }

  try {
    const posts = await Post.find(query).sort({ time: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts by category and search:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});





app.get("/api/posts/:id", auth, (req, res) => {
  const postId = parseInt(req.params.id);
  const post = posts.find((p) => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  return res.json(post);
});

app.post("/api/posts/:id/like", auth, async (req, res) => {
  const postId = req.params.id;
  const userName = req.user.name; // 사용자 이름 가져오기
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    // 이미 likeCount 배열에 사용자 이름이 있는지 확인
    const hasLiked = post.likes.some((like) => like.userName === userName);

    if (hasLiked) {
      return res.status(400).json({ error: "Already liked" });
    }

    // 새로운 좋아요를 배열에 추가
    post.likes.push({ userName });

    // likeCount 업데이트
    post.likeCount = post.likes.length;

    // 저장
    await post.save();

    res.json({ likeCount: post.likeCount });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).send("Internal Server Error");
  }
});


// Dislike a post
app.post("/api/posts/:id/dislike", auth, async (req, res) => {
  const postId = req.params.id;
  const userName = req.user.name;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    // 이미 dislikeCount 배열에 사용자 이름이 있는지 확인
    const hasDisliked = post.dislikes.some((dislike) => dislike.userName === userName);
    if (hasDisliked) {
      return res.status(400).json({ error: "Already disliked" });
    }
    // 새로운 비추천을 배열에 추가
    post.dislikes.push({ userName });

    // dislikeCount 업데이트
    post.dislikeCount = post.dislikes.length;

    // 저장
    await post.save();

    res.json({ dislikeCount: post.dislikeCount });
  } catch (error) {
    console.error("Error disliking post:", error);
    res.status(500).send("Internal Server Error");
  }
});


app.post("/api/posts/:id/cancelLike", auth, async (req, res) => {
  const postId = req.params.id;
  const userName = req.user.name;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // 이미 likeCount 배열에 사용자 이름이 있는지 확인
    const hasLiked = post.likes.some((like) => like.userName === userName);

    if (!hasLiked) {
      return res.status(400).json({ error: "Not liked yet" });
    }

    // 사용자 이름에 해당하는 좋아요를 배열에서 삭제
    post.likes = post.likes.filter((like) => like.userName !== userName);

    // likeCount 업데이트
    post.likeCount = post.likes.length;

    // 저장
    await post.save();

    res.json({ likeCount: post.likeCount });
  } catch (error) {
    console.error("Error cancelling like:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/api/hotposts", async (req, res) => {
  try {
    const now = new Date(); // 현재 시간

    // 24시간 이내 게시물을 가져오기 위한 날짜 계산
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(now.getDate() - 1);

    const posts = await Post.aggregate([
      {
        $match: {
          time: { $gt: oneDayAgo }, // 24시간 이내 게시물 필터링
        },
      },
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: ["$likeCount", 0.5] },
              { $multiply: ["$dislikeCount", -0.5] },
              { $multiply: ["$views", 0.5] },
            ],
          },
        },
      },
      { $sort: { score: -1 } }, // 점수 내림차순 정렬
      { $limit: 7 }, // 최대 10개 게시물만 선택
    ]);

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});
// Cancel Dislike for a post
app.post("/api/posts/:id/cancelDislike", auth, async (req, res) => {
  const postId = req.params.id;
  const userName = req.user.name;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // 이미 dislikeCount 배열에 사용자 이름이 있는지 확인
    const hasDisliked = post.dislikes.some((dislike) => dislike.userName === userName);

    if (!hasDisliked) {
      return res.status(400).json({ error: "Not disliked yet" });
    }

    // 사용자 이름에 해당하는 비추천을 배열에서 삭제
    post.dislikes = post.dislikes.filter((dislike) => dislike.userName !== userName);

    // dislikeCount 업데이트
    post.dislikeCount = post.dislikes.length;

    // 저장
    await post.save();

    res.json({ dislikeCount: post.dislikeCount });
  } catch (error) {
    console.error("Error cancelling dislike:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  const postId = req.params.id;

  try {
    // 해당 ID를 가진 포스트를 찾고 삭제
    const deletedPost = await Post.findByIdAndRemove(postId);

    if (!deletedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(204).end(); // 성공적으로 삭제되었음을 응답
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});
// ================================================
// 댓글 기능

app.post('/api/posts/:postId/comments', async (req, res) => {
  try {
    const postId = req.params.postId;
    const { text, author } = req.body; // 클라이언트에서 댓글 텍스트와 작성자 이름을 요청의 본문에서 가져옵니다.

    // 댓글을 생성하고 Comment 모델에 저장합니다.
    const newComment = new Comment({ text, author });
    await newComment.save();

    // 댓글을 해당 포스트의 comments 배열에 추가합니다.
    const post = await Post.findById(postId);
    post.comments.push(newComment);
    await post.save();
    res.status(201).json(newComment); // 생성된 댓글을 클라이언트에 반환합니다.
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: '댓글을 생성하는 동안 오류가 발생했습니다.' });
  }
});


// 서버의 API 라우터에 추가
app.get('/api/posts/:postId/comments', async (req, res) => {
  try {
    const postId = req.params.postId;
    // 해당 포스트의 댓글 목록을 가져오는 코드
    const comments = await Comment.find({ postId: postId.toString() });
    // postId로 필터링하여 해당 포스트의 댓글만 가져옵니다.
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: '댓글을 불러오는 동안 오류가 발생했습니다.' });
  }
});

app.get('/api/comments/:commentId', async (req, res) => {
  try {
    // 댓글 ID를 파라미터에서 가져옴
    const { commentId } = req.params;
    // 댓글 ID로 댓글을 데이터베이스에서 조회
    const comment = await Comment.findById(commentId.toString());
    if (!comment) {
      return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });
    }
    // 댓글 내용을 클라이언트에 반환
    res.json(comment);
  } catch (error) {
    console.error('Error fetching comment:', error);
    res.status(500).json({ error: '댓글을 가져오는 중에 오류가 발생했습니다.' });
  }
});
// 댓글 삭제 엔드포인트

app.delete('/api/posts/:postId/comments/:commentId', async (req, res) => {
  const postId = req.params.postId;
  const commentId = req.params.commentId;

  try {
    // postId와 commentId를 사용하여 댓글을 찾음
    const comment = await Comment.findOne({ _id: commentId });

    if (!comment) {
      // 댓글을 찾지 못한 경우
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }

    // 댓글을 삭제
    await Comment.deleteOne({ _id: commentId });

    // 댓글 삭제가 성공한 경우
    // 해당 게시물의 comments 배열에서도 삭제
    await Post.updateOne(
      { _id: postId },
      { $pull: { comments: commentId } }
    );

    res.status(204).send();
  } catch (error) {
    // 에러 처리
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: '댓글 삭제 중에 오류가 발생했습니다.' });
  }
});

app.put('/api/posts/:id', async (req, res) => {
  const postId = req.params.id;
  const { content } = req.body;

  try {
    // 게시물을 불러오고 수정
    const post = await Post.findByIdAndUpdate(postId, { content }, { new: true });

    if (!post) {
      return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error editing post:', error);
    res.status(500).json({ error: '게시물 수정 중 오류가 발생했습니다.' });
  }
});

// 달력  ===========================================================================
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
    }
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

app.get("/cal/predict/:fixtureId", async (req, res) => {
  const fixtureId = req.params.fixtureId;
  console.log(fixtureId);
  console.log("서버 Fixture ID:", fixtureId);

  const axiosOptions = {
    method: 'GET',
    url: `https://api-football-v1.p.rapidapi.com/v3/predictions?fixture=${fixtureId}`,
    headers: {
      'X-RapidAPI-Key': '96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332',
      'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
    }
  };

  try {
    const response = await axios(axiosOptions);
    const responseData = response.data;
    //console.log(responseData);


    if (responseData) {
      res.json(responseData);
      console.log(responseData);
    } else {
      res.status(500).json({ error: "No predictions found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred while fetching prediction" });
  }
});

// 팀정보 받아오기

app.get("/teaminfo/:teamName", (req, res) => {
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
        path: `/v3/teams?id=${teamId}`,
        headers: {
          "x-rapidapi-key":
            "96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332",
          "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
          useQueryString: true,
        },
      };

      // 실제 API 요청 보내기
      const apiRequest = https.request(options, (apiResponse) => {
        let data = "";

        apiResponse.on("data", (chunk) => {
          data += chunk;
        });

        apiResponse.on("end", () => {
          const teamInfo = JSON.parse(data);
          // 여기에서 팀 정보를 사용할 수 있습니다.
          res.json(teamInfo);
        });
      });

      apiRequest.on("error", (error) => {
        console.error(error);
        res.status(500).send("Internal server error");
      });

      apiRequest.end();
    }
  );
});


// 팀 스쿼드
app.get("/teamsquad/:teamName", (req, res) => {
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
        path: `/v3/players/squads?team=${teamId}`,
        headers: {
          "x-rapidapi-key":
            "96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332",
          "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
          useQueryString: true,
        },
      };
      const apiRequest = https.request(options, (apiResponse) => {
        let data = '';

        apiResponse.on('data', (chunk) => {
          data += chunk;
        });

        apiResponse.on('end', () => {
          const teamSquad = JSON.parse(data);
          console.log(teamSquad)
          res.json(teamSquad); // Send the team statistics as JSON response to the client
        });
      });

      apiRequest.on('error', (apiError) => {
        console.error(apiError);
        res.status(500).send('Internal server error');
      });

      apiRequest.end();
    }
  );
});
      



// 팀 스탯
app.get('/teamstat/:teamName', (req, res) => {
  const teamName = req.params.teamName;
  db.query(
    `SELECT team_id, league_id FROM teams WHERE team_name = '${teamName}'`,
    function (error, results, fields) {
      if (error) {
        console.log(error);
        res.status(500).send('Internal server error');
        return;
      }
      const teamId = results[0].team_id;
      const leagueId = results[0].league_id; // Fixed index here

      console.log(`Team ID: ${teamId}`);
      console.log(`League ID: ${leagueId}`);

      const options = {
        method: 'GET',
        hostname: 'api-football-v1.p.rapidapi.com',
        port: null,
        path: `/v3/teams/statistics?league=${leagueId}&season=2023&team=${teamId}`, // Fixed variable name
        headers: {
          'x-rapidapi-key': '96e6fbd9e1msh363fb680c23119fp131a0ajsn8edccdfdd332',
          'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
          useQueryString: true,
        },
      };

      const apiRequest = https.request(options, (apiResponse) => {
        let data = '';

        apiResponse.on('data', (chunk) => {
          data += chunk;
        });

        apiResponse.on('end', () => {
          const teamStats = JSON.parse(data);
          console.log(teamStats)
          res.json(teamStats); // Send the team statistics as JSON response to the client
        });
      });

      apiRequest.on('error', (apiError) => {
        console.error(apiError);
        res.status(500).send('Internal server error');
      });

      apiRequest.end();
    }
  );
});



// 팀분석
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


//채팅
// const rooms = {};
// let count = 0;

// const publicRooms = (io) => {
//   const publicRooms = [];
//   const { adapter } = io.sockets;
//   if (adapter) {
//     const { sids, rooms } = adapter;
//     rooms.forEach((_, key) => {
//       if (sids.get(key) === undefined) {
//         publicRooms.push(key);
//       }
//     });
//   }
//   return publicRooms;
// };

// io.on("connection", (socket) => {
//   socket.nickname = `익명(${count})`;
//   count++;

//   socket.onAny((event) => {
//     console.log(`Socket Event: ${event}`);
//   });

//   socket.on("enter_room", (roomName, done) => {
//     socket.join(roomName);
//     socket.room = roomName;
//     if (!rooms[roomName]) {
//       rooms[roomName] = { participants: 1 };
//     } else {
//       rooms[roomName].participants += 1;
//     }
//     io.to(roomName).emit(
//       "welcome",
//       socket.nickname,
//       rooms[roomName].participants
//     );
//     io.sockets.emit("room_change", publicRooms(io));
//     done();
//   });

//   socket.on("leave_room", (roomName, done) => {
//     if (rooms[roomName]) {
//       rooms[roomName].participants -= 1;
//       if (rooms[roomName].participants === 0) {
//         delete rooms[roomName];
//       }
//     }
//     socket.leave(roomName);
//     io.to(roomName).emit("bye", socket.nickname, rooms[roomName]?.participants);
//     io.sockets.emit("room_change", publicRooms(io));
//     done();
//   });

//   socket.on("new_message", (message, roomName, done) => {
//     // 클라이언트가 보낸 메시지를 방에 참여한 모든 사용자에게 브로드캐스트
//     io.to(roomName).emit("new_message", `${socket.nickname}: ${message}`);
//     done();
//   });

//   socket.on("nickname", (nickname) => {
//     socket.nickname = nickname;
//   });

//   socket.on("disconnect", () => {
//     const roomName = socket.room;
//     if (roomName && rooms[roomName]) {
//       rooms[roomName].participants -= 1;
//       if (rooms[roomName].participants === 0) {
//         delete rooms[roomName];
//       }
//       io.to(roomName).emit(
//         "bye",
//         socket.nickname,
//         rooms[roomName]?.participants
//       );
//     }
//     io.sockets.emit("room_change", publicRooms(io));
//   });
// });
const rooms = new Map();
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("message", (data) => {
    console.log(data);
    io.emit("message", data);
  });

  socket.on("createRoom", (roomName) => {
    if (!rooms.has(roomName)) {
      rooms.set(roomName, { users: new Set() });
    }
    rooms.get(roomName).users.add(socket.id); // Use socket.id to uniquely identify users
    console.log(rooms);
    updateRoomList();
  });

  socket.on("joinRoom", (roomName) => {
    if (rooms.has(roomName)) {
      socket.room = roomName;
      rooms.get(roomName).users.add(socket.id);
      console.log(rooms.get(roomName));
      updateRoomList();
    }
  });

  socket.on("leaveRoom", () => {
    if (socket.room) {
      const roomName = socket.room;
      rooms.get(roomName).users.delete(socket.id);
      if (rooms.get(roomName).users.size === 0) {
        // If the room is empty, remove it
        rooms.delete(roomName);
      }
      socket.room = null;
      updateRoomList();
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    if (socket.room) {
      const roomName = socket.room;
      rooms.get(roomName).users.delete(socket.id);
      if (rooms.get(roomName).users.size === 0) {
        // If the room is empty, remove it
        rooms.delete(roomName);
      }
      updateRoomList();
    }
  });

  function updateRoomList() {
    const roomList = Array.from(rooms.keys()).map((roomName) => ({
      roomName,
      users: rooms.get(roomName).users.size,
    }));
    io.emit("roomList", roomList);
  }
});




server.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);
//app.listen(port, () => console.log(`Example app listening on port ${port}!`))
