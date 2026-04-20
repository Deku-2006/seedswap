# 🌱 SeedSwap

A full-stack community marketplace for trading seeds, with real-time chat and AI-powered gardening tools.

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | Next.js 14, TailwindCSS, TypeScript |
| Backend    | Node.js, Express                  |
| Database   | MongoDB (Mongoose)                |
| Auth       | JWT (email/password)              |
| Real-time  | Socket.io                         |
| AI         | Google Gemini 1.5 Flash           |
| Images     | Cloudinary                        |

## Features

- 🔐 JWT Authentication (Register / Login)
- 🌿 Seed Listings Marketplace (Browse, Create, Edit, Delete)
- 💬 Real-time Chat (Socket.io + MongoDB persistence)
- 🤖 AI Assistant:
  - Seed Identifier (upload photo → Gemini identifies it)
  - Growing Recommendations (personalized tips by location)
  - Planting Calendar (monthly breakdown)
- 🌍 Multi-language UI support (EN, HI, BN, TA, ML)
- 🖼️ Cloudinary image uploads
- 📱 Responsive sidebar layout

---

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (free tier works)
- Google Gemini API key ([get one here](https://aistudio.google.com/))

---

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd seedswap
```

### 2. Set up Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your actual values
npm install
npm run dev
```

### 3. Set up Frontend

```bash
cd ../frontend
cp .env.example .env
# .env values are already correct for local dev
npm install
npm run dev
```

### 4. Open the app

Visit [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/seedswap
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## Docker (Optional)

```bash
# Create a root .env with your secrets
cp backend/.env.example .env

# Build and run all services
docker-compose up --build
```

---

## Project Structure

```
seedswap/
├── backend/
│   ├── config/          # DB & Cloudinary setup
│   ├── controllers/     # Route handlers
│   ├── middleware/       # JWT auth middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── socket/          # Socket.io setup
│   └── server.js        # Entry point
│
├── frontend/
│   ├── app/             # Next.js App Router pages
│   │   ├── browse/      # Marketplace
│   │   ├── listings/    # Create, view, my listings
│   │   ├── chat/        # Real-time messaging
│   │   ├── ai-assistant/# AI tools
│   │   ├── auth/        # Login/Register
│   │   └── profile/     # User profile
│   ├── components/      # Reusable UI components
│   ├── context/         # Zustand auth store
│   ├── hooks/           # Custom hooks
│   └── lib/             # API client, socket, utils
│
└── docker-compose.yml
```

---

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET  | `/api/auth/me` | Get current user |
| PUT  | `/api/auth/profile` | Update profile |

### Listings
| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/listings` | Browse all listings |
| GET    | `/api/listings/my` | My listings |
| GET    | `/api/listings/:id` | Single listing |
| POST   | `/api/listings` | Create listing |
| PUT    | `/api/listings/:id` | Update listing |
| DELETE | `/api/listings/:id` | Delete listing |

### Chat
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/chat/create` | Get or create chat |
| GET  | `/api/chat` | My chats |
| GET  | `/api/chat/:id/messages` | Messages in chat |
| POST | `/api/chat/:id/messages` | Send message |

### AI
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai/identify-seed` | Identify seed from image |
| POST | `/api/ai/growing-recommendations` | Get growing tips |
| POST | `/api/ai/planting-calendar` | Get planting calendar |

---

## Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join:chat` | Client → Server | Join a chat room |
| `leave:chat` | Client → Server | Leave a chat room |
| `send:message` | Client → Server | Send a message |
| `new:message` | Server → Client | New message received |
| `typing:start` | Client → Server | User started typing |
| `typing:stop` | Client → Server | User stopped typing |
| `chat:updated` | Server → Client | Chat list refresh needed |

---

## License

MIT
