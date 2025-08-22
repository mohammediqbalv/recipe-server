const mongoose = require('mongoose')


// object create 
const postSchema = new mongoose.Schema({
    recipename : {
        type : String,
        require : true
    },
    make : {
        type : String,
        require : true
    },
    recipeImage : {
        type : String,
        require : true
    },
    recipeVideo: {
        type: String,
        require: false
    },
    userId:{
        type:String,
        require:true
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [
        {
            _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
            text: { type: String, required: true },
            userId: { type: String, required: true },
            username: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
            likes: [{ type: String }] // Array of userIds who liked the comment
        }
    ]
 

})


const posts = mongoose.model("posts",postSchema)
module.exports = posts