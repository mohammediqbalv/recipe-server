const multer = require('multer')

const  storage = multer.diskStorage({
    destination:(req,file,callback)=>{
        callback(null,'./uploads')
    },
    filename:(req,file,callback)=>{
        const filename = `media-${Date.now()}-${file.originalname}`
        callback(null,filename)
    }
})
const fileFilter = (req,file,callback)=>{
    const allowedTypes = [
        'image/png', 'image/jpg', 'image/jpeg',
        'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'
    ];
    if(allowedTypes.includes(file.mimetype)){
        callback(null,true)
    }else{
        callback(null,false)
        return callback(new Error("Only png, jpg, jpeg images and mp4, webm, ogg, mov, avi videos are allowed!"))
    }
}

const multerConfig = multer({
    storage,fileFilter
})

module.exports = multerConfig