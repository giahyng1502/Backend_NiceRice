const express = require("express");
const router = express.Router();

const {
    createMessageController,
    getMessagesByConversationId,
} = require("../controllers/message.controller");
const authenticate = require("../middleware/authMiddle");

// Tạo message mới
router.post("/send",authenticate, createMessageController);

// Lấy tất cả message theo conversationId
router.get("/getMessage", getMessagesByConversationId);

// Xóa message theo messageId

module.exports = router;
