const resumeupload = require("express-fileupload");
const express = require ('express');

const Postjob = require('./src/model/PostjobsModel');
const UserDetail = require("./src/model/UserModel");
const Applyjob = require("./src/model/Applyjobs.js");
const cors = require ('cors');
const bodyParser = require ('body-parser');
const nodemailer = require("nodemailer");
let loggedUser ='';

const app = new express();

const path = require('path');
app.use(express.static(`./dist/frontend`));

app.use(cors());
const jwt = require('jsonwebtoken');
app.use(resumeupload());
app.use(express.static("files"));
app.use(bodyParser.json());
app.use(express.json());

/* app.get('/', (req, res) => {
 // res.send('i am divs dddd')
}) */
app.use(bodyParser.urlencoded({ extended: true }));

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
  userExists = 0;
  UserDetail.findOne ({"email":users.email})
  .then(function (userExists) {   
    if(userExists){  
     return res.status(400).send({message:'Email Already exists in our system'});
    }
  });
  if(!userExists){
    users.save()
    .then(newuser => {
      return res.status(200).json({'user': 'user registration completed successfully'});
    })
    .catch(err => {
        return res.status(400).send({message:'user registration failed'});
    });
  }    
 
})

app.post("/api/resume-submit", (req, res) => {
  timestamp = new Date().getTime().toString();
  link_posted = req.body.filelink;
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE");
      dateofsub = new Date();
      var applyjobs = {
          name: req.body.name,
          link: link_posted,
          postID: req.body.postID,
          AlumnId: req.body.alumniID,
          Dateofsub:dateofsub,
          Visibility:0,
      }
      var job = new Applyjob(applyjobs)
      job.save()
      .then(job => {
          
          return res.status(200).json({'job': 'New Application submitted successfully'});
      })
      .catch(err => {
          return res.status(400).send('Apllication submission failed');
      });
});
app.post("/api/resume-upload", (req, res) => {
  const newpath = __dirname + "/files/";
  const file = req.files.resume;  
  timestamp = new Date().getTime().toString();
  const filename = timestamp+file.name;
  link_posted = req.body.filelink;
  if(link_posted==''){
    link_posted = `${filename}`;
  }
  file.mv(`${newpath}${filename}`, (err) => {
    if (err) {
      return res.status(500).send({ message: "File upload failed" });
    }
    else{
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE");
      dateofsub = new Date();
      var applyjobs = {
          name: req.body.name,
          link: link_posted,
          postID: req.body.postID,
          AlumnId: req.body.alumniID,
          Dateofsub:dateofsub,
          Visibility:0,
      }
      var job = new Applyjob(applyjobs)
      job.save()
      .then(job => {
          
          return res.status(200).json({'job': 'New Application submitted successfully'});
      })
      .catch(err => {
          return res.status(400).send('Apllication submission failed');
      });
    }
   // res.status(200).send({ message: `${newpath}${filename}`, code: 200 });
  });
});
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
  let payload = jwt.verify(token,'secretKey');
  
  if(!payload){
    return res.status(401).send('Unauthorized request');
  }
  this.loggedUser = payload.id;
  this.loggedRole =payload.user_role;
  if(this.loggedRole == "user_faculty"){
    this.loggedUser = payload.id;
  }
  else if(this.loggedRole == "user_admin"){
    this.loggedUser = 'fetchall';
  }
  else { this.loggedUser =0; }
  
  next()

}

function LoggedUserID(req,res){
  let token = req.headers.authorization.split(' ')[1];
  if(token!='null'){
    let payload = jwt.verify(token,'secretKey');
    return req.userId = payload.id;
  }
}

app.get('/api/getuser',verifyToken,function(req,res){  
  id = this.loggedUser;
  UserDetail.findOne ({"_id":id})
    .then(function(userDetail){
        return res.send(userDetail);
    })
  
})
app.post('/api/login', (req, res) => {
    let userData = req.body;
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
   
    if(!userData.email){
       return res.status(401).send("invalid username");
    }
    else if(!userData.password){
      return res.status(401).send("invalid password");
    }
    else {        
      UserDetail.findOne ({"email":userData.email,"password":userData.password})
        .then(function (user) {
          if(user){
            let payload = {subject:userData.email+userData.password,user_role:user.userrole,id:user._id}
            let token = jwt.sign(payload,'secretKey');
           /*  let LoggedUser = {
              'token':token,
              'userrole':user.userrole
            } */
            return res.status(200).send({'token':token,'userrole':user.userrole});
          }
          else{
            return res.status(400).send({msg:`Invalid Login credentials`});
          }
          
        })
        .catch(err => {              
          res.status(400).send({msg:`Login failed`});
        });           
      
    }  
})
app.get('/api/getapplicatins',verifyToken,function(req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE");
  id = this.loggedUser;
    if(id=='fetchall'){
      Applyjob.aggregate([
        {
          $lookup: {
            "let": { "postObjID": { "$toObjectId": "$postID" } },
            from: "postjobs",
            "pipeline": [
              { "$match": { "$expr": { "$eq": [ "$_id", "$$postObjID" ] } } }
            ],
            as: "applctndetails"
          }
        },
        {
          $unwind: "$applctndetails"
       },
       
      ])
        .then(function(applyjob){
          return res.send(applyjob);
        })
        .catch((error) => {
          console.log(error);
        });
   }
  else if(id!=0 && id!=undefined){
    Applyjob.aggregate([
      {
        $lookup: {
          "let": { "postObjID": { "$toObjectId": "$postID"},visibility: "$Visibility",userId:"$userId"},
          from: "postjobs",
          "pipeline": [
            { "$match":
            { $expr:
              { $and:
                 [
                   { $eq: [ "$_id",  "$$postObjID" ] },
                   { $eq: [ 1, "$$visibility" ] },
                 ]
              }
           }
            }
          ],
          as: "applctndetails"
        }
      },
      {
        $unwind: "$applctndetails"
     },
     
    ])
      .then(function(applyjob){
        return res.send(applyjob);
      })
      .catch((error) => {
        console.log(error);
      });
   
  }
  
 
 
})
app.get('/api/latestjobs',function(req,res){  
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE");
    Postjob.find({"verified":1})
    .limit(5)
    .then(function(postajob){
        return res.send(postajob);
    })
  
})
app.get('/api/postbycategory/:id',(req, res) => {
    id  = req.params.id;
    Postjob.find({"jobcategory":id,"verified":1})
      .then(function (jobcategory) {
        res.send(jobcategory);
    })  
})

