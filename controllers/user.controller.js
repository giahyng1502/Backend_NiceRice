// controllers/userController.js

const userModel = require("../models/user.model");
const {unmarshall} = require("@aws-sdk/util-dynamodb");

// Tạo user mới
const createUser = async (req, res) => {
    try {
        const { userId, name, email } = req.body;

        if (!userId || !name || !email) {
            return res.status(400).json({ error: "userId, name và email là bắt buộc" });
        }

        await userModel.createUser({ userId, name, email });
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Lấy user theo userId
const getUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await userModel.getUserById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Chuyển từ DynamoDB AttributeValue sang object thường
        const userObj = {
            userId: user.userId.S,
            name: user.name.S,
            email: user.email.S,
        };

        res.status(200).json(userObj);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await userModel.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error getting users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Cập nhật user theo userId
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: "name và email là bắt buộc" });
        }

        const updatedUser = await userModel.updateUser(userId, { name, email });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Chuyển DynamoDB AttributeValue sang object thường
        const userObj = {
            userId: updatedUser.userId.S,
            name: updatedUser.name.S,
            email: updatedUser.email.S,
        };

        res.status(200).json(userObj);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Xóa user theo userId
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        await userModel.deleteUser(userId);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    createUser,
    getUser,
    updateUser,
    deleteUser,
    getUsers
};
