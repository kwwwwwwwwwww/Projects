 with open('result.txt', 'a') as file:
        if not result:
            file.write(f"{index}: {image_path}: Nothing detected\n")
        else:
            for i, component in enumerate(result):
                text = component[-2]
                confidence = component[-1]
                file.write(f"{index}: {image_path}: {i}: {text}, Confidence: {confidence}\n")