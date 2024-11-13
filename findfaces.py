import cv2
import dlib
import os
import imutils
import time
import base64
from PIL import Image

#Convert image to rgb
def format_image(image_path):
    img = Image.open(image_path)
    #print(img.mode)
    if img.mode != 'L' and img.mode != 'RGB':
        print(img.mode)
        img = img.convert('RGB')
        img.save(image_path)


def encode_image_to_base64(image):
    """Encode a NumPy image array to a Base64 string."""
    _, buffer = cv2.imencode('.jpg', image)
    base64_str = base64.b64encode(buffer).decode('utf-8')
    return base64_str

def find_faces(image_path):
    #Ensure image is in RGB format or grayscale
    format_image(image_path)
    # Load the pre-trained Dlib face detector
    detector = dlib.get_frontal_face_detector()

    # Load the image
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError("Image not found or unable to open")
    
    # Detect faces in the image, 2nd param is upsample amount
    faces = detector(image, 1)  

    face_images_base64 = []
    for face in faces:
        # Extract face coordinates
        x, y, w, h = (face.left(), face.top(), face.right() - face.left(), face.bottom() - face.top())
        # Ensure the face is completely visible
        x = max(x - 10, 0)
        y = max(y - 10, 0)
        w = min(x + w + 20, image.shape[1])
        h = min(y + h + 20, image.shape[0])
        
        # Extract face from the image
        face_img = image[y:h, x:w]
        
        # Encode the face image to Base64
        face_img_base64 = encode_image_to_base64(face_img)
        face_img_base64='data:image/jpeg;base64,'+face_img_base64
        face_images_base64.append(face_img_base64)
    
    return face_images_base64
"""
# Function to find faces in an image
def find_faces_save(image_path, output_folder='tmp/faces'+str(time.time())): 
    #Ensure image is in RGB format or grayscale
    format_image(image_path)
    # Load the pre-trained Dlib face detector
    detector = dlib.get_frontal_face_detector()

    # Load the image
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError("Image not found or unable to open")
    
    # Detect faces in the image
    faces = detector(image, 1)  
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    face_images = []
    print(enumerate(faces))
    for i, face in enumerate(faces):
        #print("Face found")
        # Extract face coordinates
        x, y, w, h = (face.left(), face.top(), face.right() - face.left(), face.bottom() - face.top())
        
        # Ensure the face is completely visible
        x = max(x - 10, 0)
        y = max(y - 10, 0)
        w = min(x + w + 20, image.shape[1])
        h = min(y + h + 20, image.shape[0])
        
        # Extract face from the image
        face_img = image[y:h, x:w]
        
        # Save the face image
        face_filename = os.path.join(output_folder, f'face_{i+1}.jpg')
        cv2.imwrite(face_filename, face_img)
        face_images.append(face_filename)
    
    return face_images
"""
#print("Dlib version:", dlib.__version__)
#find_faces(input())
#find_faces_save('images/BB1p0l5timgw700')