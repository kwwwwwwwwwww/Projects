from django import forms
from .models import Sentiment

class SentimentForm(forms.ModelForm):
    Sentence = forms.CharField(max_length=120, widget=forms.TextInput(
        attrs={
            'class':'form-control',
        }
    ))
    class Meta:
        model = Sentiment
        fields = [
            'Sentence'
        ]