const { default: mongoose } = require('mongoose');
const Mongoose = require('mongoose');

//mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
db = mongoose.connect('mongodb+srv://alumniportal:PfR1cnUoGzrhQBhr@alumni.dmlb0.mongodb.net/jobportal?retryWrites=true&w=majority');

const Schema = mongoose.Schema;
const Applyjob = new Schema({
    name        : String,    
    link        :  String,
    postID      :  String,
    AlumnId     :  String,
    Dateofsub   :  Date,
    Visibility  : Number,
})
const applyjob = mongoose.model('applied',Applyjob);
module.exports = applyjob;