const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const firebase = require('firebase');
const config = require('./config.js');
const createCSVWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 8080

firebase.initializeApp(config.FIREBASE_CONFIG)

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

app.post('/register/tkk',function(req,res){
  const data = req.body.data
  firebase.database().ref('/data/registrationstkk').push(data).then(function(){
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

app.post('/register/tkp',function(req,res){
  const data = req.body.data
  firebase.database().ref('/data/registrationstkp').push(data).then(function(){
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

app.get('/getcsv/:key',function(req,res){
  if(req.params.key == config.SECURE_KEY){
    const csvWriter = createCSVWriter({
      path: './registrations.csv',
      header: [
        {id: 'cgg',title: 'CGPA grad'},
        {id: 'cgx',title: 'CGPA 10th'},
        {id: 'cgxii',title: 'CGPA 12th'},
        {id: 'collegeName',title: 'College'},
        {id: 'email',title: 'Email'},
        {id: 'lod',title: 'Location of Domicile'},
        {id: 'name',title: 'Name'},
        {id: 'noofplayers',title: 'No of. Players'},
        {id: 'phno',title: 'Phone no.'},
        {id: 'sportsName',title: 'Sports Name'},
        {id: 'stream',title: 'Stream'}
      ]
    })
    firebase.database().ref('/data/registrations').once('value').then(function(snapshot){
      if(snapshot.val()){
        try{
          if(fs.existsSync('./registrations.csv')){
            console.log('File exists')
            fs.unlinkSync('./registrations.csv')
          }
        } catch(err){
          console.log(err)
        }
        registrations = []
        snapshot.forEach(function(child){
          registrations.push(child.val())
          csvWriter.writeRecords(registrations).then(function(){
            console.log("File created");
            var stat = fs.statSync('./registrations.csv')
            res.writeHead(200,{
              'Content-Type': 'text/csv',
              'Content-Length': stat.size,
              'Content-disposition': 'attachment; filename=registrations.csv'
            })
            var readStream = fs.createReadStream('./registrations.csv')
            readStream.pipe(res)
          })
        })
      }
    })
  } else{
    res.json({
      result: "Unauthorized attempt"
    })
  }
})

app.listen(PORT,function(){
  console.log("Listening to " + PORT)
})
