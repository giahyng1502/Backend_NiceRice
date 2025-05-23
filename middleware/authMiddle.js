const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: {
                    code: '401',
                    message: 'Vui lòng đăng nhập trước khi thực hiện chức năng',
                    label: 'API_STATUS_UNAUTHORIZED'
                }
            });
        }

        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    status: {
                        code: '401',
                        message: 'Phiên đăng nhập của bạn đã kết thúc',
                        label: 'API_STATUS_TOKEN_EXPIRED'
                    }
                });
            }

            req.user = decoded; // Gán thông tin user vào req để controller dùng
            next();
        });
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            status: {
                code: '500',
                message: 'Có lỗi xảy ra khi xác thực người dùng',
                label: 'API_STATUS_AUTH_ERROR'
            }
        });
    }
};

module.exports = authenticate;
