import jwt from 'jsonwebtoken';

export const verifyJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'Access Denied: No Token Provided!' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Invalid or Expired Token' });
    }
};
