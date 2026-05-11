# TaskFlow: Production-Grade MERN SaaS Platform

TaskFlow is a high-performance, multi-tenant SaaS task management platform built with the MERN stack. It features real-time collaboration, advanced project management, automated workflows, and a robust billing system powered by Stripe.

## 🚀 Key Features

- **Multi-Tenant Architecture**: Manage multiple workspaces with isolated data and custom settings.
- **Real-Time Collaboration**: Instant updates on tasks, comments, and project states using Socket.io.
- **Advanced Task Management**: Kanban boards, list views, and calendar integration.
- **Automated Workflows**: Set up custom rules to automate repetitive tasks.
- **Granular RBAC**: Role-Based Access Control (Owner, Admin, Member, Guest) at the workspace level.
- **Premium Billing**: Integrated Stripe subscriptions with tiered plans (Free, Pro, Team).
- **Interactive Analytics**: Visual insights into project performance and team productivity.
- **Google OAuth**: Seamless authentication with Google integration.
- **Responsive Design**: Fully optimized for dark and light modes with a premium UI/UX.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Redux Toolkit, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io.
- **Authentication**: JWT (Access & Refresh Tokens), Passport.js (Google OAuth).
- **Payments**: Stripe SDK & Webhooks.
- **Infrastructure**: PostCSS, ESLint, Prettier.

## 📦 Project Structure

```bash
TaskFlow/
├── backend/            # Express.js Server
│   ├── src/
│   │   ├── controllers/# Business logic
│   │   ├── models/     # Mongoose schemas
│   │   ├── routes/     # API endpoints
│   │   ├── services/   # External integrations (Stripe, Email)
│   │   └── utils/      # Helpers
├── frontend/           # React Application (Vite)
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Full-page views
│   │   ├── store/      # Redux state management
│   │   ├── services/   # API & Socket clients
│   │   └── styles/     # Global CSS & Tailwind
└── .gitignore          # Root-level ignore file
```

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/AishwariyaRaj/TaskFlow.git
cd TaskFlow
```

### 2. Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file from `.env.example` and fill in your credentials:
   - `MONGO_URI`
   - `JWT_SECRET` & `REFRESH_TOKEN_SECRET`
   - `STRIPE_SECRET_KEY`
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`
4. Start the development server: `npm run dev`

### 3. Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Create a `.env` file:
   - `VITE_API_URL=http://localhost:4000/api`
   - `VITE_API_WS=http://localhost:4000`
4. Start the Vite server: `npm run dev`

## 💳 Stripe Integration (Test Mode)

To set up subscriptions:
1. Run the Stripe setup script: `node backend/setup-stripe.js`
2. Install [Stripe CLI](https://stripe.com/docs/stripe-cli) and listen for webhooks:
   ```bash
   stripe listen --forward-to localhost:4000/api/webhooks/stripe
   ```
3. Copy the webhook secret to your backend `.env`.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built by [Aishwariya Raj](https://github.com/AishwariyaRaj)
