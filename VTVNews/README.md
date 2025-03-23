# VTV News Website

This project is a web application inspired by the Vietnam Television (VTV) news website. It's built with Node.js, Express, and Handlebars, featuring both a web UI and API controllers, and integrates with the NewsAPI for fetching the latest news content.

## Features

- Modern responsive design inspired by VTV.vn
- News categorization (Politics, Business, Entertainment, Sports, etc.)
- Article search functionality
- RESTful API endpoints for accessing news programmatically
- Integration with NewsAPI for real-time news content

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript, Handlebars
- **Backend**: Node.js, Express.js
- **API Integration**: NewsAPI
- **Package Manager**: Bun

## Project Structure

```
VTVNews/
├── controllers/         # Route controllers
│   ├── apiController.ts # API controllers for news API
│   └── newsController.ts # Controllers for web UI
├── models/              # Data models
├── public/              # Static assets
│   ├── css/             # Stylesheets
│   ├── js/              # Client-side JavaScript
│   └── images/          # Images
├── routes/              # Application routes
│   ├── apiRoutes.ts     # API routes
│   └── newsRoutes.ts    # Web UI routes
├── services/            # Service layer
├── utils/               # Utility functions
├── views/               # Handlebars templates
│   ├── layouts/         # Layout templates
│   └── partials/        # Partial templates
├── .env                 # Environment variables
├── .env.example         # Example environment variables
├── index.ts             # Application entry point
└── package.json         # Project dependencies
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [Bun](https://bun.sh/) package manager

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/vtv-news.git
cd vtv-news
```

2. Install dependencies
```bash
bun install
```

3. Create a `.env` file based on `.env.example` and add your NewsAPI key
```bash
cp .env.example .env
# Edit .env file to add your NewsAPI key
```

4. Start the development server
```bash
bun run dev
```

5. Open http://localhost:3000 in your browser

## API Endpoints

- `GET /api/news` - Get the latest news
- `GET /api/news/category/:category` - Get news by category
- `GET /api/news/:id` - Get a specific article by ID
- `GET /api/news/search?q=<query>` - Search for news articles

## Web UI Routes

- `/` - Home page
- `/category/:category` - Category page
- `/article/:id` - Single article page
- `/search?q=<query>` - Search results page

## License

This project is for educational purposes only. All rights to the VTV design and brand belong to their respective owners.

## Acknowledgements

- [NewsAPI](https://newsapi.org/) - Used for fetching news content
- [Express](https://expressjs.com/) - Web framework for Node.js
- [Handlebars](https://handlebarsjs.com/) - Templating engine
