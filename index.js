
const {GraphQLServer} = require('graphql-yoga')
const {prisma} = require('./generated/prisma-client')


const http = require("http");
const path = require("path");
const fs = require("fs");
const crypto = require('crypto')
var cors = require('cors');

const express = require("express")
const multer = require("multer")
const morgan = require('morgan')
const bodyParser = require('body-parser')

const FILE_FIELD = 'xxzzy'

const resolvers = require('./resolvers')

const server = new GraphQLServer({
  typeDefs: './schema.graphql',
  resolvers,
  context: {
    prisma,
  },
})

const app = server.express

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));



const handleError = (err, res) => {
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};

const storage = multer.diskStorage({
  destination: './uploads',
  filename: function (req, file, callback) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return callback(err);

      callback(null, raw.toString('hex') + path.extname(file.originalname));
    });
  }
});

const upload = multer({ storage })



app.post(
  "/upload",
  upload.single(FILE_FIELD),
  (req, res) => {

    if (path.extname(req.file.originalname).toLowerCase() === ".png") {
      console.log('file received', req.file.originalname);
      console.log('final path', `${req.protocol}://${req.host}/${req.file.path}`)
      res
        .status(200)
        .contentType("text/plain")
        .end("File uploaded!");
    } else {
      res
        .status(403)
        .contentType("text/plain")
        .end("Only .png files are allowed!");

    }
  }
);



server.start(() => console.log('server started and running on http://localhost:4000'))



