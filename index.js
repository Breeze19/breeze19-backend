const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const firebase = require('firebase');
const config = require('./config.js');
const app = express();

const PORT = 8080 || process.env.PORT;

firebase.initializeApp(config)

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cors())

app.post('/register',function(req,res){
  const data = req.body;
  firebase.database().ref('/data/registrations').push(data)
  res.json({
    result: "OK"
  })
})

app.post('/email',function(req,res){
  const data = req.body;
  firebase.database().ref('/data/email').push(data)
  res.json({
    result: "OK"
  })
})

app.listen(PORT,function(){
  console.log("Listening to " + PORT)
})
