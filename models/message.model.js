const {
    PutItemCommand,
    QueryCommand
} = require("@aws-sdk/client-dynamodb");
const client = require("../config/dynamoDb");
const { unmarshallItems } = require("../utils/unmarshallItems");
const { marshall } = require("@aws-sdk/util-dynamodb");
const {createMessageId} = require("../utils/createConversationId");

const TABLE_NAME = "Messages";

// Tạo message mới
async function createMessage(message) {
    const params = {
        TableName: TABLE_NAME,
        Item: marshall({
            messageId: createMessageId(),
            conversationId: message.conversationId,
            senderId: message.senderId,
            content: message.content,
            timestamp: new Date().toISOString(),
            type: message.type,
            link: message.link || [],          // optional array
            status: message.status || "sent"
        }, { removeUndefinedValues: true }),
        ConditionExpression: 'attribute_not_exists(messageId)',
    };
    return client.send(new PutItemCommand(params));
}
// Lấy tất cả message trong một conversation
async function getMessagesByConversationId(conversationId) {
    const params = {
        TableName: TABLE_NAME,
        IndexName: "conversationId-timestamp-index",  // nhớ tạo GSI với conversationId nếu chưa có
        KeyConditionExpression: "conversationId = :conversationId",
        ExpressionAttributeValues: marshall({ ":conversationId": conversationId }),
        ScanIndexForward: false
    };

    const res = await client.send(new QueryCommand(params));
    return unmarshallItems(res.Items);
}

module.exports = {
    createMessage,
    getMessagesByConversationId,
};
