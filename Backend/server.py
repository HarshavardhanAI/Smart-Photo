from flask import Flask, jsonify, request
from flask_cors import CORS
import cv2 as cv
import numpy as np
import os
from retinaface import RetinaFace
from keras_facenet import FaceNet
from pinecone import Pinecone, ServerlessSpec
import uuid
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from pymongo import MongoClient
from urllib.parse import quote_plus
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import random 

load_dotenv(dotenv_path=".env")
#----------------- falsk config--------------------
app = Flask(__name__)
origins = os.getenv("ALLOWED_ORIGIN", "http://localhost:5173")
CORS(
    app,
    resources={r"/*": {"origins":  origins}},
    supports_credentials=True
)

#--------------- facenet intialisation--------------- 
embedder = FaceNet()

#------------------- pinecone confg----------------
pc = Pinecone(
    api_key=os.getenv("PINECONE_API")
)

index_name = "face-recognition-v2"

# Create index if not exists
existing_indexes = [i.name for i in pc.list_indexes()]

if index_name not in existing_indexes:
    pc.create_index(
        name=index_name,
        dimension=512,  # FaceNet embedding size
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        )
    )
# -----------------cloudinary config ------------------------------------
index = pc.Index(index_name)
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

# -------------------- mongo db setup----------------------------------- 
user = quote_plus(os.getenv("MONGO_USER"))
password = quote_plus(os.getenv("MONGO_PASS"))
host = os.getenv("MONGO_HOST")
db_name = os.getenv("MONGO_DB")
MONGO_URI = f"mongodb+srv://{user}:{password}@{host}/{db_name}?retryWrites=true&w=majority"
client = MongoClient(MONGO_URI)
db = client[db_name]
users_collection = db["users"]

#------------------ limilt request to handle cost-------------------
limiter = Limiter(get_remote_address, app=app, default_limits=["20 per minute"])

