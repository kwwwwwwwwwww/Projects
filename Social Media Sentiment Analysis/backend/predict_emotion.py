import pickle
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
import time

TOKENIZER_PATH = 'Emotiontokenizer.pickle'
with open(TOKENIZER_PATH, 'rb') as handle:
    tokenizer = pickle.load(handle)

MODEL_PATH = 'emotion.h5'
model = load_model(MODEL_PATH)

def normalized_sentence(sentence):
    return sentence.lower()

def decode_emotion(result):
    emotion_map = {0: 'joy', 1: 'anger', 2: 'love', 3: 'sadness', 4: 'fear', 5: 'surprise'}
    return emotion_map[result]

def predictEmotion(text):
    start_time = time.time()
    text = normalized_sentence(text)
    sequences = tokenizer.texts_to_sequences([text])
    padded_sequences = pad_sequences(sequences, maxlen=80, padding='post')
    prediction = model.predict(padded_sequences)
    result = np.argmax(prediction, axis=-1)[0]
    emotion = decode_emotion(result)
    proba = np.max(prediction)
    elapsed_time = time.time() - start_time
    return {"emotion": emotion, "probability": float(proba), "elapsed_time": elapsed_time}
