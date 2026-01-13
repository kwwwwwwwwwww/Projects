import cv2
import numpy as np
import imutils
import easyocr
import os

# Function to process an image
def process_image(image_path, index):
    global total_samples, successful_samples, failure_samples
    
    # Increment total samples count
    total_samples += 1

    # Reading the image from file path
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Bilateral filter noise reduction and canny for edge detection
    bfilter = cv2.bilateralFilter(gray, 11, 17, 17)
    edged = cv2.Canny(bfilter, 30, 200)

    # Finding contours
    keypoints = cv2.findContours(edged.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    contours = imutils.grab_contours(keypoints)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:10]
    location = None

    # Finding the approximate location of the license plate
    for contour in contours:
        approx = cv2.approxPolyDP(contour, 10, True)
        if len(approx) == 4:
            location = approx
            break

    if location is None:
        with open('result(AllImage).txt', 'a') as file:
            file.write(f"{index}: {image_path}: No contour detected\n")
        print(f"No contour detected in {image_path}")
        failure_samples += 1
        return

    # Increment successful samples count
    successful_samples += 1

    # Creating a mask for the license plate
    mask = np.zeros_like(gray, dtype=np.uint8)
    cv2.drawContours(mask, [location], -1, (255), -1)

    # Croping the license plate
    (x,y) = np.where(mask==255)
    if len(x) == 0 or len(y) == 0:
        print(f"No contour detected in {image_path}")
        failure_samples += 1
        return
    (x1, y1) = (np.min(y), np.min(x))
    (x2, y2) = (np.max(y), np.max(x))
    cropped_image = gray[y1:y2+1, x1:x2+1]

    # EasyOCR
    reader = easyocr.Reader(['en'])
    result = reader.readtext(cropped_image, detail=1)  

    # Filter out smaller text components
    filtered_result = []
    for detection in result:
        text = detection[1]
        confidence = detection[2]
        if len(text) > 2:  
            filtered_result.append((text, confidence))

    # Writing the result to result(AllImage).txt file
    with open('result(AllImage).txt', 'a') as file:
        if not filtered_result:
            file.write(f"{index}: {image_path}: No relevant text detected\n")
        else:
            for i, (text, confidence) in enumerate(filtered_result):
                file.write(f"{index}: {image_path}: {i}: Text: {text}, Confidence: {confidence}\n")

    # Put the recognized text and draw rectangle around the license plate on the original image
    font = cv2.FONT_HERSHEY_SIMPLEX
    text = '\n'.join(f"{i}: {text}" for i, (text, _) in enumerate(filtered_result))  
    res = cv2.putText(img.copy(), text=text, org=(location[0][0][0], location[1][0][1]+60), 
                      fontFace=font, fontScale=1, color=(0,255,0), thickness=2, lineType=cv2.LINE_AA)
    res = cv2.rectangle(res, tuple(location[0][0]), tuple(location[2][0]), (0,255,0),3)

    # Outputing the result image to a output folder
    output_dir = 'output'
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, f"output_{index}.png")
    cv2.imwrite(output_path, res)


# Initialize global variables for sample statistics
total_samples = 0
successful_samples = 0
failure_samples = 0

# images directory
current_dir = os.path.dirname(os.path.abspath(__file__))
image_dir = os.path.join(current_dir, 'dataset')
index = 0

# image processing 
for filename in os.listdir(image_dir):
    if filename.endswith(".png") or filename.endswith(".jpg") or filename.endswith(".jfif") or filename.endswith(".jpeg"):
        image_path = os.path.join(image_dir, filename)
        process_image(image_path, index)
        index += 1
    else:
        print(f"Skipping non-image file: {filename}")

# Calculate success ratio
success_ratio = (successful_samples / total_samples) * 100

# Print sample statistics
print(f"Total samples: {total_samples}")
print(f"Successful samples: {successful_samples}")
print(f"Failure samples: {failure_samples}")
print(f"Success ratio: {success_ratio:.2f}%")
