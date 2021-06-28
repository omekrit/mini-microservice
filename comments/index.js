const express = require('express');
const app = express();
const cors = require('cors');
const { randomBytes } = require('crypto');
const axios = require('axios');

// body-parser
app.use(express.json());
// handling cors
app.use(cors());
// local repository for comments
const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex');
  const postId = req.params.id;
  const { content } = req.body;
  const comments = commentsByPostId[postId] || [];
  comments.push({ id: commentId, content });
  commentsByPostId[postId] = comments;
  
  // emitting CommentCreated event
  await axios
    .post('http://localhost:4005/events', {
      type: 'CommentCreated',
      data: {
        id: commentId,
        content,
        postId,
      },
    })
    .catch(err => console.log(err));

  res.status(201).send(comments);
});

app.listen(4001, () => {
  console.log('Listening on 4001');
});
