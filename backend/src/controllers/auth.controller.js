import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const register = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword }
        });

        res.status(201).json({ success: true, userId: user.id });
    } catch (err) {
        next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '1h' });
        res.json({ success: true, token });
    } catch (err) {
        next(err);
    }
};
