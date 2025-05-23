const userService = require('../models/user.model');
const bcrypt = require("bcryptjs");
const {unmarshall} = require("@aws-sdk/util-dynamodb");
const {getUserByEmail, createUser} = require("../models/user.model");
const jwt = require("jsonwebtoken");
const {unmarshallItems} = require("../utils/unmarshallItems");
const {generateAccessToken} = require("../utils/genarateToken");
const redis = require("../config/redis");
// Tạo user mới
async function singIn(req, res) {
    try {
        const userData = req.body;
        userData.password = await bcrypt.hash(userData.password, 12);

        const checkEmail = await getUserByEmail(userData.email);
        if (checkEmail.Count > 0) {
            return res.status(400).json({message:"Email already exists"});
        }
        const user = await createUser(userData);
        return res.status(201).json({ message: "User created successfully",...user });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Failed to create user", detail: error.message });
    }
}
//
async function login(req, res) {
    try {
        const { email, password } = req.body;

        const userByEmail = await getUserByEmail(email);
        if (userByEmail.Count === 0) {
            return res.status(400).json({
                status: {
                    code: '400',
                    message: "Tài khoản này chưa được đăng ký",
                    label: "API_STATUS_ACCOUNT_NOT_FOUND"
                }
            });
        }

        const user = unmarshallItems(userByEmail.Items)[0];
        const comparePassword = await bcrypt.compare(password, user.password);
        if (!comparePassword) {
            return res.status(400).json({
                status: {
                    code: '400',
                    message: "Thông tin tài khoản hoặc mật khẩu không chính xác",
                    label: "API_STATUS_INVALID_CREDENTIALS"
                }
            });
        }

        const token = generateAccessToken({ userId: user.userId, email: user.email });

        const { password: _password, ...profile } = user;

        return res.status(200).json({
            message : 'Đăng nhập thành công',
            token,
            profile
        });

    } catch (error) {
        console.error("Error login user:", error);
        res.status(500).json({
            message : 'Đăng nhập thất bại : ',error,
            detail: error.message
        });
    }
}

async function getUserById(req, res) {
    try {
        const { userId } = req.params;
        const user = await userService.getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.error("Error getting user:", error);
        res.status(500).json({ error: "Failed to get user" });
    }
}

// Lấy tất cả user

async function getAllUsers(req, res) {
    try {
        // const cacheKey = 'all_users';
        //
        // // 1️⃣ Kiểm tra dữ liệu trong cache trước
        // const cachedData = await redis.get(cacheKey);
        // if (cachedData) {
        //     console.log("Lấy data từ cache");
        //     return res.status(200).json(JSON.parse(cachedData));
        // }

        // 2️⃣ Nếu chưa có thì query DB
        const users = await userService.getAllUsers();

        // 3️⃣ Lưu vào cache (ví dụ giữ cache trong 60 giây)
        // await redis.set(cacheKey, JSON.stringify(users), 'EX', 60);

        res.status(200).json(users);
    } catch (error) {
        console.error("Error getting all users:", error);
        res.status(500).json({ error: "Failed to get users" });
    }
}

// Cập nhật user theo userId
async function updateUser(req, res) {
    try {
        const { userId } = req.params;
        const userData = req.body;
        const updatedUser = await userService.updateUser(userId, userData);
        const {$metadata,Attributes}  = updatedUser;
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found or nothing updated" });
        }
        res.json({ message: "User updated successfully", user: unmarshall(Attributes), status : $metadata });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Failed to update user", detail: error.message });
    }
}

// async function deleteUser(req, res) {
//     try {
//         const { userId } = req.params;
//         await userService.deleteUser(userId);
//         res.json({ message: "User deleted successfully" });
//     } catch (error) {
//         console.error("Error deleting user:", error);
//         res.status(500).json({ error: "Failed to delete user" });
//     }
// }

module.exports = {
    singIn,
    getUserById,
    getAllUsers,
    updateUser,
    login
    // deleteUser,
};
