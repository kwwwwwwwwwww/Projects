import cv2
import numpy as np
import imutils
import easyocr

# Reading the image from file path
img = cv2.imread('dataset/00X500.JPG')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Bilateral filter noise reduction and canny for edge detection
bfilter = cv2.bilateralFilter(gray, 11, 17, 17)
edged = cv2.Canny(bfilter, 30, 200)

# Find contours
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
    print("No contour detected")
    exit()

# Creating a mask for the license plate
mask = np.zeros(gray.shape, np.uint8)
masked = cv2.drawContours(mask, [location], 0,255, -1)
masked = cv2.bitwise_and(img, img, mask=mask)

# Croping the license plate
(x,y) = np.where(mask==255)
(x1, y1) = (np.min(x), np.min(y))
(x2, y2) = (np.max(x), np.max(y))
cropped_image = gray[x1:x2+1, y1:y2+1]

# EasyOCR 
reader = easyocr.Reader(['en'])
result = reader.readtext(cropped_image)

# Writing the result to result(OneImage).txt file
with open('result(OneImage).txt', 'a') as file:
    if not result:
        file.write("Nothing detected\n")
    else:
        for component in result:
            text = component[-2]
            confidence = component[-1]
            file.write(f"{text}, Confidence: {confidence}\n")

# Put the recognized text and draw rectangle around the license plate on the original image
font = cv2.FONT_HERSHEY_SIMPLEX
text = '\n'.join(f"{component[-2]}, Confidence: {component[-1]}" for component in result)
res = cv2.putText(img, text=text, org=(location[0][0][0], location[1][0][1]+60), 
                  fontFace=font, fontScale=1, color=(0,255,0), thickness=2, lineType=cv2.LINE_AA)
res = cv2.rectangle(img, tuple(location[0][0]), tuple(location[2][0]), (0,255,0),3)

# Display the images in windows
cv2.imshow('gray',gray)
cv2.imshow('edged',edged)
cv2.imshow('masked',masked)
cv2.imshow('Cropped',cropped_image)
cv2.imshow('result',res)

cv2.waitKey(0)
cv2.destroyAllWindows()