app.get('/api/postajob',function(req,res){  
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE");
    id=0;
    id = this.loggedUser;
    if(id=='fetchall'){
        Postjob.find()
      .then(function(postajob){
          return res.send(postajob);
      })
    }
    else if(id!=0 && id!=undefined){
      Postjob.find({"userId":id})
      .then(function(posts){
          return res.send(posts);
      })
    }else {
      Postjob.find({"verified":1})
      .then(function(postajob){
          return res.send(postajob);
      })
    }
    
})
app.post('/api/addJob',verifyToken, function(req,res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE");

    var jobs = {
        companyName:req.body.item.companyName ,
        jobRole: req.body.item.jobRole, 
        companydetail: req.body.item.companydetail,
        jobcategory: req.body.item.jobcategory,
        location: req.body.item.location,
        experience: req.body.item.experience,
        skills: req.body.item.skills,
        qualification: req.body.item.qualification,
        jobDescription: req.body.item.jobDescription,
        lastDate: req.body.item.lastDate,
        jobType: req.body.item.jobType,
        userId :req.body.item.userId,
        verified:0

    }

    var job = new Postjob(jobs)
    job.save()
    .then(job => {
        
        res.status(200).json({'job': 'New job added successfully'});
    })
    .catch(err => {
        res.status(400).send('adding new job failed');
    });
})
app.put('/api/editPost',verifyToken, function(req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE");
  id  = req.body.item._id;
  companyName     = req.body.item.companyName ;
  jobRole         = req.body.item.jobRole; 
  companydetail   = req.body.item.companydetail;
  jobcategory     = req.body.item.jobcategory;
  location        = req.body.item.location;
  experience      = req.body.item.experience;
  skills          = req.body.item.skills;
  qualification   = req.body.item.qualification;
  jobDescription  = req.body.item.jobDescription;
  lastDate        = req.body.item.lastDate;
  jobType         = req.body.item.jobType;
  verified        = 0;


  Postjob.findByIdAndUpdate({"_id":id},{$set:{
    "companyName":companyName ,
    "jobRole": jobRole, 
    "companydetail": companydetail,
    "jobcategory": jobcategory,
    "location": location,
    "experience": experience,
    "skills": skills,
    "qualification": qualification,
    "jobDescription": jobDescription,
    "lastDate": lastDate,
    "jobType": jobType,
    "verified":0
    }})
  .then(job => {
      
      res.status(200).json({'job': 'Job edited successfully'});
  })
  .catch(err => {
      res.status(400).send('editing job failed');
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
app.get('/api/getAppById/',(req, res) => {

  id  = req.query.postID;
  userId  = req.query.AlumnId;
  
  Applyjob.findOne({"postID":id,"AlumnId":userId},{"Visibility":1})
  .then(function (applied) {
    res.send(applied);
})
.catch(err => {
    res.status(400).send('fetching job detail failed');
});

})

app.delete('/api/remove/:id',verifyToken,(req, res) => {
  id  = req.params.id;
  Postjob.findByIdAndDelete({"_id":id})
  .then(() => {
    res.status(200).json({'post': 'post deleted successfully'});
})
.catch(err => {
    res.status(400).send('deleting post failed');
});

})
app.put('/api/updateapplicatin',verifyToken, (req, res) => {
  id  = req.body.Appid;
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");  
  Applyjob.findByIdAndUpdate({"_id":id},{$set:{
    "Visibility":1
    }})
      .then(applctn => {
          res.status(200).json({'verify': 'Application sent successfully'});
      })
      .catch(err => {
          res.status(400).send('Application senting failed');
      });
})
app.put('/api/verifypost',verifyToken, (req, res) => {
  id  = req.body.PostId;
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");  
  Postjob.findByIdAndUpdate({"_id":id},{$set:{
    "verified":1
    }})
      .then(post => {
          res.status(200).json({'verify': 'Post sent successfully'});
      })
      .catch(err => {
          res.status(400).send({'verify': 'Post verification failed'});
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
        user: 'wishgreeting2022@gmail.com                                  ',
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

