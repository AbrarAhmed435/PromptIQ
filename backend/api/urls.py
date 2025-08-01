from django.urls import path
from . import views



urlpatterns = [
    path("prompt_gpt/",views.prompt_gpt,name="prompt_api"),
    path("user/chats/",views.user_chats,name="user chats"),
]
