
const {
    PutItemCommand,
    DeleteItemCommand,
    ScanCommand, BatchGetItemCommand, QueryCommand, BatchWriteItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall} = require("@aws-sdk/util-dynamodb");
const client = require("../config/dynamoDb");
const {unmarshallItems} = require("../utils/unmarshallItems");
//
const TABLE_NAME = 'ParticipantConversations';

const addParticipants = async (userIds, conversationId) => {
    const putRequests = userIds.map(userId => ({
        PutRequest: {
            Item: marshall({
                userId,
                conversationId,
                createdAt: new Date().toISOString()
            })
        }
    }));

    const params = {
        RequestItems: {
            [TABLE_NAME]: putRequests
        }
    };

    try {
        await client.send(new BatchWriteItemCommand(params));
        console.log('Participants added successfully');
    } catch (err) {
        console.error('Failed to add participants:', err);
    }
};


const kickParticipant = async (userId, conversationId) => {
    const params = {
        TableName: TABLE_NAME,
        Key: marshall({ userId, conversationId }),
    };

    try {
        await client.send(new DeleteItemCommand(params));
        console.log(`Deleted participant ${userId} from conversation ${conversationId}`);
    } catch (error) {
        console.error("Failed to delete participant:", error);
        throw error;
    }
};

const getConversationIdByUserId = async (userId) => {
    const params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: 'userId = :uid',
        ExpressionAttributeValues: {
            ':uid': { S: userId }
        }
    };

    try {
        const response = await client.send(new QueryCommand(params));
        // map về object dễ đọc
        return unmarshallItems(response.Items);
    } catch (error) {
        console.error('Error fetching participants:', error);
        throw error;
    }
};

const getUserIdByConversation = async (conversationId) => {
    const params = {
        TableName: TABLE_NAME,
        IndexName : "conversationId-index",
        KeyConditionExpression: 'conversationId = :cId',
        ExpressionAttributeValues: {
            ':cId': { S: conversationId }
        }
    };

    try {
        const response = await client.send(new QueryCommand(params));
        // map về object dễ đọc
        return unmarshallItems(response.Items);
    } catch (error) {
        console.error('Error fetching participants:', error);
        throw error;
    }
};
module.exports = {
    addParticipants,
    getConversationIdByUserId
}
