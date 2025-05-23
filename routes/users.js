const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

// Tạo user mới
router.post("/sing-In", userController.singIn);

router.post("/login", userController.login);

// Lấy user theo userId
router.get("/getProfile/", userController.getUserById);

// Lấy tất cả user
router.get("/getAll", userController.getAllUsers);

// Cập nhật user theo userId
router.put("/update/:userId", userController.updateUser);


module.exports = router;