#--------------helper functions-------------------------------------- 
def align_face(img, left_eye, right_eye):
    dx = right_eye[0] - left_eye[0]
    dy = right_eye[1] - left_eye[1]
    
    angle = np.degrees(np.arctan2(dy, dx))
    
    center = ((left_eye[0] + right_eye[0]) // 2,
              (left_eye[1] + right_eye[1]) // 2)
    
    M = cv.getRotationMatrix2D(center, angle, 1)
    aligned = cv.warpAffine(img, M, (img.shape[1], img.shape[0]))
    
    return aligned

def read_file(file):
    file_bytes = file.read()
    np_arr = np.frombuffer(file_bytes, np.uint8)
    img_bgr = cv.imdecode(np_arr, cv.IMREAD_COLOR)
    img_rgb = cv.cvtColor(img_bgr, cv.COLOR_BGR2RGB)
    return img_rgb, img_bgr

def extract_face_embeddings(img,face):
    x1, y1, x2, y2 = face["facial_area"]
    h, w, _ = img.shape
    face_w = x2-x1
    face_h = y2-y1
    print(f"[DEBUG] facial_area: {x1},{y1},{x2},{y2} | img size: {w}x{h}")
    # Step 1: Crop with margin
    margin = 0.3 if (face_w < 80 or face_h < 80) else 0.2
    dx = int((x2 - x1) * margin)
    dy = int((y2 - y1) * margin)
    x1, y1 = max(0, x1 - dx), max(0, y1 - dy)
    x2, y2 = min(w, x2 + dx), min(h, y2 + dy)
    face_img = img[y1:y2, x1:x2]
    print(f"[DEBUG] face crop shape: {face_img.shape}")  # 👈 is it (0,0,3)?


    # Step 2: Align using landmarks
    landmarks = face["landmarks"]
    left_eye  = (landmarks["left_eye"][0]  - x1, landmarks["left_eye"][1]  - y1)
    right_eye = (landmarks["right_eye"][0] - x1, landmarks["right_eye"][1] - y1)
    print(f"[DEBUG] left_eye: {left_eye}, right_eye: {right_eye}") 
    face_img = align_face(face_img, left_eye, right_eye)

    if face_img.size == 0:
        return None

    # Step 3: Resize + normalize
    face_img = cv.resize(face_img, (160, 160))
    face_img = face_img.astype("float32")
    face_img = np.expand_dims(face_img, axis=0)

    # Step 4: Embed + normalize
    embedding = embedder.embeddings(face_img)[0]
    norm = np.linalg.norm(embedding)
    print(f"[DEBUG] embedding norm: {norm}") 
    if norm == 0:
        return None

    return embedding / norm

def generate_unique_colour(n):
    colors = []
    for _ in range(n):
        hue = random.randint(0,179)
        saturation = random.randint(150,255)
        value = random.randint(180,255)

        hsv_pixel = np.uint8([[[hue,saturation,value]]])
        bgr_pixel = cv.cvtColor(hsv_pixel,cv.COLOR_HSV2BGR)
        bgr = [int(x) for x in bgr_pixel[0][0]]
        r, g, b = bgr[2], bgr[1], bgr[0]
        hex_color = f"#{r:02x}{g:02x}{b:02x}"
        colors.append({"bgr": bgr, "hex": hex_color})
    return colors

def draw_face_box(img,face_data):
    annotated = img.copy()
    for person in face_data:
        x1,y1,x2,y2 = person["box"]
        color =  tuple(person["color_bgr"])
        cv.rectangle(annotated,(x1,y1),(x2,y2),color,3)
    return annotated

#-------------- routes--------------------------------------------- 

@app.route("/addperson",methods=["POST"])
@limiter.limit("5 per minute")
def add_person():
    name = request.form.get("name")
    file = request.files.get("image")
    
    if not name or not file:
        return jsonify({"status": "error", "message": "name or image missing"}),400

    img_rgb, img_bgr = read_file(file)
    faces = RetinaFace.detect_faces(img_rgb)

    if faces is None or faces == {}:
        return jsonify({"status":"no face","message":"no face is detected"}),200
    if isinstance(faces, dict) and len(faces) > 1:
        return jsonify({"status":"multiple faces","message":"more than one face is in image"}),200

    face = list(faces.values())[0]

    if face["score"]>0.75:
        embedding = extract_face_embeddings(img_rgb,face)
        if embedding is None:
            return jsonify({"status": "error", "message": "invalid face crop"}), 400
        #duplicate logic part 
        query_response = index.query(
                vector=embedding.tolist(),
                top_k=1,
                include_metadata=True,
                include_values=True
        )

        matches = query_response.get("matches", [])
        if matches:
            match = matches[0]
            score = matches[0].get("score",0)
            duplicate_threshold = 0.80
            if score>=duplicate_threshold:
                return jsonify({
                    "status":"duplicate",
                    "messagae":"person is already in db",
                    "similarity":score,
                    "matched_name" : match.get("metadata",{}).get("name")
                }),200
        # upload to cloundinary 
        _, buffer = cv.imencode(".jpg",img_bgr)
        upload_result = cloudinary.uploader.upload(buffer.tobytes())
        image_url = upload_result["secure_url"]
        # upload to mongo db
        users_collection.insert_one({
        "name": name,
        "image_url": image_url
        })

        unique_id = str(uuid.uuid4())

        index.upsert([
        (
            unique_id,
            embedding.tolist(),
            {"name": name,
            "image_url":image_url
            }
        )
        ])
        
        return jsonify({
            "status":"success",
            "message":"image is uploaded to model"
        }),200

    else:
        return jsonify({
            "status": "low confidence",
            "message": "face detection confidence too low"
        }),200

@app.route("/dashboard",methods=["POST"])
def dashboard():
    file = request.files.get("image")
    if not file:
        return jsonify({"status": "error", "message": "image missing"}),400
    img_rgb, img_bgr = read_file(file)
    faces = RetinaFace.detect_faces(img_rgb)
    list_of_faces_found = []
    if faces is None or faces == {}:
        return jsonify({"status":"no_face","message":"no face is detected"}),200
    for face in faces.values():
        if face["score"]>0.75:
            embedding = extract_face_embeddings(img_rgb, face)
            if embedding is None:
                continue
            #querying pinecone 
            query_response = index.query(
                vector=embedding.tolist(),
                top_k=3,
                include_metadata=True,
            )

            matches = query_response.get("matches", [])
            if not matches:
                continue
            threshold = 0.65
            candidates = []
            for match in matches:
                score = match.get("score",0)
                if score>= threshold:
                    candidates.append({
                    "name": match.get("metadata", {}).get("name"),
                    "image_url": match.get("metadata", {}).get("image_url"),
                    "confidence": round(score * 100, 2),
                    })
            if not candidates:
                continue
            x1, y1, x2, y2 = face["facial_area"]
            list_of_faces_found.append({
                "box": (x1, y1, x2, y2),
                "best_match": candidates[0]["name"],  
                "candidates": candidates,           
            })
    if len(list_of_faces_found) == 0:
        return jsonify({
        "status": "no_match",
        "message": "No known faces found"
    }),200
    colors = generate_unique_colour(len(list_of_faces_found))
    for i, person in enumerate(list_of_faces_found):
        person["color_bgr"] = colors[i]["bgr"]
        person["color_hex"] = colors[i]["hex"]

    # Draw only colored boxes 
    annotated_img = draw_face_box(img_bgr, list_of_faces_found)
    _, buffer = cv.imencode(".jpg", annotated_img)
    
    upload_result = cloudinary.uploader.upload(buffer.tobytes())
    image_url = upload_result["secure_url"]
    results = [
    {
        "best_match": p["best_match"],
        "candidates": p["candidates"],
        "color": p["color_hex"],
    }
    for p in list_of_faces_found
    ]
    return jsonify({
    "status": "success",
    "faces_found": len(list_of_faces_found),
    "results": results,
    "image_url" : image_url
    }),200


@app.route("/database", methods=["GET"])
def get_database():
    users = list(users_collection.find({}, {"_id": 0}))
    
    return jsonify({
        "status": "success",
        "data": users
    }),200

@app.route("/deleteperson",methods=["DELETE"])
def delete_person():
    data = request.get_json()
    name = data.get("name")
    if not name:
        return jsonify({"status":"error","message":"name is required"}),400
    user = users_collection.find_one({"name":name})
    if not user :
        return jsonify({"status":"error","message":"person not found"}),400
    result = index.query(
        vector=[0.0] * 512,
        top_k=1,
        include_metadata=True,
        filter={"name": {"$eq": name}}
    )
    matches = result.get("matches", [])
    if matches:
        vector_id = matches[0]["id"]
        index.delete(ids=[vector_id])

    # Step 3: Delete from MongoDB
    users_collection.delete_one({"name": name})

    return jsonify({
        "status": "success",
        "message": f"{name} deleted successfully"
    }), 200

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}),200

if __name__=="__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
