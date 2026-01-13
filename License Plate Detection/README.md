License Plate Recognition (LPR) using OpenCV and EasyOCR
Overview

This project implements an end-to-end License Plate Recognition (LPR) system using computer vision and optical character recognition (OCR) techniques. The system detects vehicle license plates from images, extracts the plate region, and recognises the characters using Python, OpenCV, and EasyOCR.

The project focuses on building a complete image processing pipeline, from preprocessing and contour detection to text extraction and result evaluation, with an emphasis on accuracy and robustness under varying image conditions.

Key Features

License plate detection using OpenCV contour analysis

Image preprocessing with grayscale conversion, bilateral filtering, and edge detection

Automatic cropping of detected license plate regions

Text recognition using EasyOCR with confidence scoring

Batch processing for evaluating multiple images

Single-image mode for detailed step-by-step analysis and debugging

Project Structure
├── dataset/                      # Input images
├── output/                       # Output images with detected plates and text
├── LPR-Recognition-AllImage.py   # Batch processing of multiple images
├── LPR-Recognition-OneImage.py   # Single image processing and visualisation
├── result(AllImage).txt          # OCR results with confidence scores

Approach

Image Preprocessing

Read input images using OpenCV

Convert images to grayscale

Apply bilateral filtering to reduce noise while preserving edges

Perform edge detection using the Canny algorithm

License Plate Detection

Detect contours from edge-detected images

Sort contours by area and identify quadrilateral shapes

Select the most likely contour representing a license plate

Plate Extraction

Create a mask for the detected license plate

Crop the plate region from the original image

Text Recognition

Apply EasyOCR to extract license plate characters

Filter short or low-quality detections

Record recognised text with confidence scores

Output Generation

Save annotated images with bounding boxes and recognised text

Store OCR results and confidence values in a text file

Dataset

This project uses publicly available datasets from Kaggle:

Car Plate Detection Dataset

Car Number Plate Detection Dataset

The datasets contain images captured under different lighting conditions, backgrounds, and plate orientations, providing realistic challenges for license plate detection.

Experimental Results

Total samples evaluated: 133 images

Successful detections: 112 images

Failed detections: 21 images

Detection success rate: 84.21%

Each successful detection includes the recognised license plate text along with its OCR confidence score.

Example Output

The system produces:

Intermediate images (grayscale, edge-detected, cropped plate)

Final output images with bounding boxes and recognised text

Confidence scores indicating OCR reliability

Technologies Used

Python

OpenCV

EasyOCR

NumPy

Imutils

Limitations & Future Improvements

Detection accuracy can be affected by poor lighting and extreme plate angles

Future improvements could include:

Integrating deep learning-based detection models (e.g. CNNs)

Improving robustness for real-time video processing

Enhancing OCR accuracy for different plate styles and fonts

Purpose

This project demonstrates practical experience in computer vision, OCR, and end-to-end data processing pipelines, with a focus on building interpretable and reproducible solutions.