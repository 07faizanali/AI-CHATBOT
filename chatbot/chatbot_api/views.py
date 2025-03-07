import os
import google.generativeai as genai
from dotenv import load_dotenv
from rest_framework.response import Response
from rest_framework.decorators import api_view

load_dotenv()  # Load API key from .env file
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

@api_view(['POST'])
def chatbot_response(request):
    user_message = request.data.get("message", "")
    if not user_message:
        return Response({"error": "No message provided"}, status=400)

    model = genai.GenerativeModel("gemini-1.5-pro")  # Change model name

    response = model.generate_content(user_message)
    bot_message = response.text

    return Response({"response": bot_message})

