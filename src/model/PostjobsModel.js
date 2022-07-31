const { default: mongoose } = require('mongoose');
const Mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost:27017/AlumniPortal');
//mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
mongoose.connect('mongodb+srv://alumniportal:PfR1cnUoGzrhQBhr@alumni.dmlb0.mongodb.net/jobportal?retryWrites=true&w=majority');
const Schema = mongoose.Schema;

const Postajob = new Schema ({
    companyName: String,
    jobRole: String,
    companydetail:String,
    jobcategory:String,
    location: String,
    experience: Number,
    skills: String,
    qualification: String,
    jobDescription: String,
    lastDate: String,
    jobType: String,
    userId:String,
    verified:Number
})

const Postjob = mongoose.model('postjob', Postajob);
module.exports = Postjob;