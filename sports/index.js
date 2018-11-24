const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const PORT = 8080 || process.env.PORT;

app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())

app.get('/register',function(res,res){
  const data = req.body;
})

app.listen(PORT,function(){
  console.log("Listening to " + PORT)
})
