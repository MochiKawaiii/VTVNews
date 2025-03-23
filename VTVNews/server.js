// This file is used for Netlify deployment
import app from './index.js';

// Start the server on the port specified by Netlify or fallback to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
