const {
    createConversation,
    getAllConversations,
    deleteConversation,
    getConversationsByUserId, getConversationItemsByIds,
} = require("../models/conversation.model");
const {addParticipant, getConversationIdsByUserId, deleteParticipant, getUserIdsConversation} = require("../models/conversation.Participants.model");
const {getConversationIdByUserId, addParticipants} = require("../models/participantConversations.model");
const {createConversationId} = require("../utils/createConversationId");
const client = require("../config/dynamoDb");
const {GetItemCommand} = require("@aws-sdk/client-dynamodb");
const {marshall} = require("@aws-sdk/util-dynamodb");
CONVERSATION_TABLE = "Conversation";
async function createConversationController(req, res) {
    try {

        const conversation = req.body;
        const conversationId = createConversationId(conversation.participantIds, conversation.isGroup);

        // Nếu là private chat thì kiểm tra conversation đã tồn tại
        if (!conversation.isGroup) {
            const existing = await client.send(new GetItemCommand({
                TableName: CONVERSATION_TABLE,
                Key: marshall({ conversationId })
            }));

            if (existing.Item) {
                console.log('Conversation already exists:', conversationId);
                return res.status(200).json({
                    message: "Conversation already exists",
                });
            }
        }
        conversation.conversationId = conversationId
        // Tạo conversation mới
        const result = await createConversation(conversation);

        if (result.$metadata.httpStatusCode !== 200) {
            return res.status(500).json({ error: "Failed to create conversation" });
        }
        await addParticipants(conversation.participantIds,conversationId);
        return res.status(201).json({
            message: "Conversation created successfully",
        });

    } catch (error) {
        console.error("Error in createConversationController:", error);
        return res.status(500).json({ error: "Failed to create conversation" });
    }
}



async function getConversationsController(req, res) {
    try {
        const userId = req.user.userId
        const conversations = await getConversationIdByUserId(userId);
        const keys = conversations.map(conv => ({ conversationId: { S: conv.conversationId } }));
        const data = await getConversationItemsByIds(keys)
        res.json({
            conversations : data,
        });
    } catch (error) {
        console.error("Error getting conversations:", error);
        res.status(500).json({ error: "Failed to get conversations" });
    }
}

async function deleteConversationController(req, res) {
    try {
        const { conversationId } = req.params;
        await deleteConversation(conversationId);

        res.json({ message: "Conversation deleted" });
    } catch (error) {
        console.error("Error deleting conversation:", error);
        res.status(500).json({ error: "Failed to delete conversation" });
    }
}

module.exports = {
    createConversationController,
    getConversationsController,
    deleteConversationController,
};
