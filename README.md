# AI CRM Assistant

A production-ready AI CRM Assistant mini-project demonstrating Agentic AI using Node.js, Express, PostgreSQL, Prisma, GROQ API, JSON Web Tokens (JWT), and Zod validation.

## Quick Start

1. Start the PostgreSQL Database
```bash
docker-compose up -d
```

2. Install Backend Dependencies
```bash
cd backend
npm install
```

3. Configure Environment
Update your `.env` file in the `backend` folder with your actual `GROQ_API_KEY` and change `JWT_SECRET`.
```env
PORT=3000
DATABASE_URL="postgresql://crm_user:crm_password@localhost:5432/crm_db?schema=public"
JWT_SECRET="your_secret_key"
GROQ_API_KEY="gsk_..."
```

4. Push Prisma Schema to Database
```bash
npx prisma db push
```

5. Start the Server
```bash
npm run dev
```

6. Run the integration tests using Postman, Insomnia or VS Code's REST Client using `tests.http`.
