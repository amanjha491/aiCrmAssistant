import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Zod Validation Schema Setup
const leadSchema = z.object({
    name: z.string().min(1, "Name is required"),
    city: z.string().min(1, "City is required"),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(10, "Phone number must be at least 10 digits")
});

export const processChat = async (req, res, next) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ success: false, error: 'Valid string message is required' });
        }

        // 1. Craft exact GROQ Prompt
        const groqPrompt = `Extract CRM lead data as JSON from: '${message}'.
Schema: {name: string, city: string, email: string, phone: string}.
Return ONLY valid JSON, no explanations.`;

        // 2. Call GROQ API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: groqPrompt }],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.1 // Low temperature for deterministic JSON output
            })
        });

        if (!response.ok) {
            throw new Error(`GROQ API error: ${response.statusText}`);
        }

        const data = await response.json();
        let aiResponseText = data.choices[0].message.content.trim();

        // Remove markdown codeblock artifacts if LLM accidentally outputs them
        aiResponseText = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();

        // 3. Parse JSON & Validate with Zod
        let parsedData;
        try {
            parsedData = JSON.parse(aiResponseText);
        } catch (parseError) {
            return res.status(422).json({ success: false, error: 'LLM returned malformed JSON', rawOutput: aiResponseText });
        }

        // 4. Validate with Zod
        const validatedData = leadSchema.safeParse(parsedData);

        if (!validatedData.success) {
            return res.status(400).json({
                success: false,
                error: 'AI extracted invalid validation parameters',
                details: validatedData.error.errors
            });
        }

        // 5. Save to PostgreSQL via Prisma
        const newLead = await prisma.lead.create({
            data: validatedData.data
        });

        // 6. Return Success
        res.status(201).json({ success: true, leadId: newLead.id, data: newLead });

    } catch (error) {
        next(error);
    }
};
