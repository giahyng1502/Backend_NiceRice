const express = require("express");
const router = express.Router();

const {
    createConversationController,
    getConversationsController
} = require("../controllers/conversation.controller");
const authenticate = require("../middleware/authMiddle");

// Tạo cuộc hội thoại (hoặc nhóm)
router.post("/create", createConversationController);
//
// Lấy tất cả conversation
router.get("/getAll", authenticate, getConversationsController);
//
// // Xóa cuộc hội thoại theo ID
// router.delete("/conversations/:conversationId", deleteConversationController);
//

module.exports = router;
