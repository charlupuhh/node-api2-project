const express = require('express')
const postRouter = require('./posts/posts-router')

const server = express()
server.use(express.json())

server.use('/api/posts', postRouter)

server.listen(1000, () => console.log('server running on port 1000'))