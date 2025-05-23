const {
    PutItemCommand,
    QueryCommand,
    DeleteItemCommand,
} = require("@aws-sdk/client-dynamodb");
const client = require("../config/dynamoDb");
const { unmarshallItems } = require("../utils/unmarshallItems");
const { marshall } = require("@aws-sdk/util-dynamodb");

const TABLE_NAME = "ConversationParticipants";

// Thêm participant (quan hệ user - conversation)
async function addParticipant(userId, conversationId) {
    const params = {
        TableName: TABLE_NAME,
        Item: marshall({
            userId,
            conversationId,
        }),
        ConditionExpression: 'attribute_not_exists(userId) AND attribute_not_exists(conversationId)',
    };
    return client.send(new PutItemCommand(params));
}

// Lấy danh sách conversationId theo userId
async function getConversationIdsByUserId(userId) {
    const params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: marshall({ ":userId": userId }),
    };

    const res = await client.send(new QueryCommand(params));
    return unmarshallItems(res.Items);
}
async function getUserIdsConversation(conversationId) {
    const params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: "conversationId = :conversationId",
        ExpressionAttributeValues: marshall({ ":conversationId": conversationId }),
    };

    const res = await client.send(new QueryCommand(params));
    return unmarshallItems(res.Items);
}

// Xóa participant (quan hệ user - conversation)
async function deleteParticipant(userId, conversationId) {
    const params = {
        TableName: TABLE_NAME,
        Key: marshall({
            userId,
            conversationId,
        }),
    };

    return client.send(new DeleteItemCommand(params));
}

module.exports = {
    addParticipant,
    getConversationIdsByUserId,
    deleteParticipant,
    getUserIdsConversation
};
