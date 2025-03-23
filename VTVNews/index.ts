import express from 'express';
import { engine, create } from 'express-handlebars';
import path from 'path';
import dotenv from 'dotenv';
import axios from 'axios';
import { registerHelpers } from './utils/handlebarsHelpers';

// Import routes
import newsRoutes from './routes/newsRoutes';
import apiRoutes from './routes/apiRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 5000;

// Create Handlebars instance
const handlebars = create({
  defaultLayout: 'main',
  extname: '.handlebars',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    eq: function (a: any, b: any) {
      return a === b;
    },
    gt: function (a: any, b: any) {
      return a > b;
    },
    lt: function (a: any, b: any) {
      return a < b;
    },
    formatDate: function (date: string) {
      if (!date) return '';

      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };

      return new Date(date).toLocaleDateString('vi-VN', options);
    },
    truncate: function (text: string, length: number) {
      if (!text) return '';

      if (text.length <= length) return text;

      return text.substring(0, length) + '...';
    },
    add: function (a: number, b: number) {
      return a + b;
    },
    subtract: function (a: number, b: number) {
      return a - b;
    }
  }
});

// Set up view engine
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', newsRoutes);
app.use('/api', apiRoutes);

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).render('error', {
    title: 'Not Found',
    message: 'The page you are looking for does not exist'
  });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Server Error',
    message: 'Something went wrong on the server'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
