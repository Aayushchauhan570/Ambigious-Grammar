# Grammar Ambiguity Checker

A full-stack web application that checks whether a **Context-Free Grammar (CFG)** is ambiguous by generating all possible parse trees for a given input string using the **Earley Parsing Algorithm**.

![Grammar Ambiguity Checker](https://img.shields.io/badge/Status-Working-brightgreen) ![Node.js](https://img.shields.io/badge/Node.js-v18+-green) ![React](https://img.shields.io/badge/React-18-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

- **Grammar Input** — Enter production rules in standard notation (e.g., `E -> E + E | E * E | id`)
- **Ambiguity Detection** — Uses the Earley parsing algorithm to find all valid parse trees
- **Parse Tree Visualization** — Interactive D3.js tree diagrams with zoom, pan, and hover tooltips
- **Sample Grammars** — Pre-loaded examples including ambiguous expressions, unambiguous expressions, and dangling else
- **Export as PNG** — Download parse tree diagrams as high-resolution images
- **Token Preview** — See how your input string is tokenized
- **Grammar Details** — View start symbol, non-terminals, terminals, and production count
- **Error Handling** — Descriptive error messages for invalid grammars, unparseable strings, and more

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Vite), Tailwind CSS v3, D3.js |
| Backend | Node.js, Express.js |
| Algorithm | Earley Parser |

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd grammar-ambiguity-checker
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server** (Terminal 1)
   ```bash
   cd backend
   node server.js
   ```
   The API will be running at `http://localhost:5001`

2. **Start the frontend dev server** (Terminal 2)
   ```bash
   cd frontend
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

## 📖 How It Works

### Algorithm: Earley Parser

The application uses the **Earley parsing algorithm**, which is superior to CYK for this use case because:

- **No CNF conversion needed** — Works directly on arbitrary CFGs
- **Handles left recursion** — No need to transform the grammar
- **Efficient** — O(n³) worst case, O(n²) for unambiguous grammars
- **Complete** — Finds ALL valid parse trees

The algorithm works in three phases at each input position:

1. **Prediction** — When the dot is before a non-terminal, add all its productions
2. **Scanning** — When the dot is before a terminal matching the current token, advance
3. **Completion** — When a rule is fully recognized, advance the dot in parent items

### Ambiguity Detection

After parsing, the algorithm extracts all distinct parse trees from the Earley chart. If more than one tree exists for the same string, the grammar is **ambiguous**.

## 📝 Grammar Format

```
NonTerminal -> symbol symbol | symbol
```

- **Non-terminals**: Uppercase letters (e.g., `E`, `T`, `F`, `S`)
- **Terminals**: Lowercase letters, operators, keywords (e.g., `id`, `+`, `*`, `(`, `)`)
- **Arrow**: Use `->` or `→`
- **Alternation**: Use `|` to separate alternatives
- **Symbols**: Separate with spaces

### Examples

**Ambiguous Grammar:**
```
E -> E + E | E * E | id
```
Test string: `id + id * id` → **2 parse trees** (ambiguous!)

**Unambiguous Grammar:**
```
E -> E + T | T
T -> T * F | F
F -> ( E ) | id
```
Test string: `id + id * id` → **1 parse tree** (not ambiguous)

## 📁 Project Structure

```
grammar-ambiguity-checker/
├── backend/
│   ├── server.js                  # Express server entry point
│   ├── package.json
│   ├── controllers/
│   │   └── grammarController.js   # API controller with error handling
│   ├── routes/
│   │   └── grammarRoutes.js       # Express routes
│   └── parser/
│       ├── grammarParser.js       # Parses raw grammar text → structured object
│       ├── tokenizer.js           # Grammar-aware tokenizer
│       ├── earleyParser.js        # Full Earley parser implementation
│       └── ambiguityChecker.js    # Orchestrates parse + ambiguity check
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                # Main app with state management
│       ├── index.css              # Design system (Tailwind + custom)
│       └── components/
│           ├── Header.jsx         # App header with gradient title
│           ├── GrammarInput.jsx   # Grammar textarea + sample buttons
│           ├── StringInput.jsx    # Test string input + token preview
│           ├── ResultDisplay.jsx  # Ambiguity verdict + grammar details
│           └── ParseTreeViewer.jsx # D3.js tree visualization
└── README.md
```

## 🔌 API Reference

### POST `/api/check-ambiguity`

**Request:**
```json
{
  "grammar": "E -> E + E | E * E | id",
  "string": "id + id * id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ambiguous": true,
    "treeCount": 2,
    "message": "Grammar is AMBIGUOUS — 2 distinct parse tree(s) found.",
    "parseTrees": [...],
    "grammarInfo": {
      "startSymbol": "E",
      "nonTerminals": ["E"],
      "terminals": ["+", "*", "id"],
      "productionCount": 3
    },
    "tokens": ["id", "+", "id", "*", "id"]
  }
}
```

### GET `/api/health`

Health check endpoint. Returns `{ "status": "ok" }`.

## 🎨 UI Design

- **Dark theme** with glassmorphism cards
- **Gradient accents** (purple → blue → cyan)
- **Animated results** with slide-up transitions
- **Interactive parse trees** with zoom/pan and tooltips
- **Responsive layout** for all screen sizes

## 🚀 Deployment

The project is production-ready. In production mode, the **backend serves both the API and the React frontend** from a single server.

### Build for Production

```bash
# 1. Build the frontend
cd frontend
npm run build

# 2. Start the backend in production mode
cd ../backend
NODE_ENV=production node server.js
```

The entire app will be available at `http://localhost:5001` (or the `PORT` environment variable).

### Deploy to Render (Free)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `cd ../frontend && npm install && npm run build && cd ../backend && npm install`
   - **Start Command**: `NODE_ENV=production node server.js`
   - **Environment Variable**: `NODE_ENV` = `production`

### Deploy to Railway

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub**
3. Configure:
   - **Root Directory**: `/`
   - **Build Command**: `cd frontend && npm install && npm run build && cd ../backend && npm install`
   - **Start Command**: `cd backend && NODE_ENV=production node server.js`

### Deploy to Vercel (Frontend) + Render (Backend)

If you prefer separate deployments:
1. Deploy `frontend/` to Vercel
2. Deploy `backend/` to Render
3. Set the `VITE_API_URL` environment variable in Vercel to your Render backend URL (e.g., `https://your-backend.onrender.com/api`)

## 📄 License

MIT License — feel free to use this project for educational purposes.
