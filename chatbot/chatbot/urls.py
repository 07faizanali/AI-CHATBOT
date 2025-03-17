from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

# Simple home view
def home(request):
    return HttpResponse("Welcome to the AI Chatbot API!")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('chatbot_api.urls')),  # Includes chatbot_api URLs
    path('', home),  # Handles root URL ("/")
]
