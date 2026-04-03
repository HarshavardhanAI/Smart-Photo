from flask import Flask,jsonify,request
from flask_cors import CORS
import cv2 as cv
import numpy as np
from retinaface import RetinaFace
from keras_facenet import FaceNet

app = Flask(__name__)
CORS(app)
embedder = FaceNet()

@app.route("/")
def home():
    return jsonify({"message":"hello world"})

@app.route("/addperson",methods=["POST"])
def add_person():
    name = request.form.get("name")
    file = request.files.get("image")
    # reading image
    file_bytes = np.frombuffer(file.read(), np.uint8)
    img = cv.imdecode(file_bytes, cv.IMREAD_COLOR)
    # face detection 
    faces = RetinaFace.detect_faces(img)
    
    if len(faces) ==0:
        return jsonify({"status":"no face","message":"no face is detected"})
    if len(faces) >1:
        return jsonify({"status":"multiple faces","message":"more than one face is in image"})

    face = faces["face_1"]
    if face["score"]>0.90:
        x,y,w,h = face["facial_area"]
        face_img = img[y:y+h,x:x+w]
        # upload to cloundinary 

        # resize and convert it to vector 
        face_img = cv.resize(face_img,(160,160))
        face_img = face_img.astype("float32")
        face_mean = face_img.mean()
        face_std = face_img.std()
        face_img = (face_img - face_mean) / face_std
        face_img = np.expand_dims(face_img, axis=0)
        embedding = embedder.embeddings(face_img)

        # store it in vector db 
        
    return jsonify({
        "status":"sucess",
        "message":"image is uploaded to model"
    })

if __name__=="__main__":
    app.run(debug=True)
