// controllers/messageController.js
const messageService = require('../models/message.model');

// Tạo message mới
async function createMessageController(req, res) {
    try {
        const messageData = req.body;
        messageData.sender = req.user.userId;
        const result = await messageService.createMessage(messageData);
        res.status(201).json({ message: "Message created", data: result });
    } catch (error) {
        console.error("Error creating message:", error);
        res.status(500).json({ error: "Failed to create message" });
    }
}
// Lấy tất cả message trong một conversation
async function getMessagesByConversationId(req, res) {
    try {
        const { conversationId } = req.query;
        const messages = await messageService.getMessagesByConversationId(conversationId);
        res.json(messages);
    } catch (error) {
        console.error("Error getting messages:", error);
        res.status(500).json({ error: "Failed to get messages" });
    }
}



module.exports = {
    createMessageController,
    getMessagesByConversationId,
};
