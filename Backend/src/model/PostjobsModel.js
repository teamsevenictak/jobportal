const mongoose = require ('mongoose');
//mongoose.connect('mongodb://localhost:27017/AlumniPortal');
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
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
    jobType: String
})

const Postjob = mongoose.model('postjob', Postajob);
module.exports = Postjob;