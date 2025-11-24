# AI Communication Scoring Tool

This project provides an AI-powered tool for evaluating spoken communication transcripts. It analyzes transcripts based on multiple criteria including clarity, content quality, engagement, and language proficiency.

## Project Structure

```
.
├── backend/           # FastAPI backend service
│   ├── api/           # API route definitions
│   ├── models/        # Data models and schemas
│   ├── utils/         # Utility functions
│   ├── main.py        # Application entry point
│   └── requirements.txt # Python dependencies
├── frontend/          # React frontend application
│   ├── public/        # Static assets
│   └── src/           # Source code
│       ├── components/ # React components
│       └── ...         # Other React source files
└── README.md          # This file
```

## Features

- **Multi-Criteria Analysis**: Evaluates transcripts based on four key criteria:
  - Clarity and Articulation (25%)
  - Content Quality (30%)
  - Engagement (20%)
  - Language Proficiency (25%)
- **Keyword Detection**: Identifies relevant keywords in the transcript
- **Semantic Similarity**: Uses sentence transformers to understand context and meaning
- **Word Count Compliance**: Ensures optimal transcript length
- **Detailed Feedback**: Provides actionable insights for improvement

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run the backend server:
   ```bash
   python main.py
   ```

   The backend API will be available at `http://localhost:8000`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The frontend will be available at `http://localhost:3000`.

## API Endpoints

- `GET /` - Health check endpoint
- `POST /score` - Score a communication transcript
- `GET /rubric` - Get the current scoring rubric

## Testing

To test the backend API, run the test script:

```bash
cd backend
python test_script.py
```

## Deployment

### Backend Deployment

For production deployment, consider using a platform like Heroku, AWS, or Google Cloud Platform. You'll need to:

1. Set environment variables:
   - `FRONTEND_URL`: The URL of your frontend application (for CORS)
   - `RUBRIC_FILE`: Path to a custom rubric Excel file (optional)

2. Use a production WSGI server like Gunicorn:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
   ```

### Frontend Deployment

For production deployment, build the React application:

```bash
cd frontend
npm run build
```

The build artifacts will be in the `build/` directory, which can be served by any static file server.

## Docker Deployment

This project includes Docker support for easy deployment:

1. Build and run the containers:
   ```bash
   docker-compose up --build
   ```

2. The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:8000`.

## Customization

### Rubric Customization

You can customize the scoring rubric by creating an Excel file named `rubric.xlsx` with the following columns:
- `name`: Criterion name
- `description`: Criterion description
- `keywords`: Comma-separated list of keywords
- `weight`: Weight of the criterion (0.0 to 1.0)
- `min_words`: Minimum recommended word count
- `max_words`: Maximum recommended word count

Place this file in the backend directory, and the application will automatically use it.

Example `rubric.xlsx` structure:
| name | description | keywords | weight | min_words | max_words |
|------|-------------|----------|--------|-----------|-----------|
| Clarity and Articulation | Clear pronunciation and well-structured sentences | clear, articulate, precise, understandable | 0.25 | 50 | 500 |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.