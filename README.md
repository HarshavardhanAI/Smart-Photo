# Smart Photo Organiser
 
A face recognition web application that detects and identifies faces in photos using deep learning. Upload a group photo and the app will match every detected face against a registered database, returning the top 3 closest matches with confidence scores.
 
---
 
## Features
 
- **Face Registration** — Register a person with a name and photo. Duplicate detection prevents the same face from being added twice.
- **Group Photo Recognition** — Upload a photo with multiple people. Every face is detected, embedded, and matched independently.
- **Top 3 Match Results** — Each detected face returns up to 3 closest database matches with confidence scores, colour-coded for easy identification.
- **Annotated Output Image** — The result image is returned with coloured bounding boxes drawn around each identified face, hosted on Cloudinary.
- **Database Management** — View all registered persons and delete them individually.
- **Duplicate Guard** — Cosine similarity check (threshold 0.80) prevents duplicate face entries at registration time.
- **Rate Limiting** — API is rate-limited to prevent abuse and control infrastructure costs.
---
 
## Tech Stack
 
### Backend
| Tool | Purpose |
|------|---------|
| Flask | REST API server |
| RetinaFace | Face detection + landmark extraction |
| FaceNet (keras-facenet) | 512-dim face embedding generation |
| Pinecone | Vector database for similarity search |
| MongoDB Atlas | Person metadata storage |
| Cloudinary | Image hosting |
| OpenCV | Image processing, face alignment, annotation |
| Flask-Limiter | API rate limiting |
| Flask-CORS | Cross-origin request handling |
 
### Frontend
| Tool | Purpose |
|------|---------|
| React | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| React Router | Client-side routing |
 
---
 
## Architecture
 
```
Browser (React + Tailwind)
        │
        │  HTTP (multipart/form-data or JSON)
        ▼
Flask REST API (server.py)
        │
        ├── RetinaFace ──────────► Face detection + landmarks
        │
        ├── OpenCV ──────────────► Crop, align, resize face
        │
        ├── FaceNet ─────────────► Generate 512-dim embedding
        │
        ├── Pinecone ────────────► Vector similarity search (cosine)
        │
        ├── MongoDB Atlas ───────► Store / retrieve person metadata
        │
        └── Cloudinary ──────────► Host original + annotated images
```
 
### How matching works
 
1. Each face is cropped from the image with a 20% margin and aligned using eye landmarks.
2. FaceNet converts the 160×160 face crop into a normalised 512-dimensional vector.
3. Pinecone searches the vector index using cosine similarity and returns the top 3 closest matches.
4. Matches above the 0.65 threshold are returned as candidates. The highest scoring match is the best match.
---
 
## Folder Structure
 
```
Smart Photo Organiser/
│
├── Backend/
│   ├── server.py           # All Flask routes and ML pipeline
│   ├── .env                # Environment variables (not committed)
│   ├── requirements.txt    # Python dependencies
│   └── venv/               # Python virtual environment
│
└── Frontend/
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    │
    └── src/
        ├── api.js               # Axios/fetch API calls
        ├── App.jsx              # Root component + routes
        ├── Layout.jsx           # Shared page layout
        ├── main.jsx             # Entry point
        ├── index.css            # Global styles
        │
        └── components/
            ├── Navbar/
            │   ├── Navbar.jsx
            │   └── SideBar.jsx
            │
            ├── Dashborad/
            │   ├── Dashboard.jsx    # Main recognition page
            │   ├── ImagePreview.jsx # Upload preview
            │   ├── Analysing.jsx    # Loading state
            │   └── Results.jsx      # Results table + annotated image
            │
            ├── Add Image section/
            │   └── addImage.jsx     # Person registration form
            │
            ├── Database-section/
            │   └── database.jsx     # View + delete registered persons
            │
            ├── About section/
            │   └── About.jsx
            │
            └── Utility/
                └── Spinner.jsx
```
 
---
 
## API Endpoints
 
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/addperson` | Register a new person (name + image) |
| `POST` | `/dashboard` | Recognise faces in an uploaded image |
| `GET` | `/database` | Get all registered persons |
| `DELETE` | `/deleteperson` | Delete a person by name |
| `GET` | `/health` | Health check |
 
---
 
## Environment Variables
 
Create a `.env` file in the `Backend/` directory:
 
```env
PINECONE_API=your_pinecone_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
MONGO_USER=your_mongo_username
MONGO_PASS=your_mongo_password
MONGO_HOST=your_cluster.mongodb.net
MONGO_DB=your_database_name
ALLOWED_ORIGIN=http://localhost:5173
PORT=5000
```
 
---
 
## Getting Started
 
### Backend
 
```bash
cd Backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
 
pip install -r requirements.txt
python server.py
```
 
### Frontend
 
```bash
cd Frontend
npm install
npm run dev
```
 
---
 
## Thresholds
 
| Check | Threshold | Notes |
|-------|-----------|-------|
| Face detection confidence | 0.75 | Faces below this are skipped |
| Duplicate detection (add) | 0.80 cosine similarity | Prevents re-registering same face |
| Recognition match (dashboard) | 0.65 cosine similarity | Minimum score to count as a match |
 
Adjust these in `server.py` based on your dataset and accuracy requirements.
 
---
