const {
    PutItemCommand,
    DeleteItemCommand,
    ScanCommand, BatchGetItemCommand, QueryCommand, GetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const client = require("../config/dynamoDb");
const { unmarshallItems } = require("../utils/unmarshallItems");
const { marshall, unmarshall} = require("@aws-sdk/util-dynamodb");
const {getConversationIdsByUserId} = require("./conversation.Participants.model");
const {v4} = require("uuid");
const {addParticipants} = require("./participantConversations.model");
const {createConversationId} = require("../utils/createConversationId");
const {response} = require("express");
const CONVERSATION_TABLE = "Conversation";

// Tạo conversation mới
async function createConversation(conversation) {
    try {
        const params = {
            TableName: CONVERSATION_TABLE,
            Item: marshall({
                conversationId: conversation.conversationId,
                lastUpdated: conversation.lastUpdated || new Date().toISOString(),
                unreadCount: conversation.unreadCount || 1,
                lastMessagePreview: conversation.lastMessagePreview,
                groupName: conversation.groupName || null,
                groupAvatar: conversation.groupAvatar || null,
                isGroup: conversation.isGroup || false,
                lastSenderName: null,
            })
        };

        return await client.send(new PutItemCommand(params));

    } catch (error) {
        console.error('Error creating conversation:', error);
        throw error;  // ném lại lỗi để service phía trên biết xử lý tiếp
    }
}




async function getConversationItemsByIds(keys) {
    const params = {
        RequestItems: {
            [CONVERSATION_TABLE]: {
                Keys: keys,
            },
        },
    };

    const res = await client.send(new BatchGetItemCommand(params));
    return unmarshallItems(res.Responses[CONVERSATION_TABLE]);
}


// Xóa conversation
async function deleteConversation(conversationId) {
    const params = {
        TableName: CONVERSATION_TABLE,
        Key: marshall({ conversationId }),
    };

    return client.send(new DeleteItemCommand(params));
}


async function getConversationsByUserId(userId) {
    const params = {
        TableName: CONVERSATION_TABLE,
        FilterExpression: 'contains(participantIds, :userId)',
        ExpressionAttributeValues: {
            ':userId': { S: userId }
        },

    };


    try {
        const command = new QueryCommand(params);
        const response = await client.send(command);
        return response.Items;  // danh sách conversation
    } catch (error) {
        console.error('Error querying conversations:', error);
        throw error;
    }
}


module.exports = {
    createConversation,
    deleteConversation,
    getConversationsByUserId,
    getConversationItemsByIds
};
