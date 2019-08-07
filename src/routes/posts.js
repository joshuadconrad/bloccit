const express = require("express");
const postController = require("../controllers/postController");
const router = express.Router();

router.get("/topics/:topicId/posts/new", postController.new);
router.post("/topics/:topicId/posts/create", postController.create);
router.get("/topics/:topicId/posts/:id", postController.show);
router.post("/topics/:topicId/posts/:id/destroy", postController.destroy);

module.exports = router;
