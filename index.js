const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const firebase = require('firebase');
const config = require('./config.js');
const app = express();

const PORT = process.env.PORT || 8080

firebase.initializeApp(config)

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cors())

app.post('/register',function(req,res){
  const data = req.body.data;
  firebase.database().ref('/data/registrations').push(data).then(function(){
    res.json({
      result: "OK"
    })
  }).catch(function(err){
    console.log(err);
    res.json({
      result: "Error"
    })
  })
})

app.post('/email',function(req,res){
  const data = req.body.data;
  firebase.database().ref('/data/email').push(data).then(function(){
    res.json({
      result: "OK"
    })
  }).catch(function(err){
    console.log(err)
    res.json({
      result: "Error"
    })
  })
})

app.listen(PORT,function(){
  console.log("Listening to " + PORT)
})
