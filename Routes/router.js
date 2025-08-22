const express = require('express')
const router = new express.Router()
const userController = require("../Controllers/userController")
const postController = require("../Controllers/postController")
const jwtMiddleware = require('../Middlewares/jwtMiddlewares')
const adminMiddleware = require('../Middlewares/adminMiddleware')
const multerConfig = require('../Middlewares/multerMiddleware')

// register API
router.post('/user/register',userController.register)

// login
router.post('/user/login',userController.login)

// add-posts
router.post('/posts/add',jwtMiddleware,multerConfig.single('recipeImage'),postController.addPosts)


// getUserPosts
router.get('/user/all-posts',jwtMiddleware,postController.getUserPosts)


// getallPosts
router.get('/posts/all',jwtMiddleware,postController.getallUsersPosts)

// this is for admin to list all posts..
router.get('/admin/posts/all',postController.getallUsersPostsForAdmin)

// find all users for admin
router.get('/admin/user/all',userController.getallUsers)

// delete user by id for admin
router.delete('/admin/user/delete/:id',userController.deleteUser)

// delete posts by id for admin
router.delete('/admin/posts/delete/:id',postController.deletepostsController)

// whopost
router.get('/user/:userid',userController.getWhoPost)

// edit posts 
router.put('/posts/edit/:id',jwtMiddleware,multerConfig.single("recipeImage"),postController.editPostController)

// delete posts 
router.delete('/posts/delete/:id',jwtMiddleware,postController.deletepostsController)

// edit user
router.put('/user/edit',jwtMiddleware,multerConfig.single("profile"),userController.editUser)

// get current user info
router.get('/user/me',jwtMiddleware,userController.getCurrentUser)


// like Post
router.post('/posts/like/:id',jwtMiddleware,postController.likePostController)

// unlike Post
router.post('/posts/unlike/:id',jwtMiddleware,postController.unlikePostController)

// Add comment to a post
router.post('/posts/:id/comment', jwtMiddleware, postController.addCommentController);
// Get all comments for a post
router.get('/posts/:id/comments', jwtMiddleware, postController.getCommentsController);
// Delete a comment from a post
router.delete('/posts/:postId/comments/:commentId', jwtMiddleware, postController.deleteCommentController);

// Like and unlike a comment
router.post('/posts/:postId/comments/:commentId/like', jwtMiddleware, postController.likeCommentController);
router.post('/posts/:postId/comments/:commentId/unlike', jwtMiddleware, postController.unlikeCommentController);

// Report a post
router.post('/posts/report', jwtMiddleware, postController.reportPostController);

// Get all reports (admin)
router.get('/admin/reports', postController.getAllReportsController);

// Delete a specific report (admin)
router.delete('/admin/reports/:reportId', postController.deleteReportController);


// export router
module.exports = router
