const express = require('express')
const Posts = require('../data/db')
const { restart } = require("nodemon");
const e = require('express');
const router = express.Router()


router.post('/', (req, res) => {
    const newPost = req.body;

    if(!newPost.title || !newPost.contents){
        res.status(400).json({
            errorMessage: "Please provide title and contents for the post.",
        });
    } else {
        Posts.insert(newPost)
            .then((postData) => {
                Posts.findById(postData.id).then((added) =>{
                    res.status(201).json(added);
                });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({
                    error: "There was an error while saving the post to the database",
                });
            });
    }
});

router.post('/:id/comments', (req, res) => {
    const { id } = req.params;
  const comment = req.body;
  try {
    if (!comment.text) {
      res
        .status(400)
        .json({ errorMessage: "Please provide text for the comment" });
    } else {
      comment.post_id = id;
      Posts.insertComment(comment)
        .then((commentMade) => {
          Posts.findPostComments(comment.post_id)
            .then((postComments) => {
              res.status(201).json({ postComments });
            })
            .catch((err) => {
              res.status(500).json({
                errorMessage:
                  "There was an error while saving the comment to the database",
              });
            });
        })
        .catch((err) => {
          res.status(400).json({
            message: "the post with the specified ID does not exist.",
            data: err,
          });
        });
    }
  } catch (err) {
    res.status(500).json({
      errorMessage:
        "There was an error while saving the comment to the database",
    });
  }
});

router.get('/', (req, res) => {
    Posts.find()
        .then((posts) => {
            res.status(200).json(posts);
        })
        .catch((err) => {
            console.log(err);
            res
                .status(500)
                .json({ error: "The posts information could not be retrieved." });
        });
});

router.get('/:id', (req, res) => {
    Posts.findById(req.params.id)
        .then((database) => {
            const post = database[0];

            if (post) {
                res.status(200).json(post);
            } else {
                res
                    .status(404)
                    .json({ message: "The post with the specified ID does not exist." });
            }
        })
        .catch((err) => {
            console.log(err);
            res
                .status(500)
                .json({ error: "The post information could not be retrieved." });
        });
});

router.get('/:id/comments', (req, res) => {
    const { id } = req.params;
    Posts.findById(id)
      .then((post) => {
        if (post[0] === undefined) {
          res
            .status(404)
            .json({ message: "The post with the specified ID does not exist" });
        } else {
          Posts.findPostComments(id)
            .then((comment) => {
              if (comment[0] === undefined) {
                res
                  .status(200)
                  .json({ message: "This post has no comments yet" });
              } else {
                res.status(200).json({ data: comment });
              }
            })
            .catch((err) => {
              res.status(500).json({
                error: "The comments information could not be retrieved",
              });
            });
        }
      })
      .catch((err) =>
        res
          .status(500)
          .json({ error: "The post with the specified ID does not exist." })
      );
});

router.delete('/:id', (req, res) => {
    Posts.remove(req.params.id)
        .then(check => {
            if(check > 0) {
                res
                    .status(200)
                    .json({message: "Your post has been successfully deleted."  })
            } else {
                res
                    .status(404)
                    .json({error:"The post with the specified ID does not exist."})
            }
        })
        .catch(err => {
            res
                .status(500)
                .json({error:"The posts information could not be retrieved." })
        })
})

router.put('/:id', (req, res) => {
    const id = req.params.id;
    const post = req.body;

    if(!post || !post.contents){
        res
            .status(400)
            .json({
                errorMessage: "Please provide title and contents for the post.",
            });
    } else {
        Posts.update(id, post)
            .then((item) => {
                if (item > 0) {
                    res.status(200).json(post);
                } else {
                    res
                        .status(404)
                        .json({
                            message: "The post with the specified ID does not exist.",
                        });
                }
            })
            .catch((err) => {
                console.log(err);
                res
                    .status(500)
                    .json({ error: "The posts information could not be retrieved." });
            });
    }
})

module.exports = router