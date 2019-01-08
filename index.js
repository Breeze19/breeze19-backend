const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const firebase = require('firebase');
const config = require('./config.js');
const createCSVWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const nodemailer = require('nodemailer');
const handlebars = require('nodemailer-express-handlebars');
const app = express();

const PORT = process.env.PORT || 8080

firebase.initializeApp(config.FIREBASE_CONFIG)

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cors())

const smtpTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.GMAIL_EMAIL_ID,
    pass: config.GMAIL_PASSWORD
  }
})

const options = {
  viewEngine: {
         extname: '.hbs',
         layoutsDir: './',
         defaultLayout : '',
         partialsDir : './'
     },
     viewPath: './',
     extName: '.hbs'
}

smtpTransporter.use('compile',handlebars(options))

function sendMail(data){
    if(config.GMAIL_EMAIL_ID.length > 0 && config.GMAIL_PASSWORD.length > 0){
      const mail_data = {
        name: data.name,
        sport_name: data.sport_name,
        reg_id: data.reg_id,
        req_acc: data.req_acc
      }
      smtpTransporter.sendMail({
        from: config.GMAIL_EMAIL_ID,
        to: data.email,
        subject: 'Registration successful',
        attachments: [
          {
            filename: '5df50314-0c82-4fa1-8939-e02c6ab008e8.png',
            path: __dirname + '/images/5df50314-0c82-4fa1-8939-e02c6ab008e8.png',
            cid: '1'
          },
          {
            filename: 'b6438a6d-ce4d-498c-b5c9-fe801cfa09d9.jpg',
            path: __dirname + '/images/b6438a6d-ce4d-498c-b5c9-fe801cfa09d9.jpg',
            cid: '6'
          },
          {
            filename: 'color-facebook-48.png',
            path: __dirname + '/images/color-facebook-48.png',
            cid: '3'
          },
          {
            filename: 'color-instagram-48.png',
            path: __dirname + '/images/color-instagram-48.png',
            cid: '5'
          },
          {
            filename: 'color-link-48.png',
            path: __dirname + '/images/color-link-48.png',
            cid: '4'
          },
          {
            filename: 'color-twitter-48.png',
            path: __dirname + '/images/color-twitter-48.png',
            cid: '2'
          }
        ],
        template: 'sports_email',
        context: mail_data
       }, function (error, response) {
         smtpTransporter.close();
       });
  }
}

function getUniqueId(){
  var id = "EV19"
  var timestamp = new Date().getTime()
  id = id + (timestamp % 10000)
  return id
}

app.post('/register',function(req,res){
  const data = req.body.data;
  data["reg_id"] = getUniqueId();
  firebase.database().ref('/data/registrations-new').push(data).then(function(){
    sendMail(data).then(function(){})
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
  data["reg_id"] = getUniqueId()
  firebase.database().ref('/data/registrationstkk-new').push(data).then(function(){
    sendMail(data)
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
  data["reg_id"] = getUniqueId()
  firebase.database().ref('/data/registrationstkp-new').push(data).then(function(){
    sendMail(data)
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
        {id: 'reg_id',title: 'Registration id'},
        {id: 'collegeName',title: 'College'},
        {id: 'email',title: 'Email'},
        {id: 'name',title: 'Name'},
        {id: 'noofplayers',title: 'No of. Players'},
        {id: 'phno',title: 'Phone no.'},
        {id: 'sportsName',title: 'Sports Name'},
        {id: 'stream',title: 'Stream'}
      ]
    })
    firebase.database().ref('/data/registrations-new').once('value').then(function(snapshot){
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
