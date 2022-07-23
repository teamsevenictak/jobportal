const express = require ('express');
const cors = require ('cors');
const bodyParser = require ('body-parser')
const Postjob = require('./src/model/PostjobsModel');
const UserDetail = require("./src/model/UserModel");
const nodemailer = require("nodemailer");

const app = new express();
const path = require('path');
app.use(express.static(`./dist/frontend`));

app.use(cors());
const jwt = require('jsonwebtoken');
app.use(bodyParser.json());
app.use(express.json());

app.post('/api/register', (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");  
  var newuser = {
    firstname : req.body.user.firstname,
    email     : req.body.user.email,
    phoneno   : req.body.user.phoneno,
    password  : req.body.user.password,
    userrole  : req.body.user.userrole,
    terms     : req.body.user.terms

  }
  let users = new UserDetail(newuser);
  
  users.save()
  .then(newuser => {
      res.status(200).json({'user': 'user registration completed successfully'});
  })
  .catch(err => {
      res.status(400).send('user registration failed');
  });
  
 
})

//username= "admin";
//password = "123456";

function verifyToken(req,res,next){
  if(!req.headers.authorization){
    return res.status(401).send('Unauthorized request');
  }
  let token = req.headers.authorization.split(' ')[1];
  if(token=='null')
  {
    return res.status(401).send('Unauthorized request');
  }
  let payload = jwt.verify(token,'teamseven#$');
  
  if(!payload){
    return res.status(401).send('Unauthorized request');
  }
  req.userId = payload.subject
  next()

}


app.post('/api/login', (req, res) => {
    let userData = req.body;
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
   
    if(!userData.email){
        res.status(401).send("invalid username");
    }
    else if(!userData.password){
      res.status(401).send("invalid password");
    }
    else {        
      UserDetail.findOne ({"email":userData.email,"password":userData.password})
        .then(function (user) {
          if(user){
            let payload = {subject:userData.email+userData.password}
            let token = jwt.sign(payload,'secretKey');
            let LoggedUser = {
              'token':token,
              'userrole':user.userrole
            }
            res.status(200).send({'token':token,
            'userrole':user.userrole});
          }
          else{
            res.status(400).send({msg:`Invalid Login credentials`});
          }
          
        })
        .catch(err => {   console.log('failed')            ;            
          res.status(400).send({msg:`Login failed`});
        });           
      
    }  
})
app.get('/api/postajob',function(req,res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE");
    Postjob.find()
    .then(function(postajob){
        res.send(postajob);
    })
})

app.post('/api/addJob',verifyToken, function(req,res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE");

    var jobs = {
        companyName:req.body.item.companyName ,
        jobRole: req.body.item.jobRole, 
        location: req.body.item.location,
        experience: req.body.item.experience,
        skills: req.body.item.skills,
        qualification: req.body.item.qualification,
        jobDescription: req.body.item.jobDescription,
        lastDate: req.body.item.lastDate,
        jobType: req.body.item.jobType
    }

    var job = new Postjob(jobs)
    job.save()
    .then(job => {
        console.log('added');
        res.status(200).json({'job': 'New job added successfully'});
    })
    .catch(err => {
        res.status(400).send('adding new job failed');
    });
})
app.get('/api/jobdetail/:id',(req, res) => {
    id  = req.params.id;
    Postjob.findById({"_id":id})
    .then(function (jobdetail) {
      res.send(jobdetail);
  })
  .catch(err => {
      res.status(400).send('fetching job detail failed');
  });

})
app.post('/api/sendEmail', function (req, res) {
    // async..await is not allowed in global scope, must use a wrapper
async function main() {
  
 var visitor = {
    name       : req.body.visitor.name,
    subject    : req.body.visitor.subject,
    email      : req.body.visitor.email,
    message    : req.body.visitor.message
    }
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail",   
    auth: {
      user: 'teamsevenictak@gmail.com',
      pass: 'mckfxowcmhxcjpcd'
    },
  });
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: 'teamsevenictak@gmail.com', // sender address
    to: visitor.name+visitor.email, // list of receivers
    subject: visitor.subject, // Subject line
    text: visitor.message
  });
  console.log("Message sent: %s", info.messageId);
  res.status(200).json({'message': 'Mail sent successfully'});
}

main().catch(console.error);
    
    });
app.get('/*', function(req, res) {

  res.sendFile(path.join(__dirname + '/dist/frontend/index.html'));
}); 
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log("Server up in Port 5000 ");
});

