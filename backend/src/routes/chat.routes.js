import express from 'express';
import { processChat } from '../controllers/chat.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = express.Router();

// JWT auto required
router.post('/', verifyJWT, processChat);

export default router;
