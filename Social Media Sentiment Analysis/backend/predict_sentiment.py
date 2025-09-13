import tensorflow as tf
import os
import pickle
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import load_model


os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

MODEL_PATH = 'sentiment_model.h5'
model = load_model(MODEL_PATH)

tokenizer_path = 'tokenizer.pickle'

def load_tokenizer():
    global tokenizer
    with open(tokenizer_path, 'rb') as handle:
        tokenizer = pickle.load(handle)

load_tokenizer()


sentiment_classes = ['Negative', 'Neutral', 'Positive']

def predict(text):
    '''Function to predict sentiment class of the passed text'''
    
    max_len = 50
    xt = tokenizer.texts_to_sequences([text])
    xt = pad_sequences(xt, padding='post', maxlen=max_len)
    yt = model.predict(xt)
    yt_class = yt.argmax(axis=1)[0]
    confidence_score = float(yt[0][yt_class])
    return {'label': sentiment_classes[yt_class], 'score': confidence_score}

