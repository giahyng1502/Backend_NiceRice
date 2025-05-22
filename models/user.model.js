
const {
    PutItemCommand,
    GetItemCommand,
    UpdateItemCommand,
    DeleteItemCommand, ScanCommand,
} = require("@aws-sdk/client-dynamodb");
const client = require("../config/dynamoDb")
const {unmarshallItems} = require("../utils/unmarshallItems");
// Tên bảng DynamoDB
const { marshall } = require("@aws-sdk/util-dynamodb");
const TABLE_NAME = "User";

async function createUser(user) {
    const params = {
        TableName: TABLE_NAME,
        Item: marshall({
            userId: user.userId,
            userName: user.userName,
            password: user.password,
            email: user.email,
            phoneNumber: user.phoneNumber,
            avatarUrl: user.avatarUrl,
            timeStamp: new Date().toISOString(),
        }),
        ConditionExpression: 'attribute_not_exists(userId)',
    };

    const command = new PutItemCommand(params);
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
    return unmarshallItems(response.Items);
}
const getAllUsers = async () => {
    const params = {
        TableName: 'User',
    };

    try {
        const data = await client.send(new ScanCommand(params));
        console.log(data);
        return unmarshallItems(data.Items);  // <- đúng là Items, mảng các item
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
                       avatarUrl = :avatarUrl,
                       timeStamp = :timeStamp`,
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
            ":timeStamp": new Date().toISOString(),
        }),
        ReturnValues: "ALL_NEW",
    };

    const command = new UpdateItemCommand(params);
    const response = await client.send(command);
    return response.Attributes ? unmarshallItems(response.Attributes) : null;
}


// Xóa user theo userId
async function deleteUser(userId) {
    const params = {
        TableName: TABLE_NAME,
        Key: marshall({ userId }),
    };

    const command = new DeleteItemCommand(params);
    return client.send(command);
}


module.exports = {
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    getAllUsers
};
