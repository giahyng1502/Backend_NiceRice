
const {
    PutItemCommand,
    GetItemCommand,
    UpdateItemCommand,
    DeleteItemCommand, ScanCommand, QueryCommand,
} = require("@aws-sdk/client-dynamodb");
const client = require("../config/dynamoDb")
const {unmarshallItems} = require("../utils/unmarshallItems");
// Tên bảng DynamoDB
const { marshall, unmarshall} = require("@aws-sdk/util-dynamodb");
const {createUserId} = require("../utils/createConversationId");

const TABLE_NAME = "Users";

async function createUser(user) {
    const userId = createUserId();
    console.log("Creating user with id ", userId);
    const params = {
        TableName: TABLE_NAME,
        Item: marshall({
            userId: userId,
            userName: user.userName,
            password: user.password,
            email: user.email,
            phoneNumber: user.phoneNumber,
            avatarUrl: user.avatarUrl,
            timeStamp: new Date().toISOString(),
        }),
        ConditionExpression: 'attribute_not_exists(email)'
    };

    const command = new PutItemCommand(params);
    return client.send(command);
}
async function getUserByEmail(email) {
    const params = {
        TableName: TABLE_NAME,
        IndexName: 'email-index',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: marshall({
            ':email': email,
        }),
    };

    const command = new QueryCommand(params);
    return client.send(command);
}


// Lấy user theo userId
async function getUserById(userId) {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            userId: { S: userId },
        },
    };

    const command = new GetItemCommand(params);
    const response = await client.send(command);
    return unmarshallItems(response.Item);
}
const getAllUsers = async () => {
    const params = {
        TableName: TABLE_NAME,
    };

    try {
        const data = await client.send(new ScanCommand(params));
        console.log(data);
        return unmarshallItems(data.Items);
    } catch (error) {
        console.error("Error scanning users:", error);
        throw error;
    }
};


async function updateUser(userId, user) {
    const params = {
        TableName: TABLE_NAME,
        Key: marshall({ userId }),
        UpdateExpression: `SET #un = :userName,
                       #pw = :password,
                       email = :email,
                       phoneNumber = :phoneNumber,
                       avatarUrl = :avatarUrl`,
        ExpressionAttributeNames: {
            "#un": "userName",
            "#pw": "password",
        },
        ExpressionAttributeValues: marshall({
            ":userName": user.userName,
            ":password": user.password,
            ":email": user.email,
            ":phoneNumber": user.phoneNumber,
            ":avatarUrl": user.avatarUrl,
        }),
        ReturnValues: "ALL_NEW",
    };

    const command = new UpdateItemCommand(params);
    return client.send(command);
}


// Xóa user theo userId
// async function deleteUser(userId) {
//     const params = {
//         TableName: TABLE_NAME,
//         Key: marshall({ userId }),
//     };
//
//     const command = new DeleteItemCommand(params);
//     return client.send(command);
// }


module.exports = {
    createUser,
    getUserById,
    updateUser,
    getAllUsers,
    getUserByEmail
};
