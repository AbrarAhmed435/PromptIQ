from django.urls import path
from . import views



urlpatterns = [
    path("prompt_gpt/",views.prompt_gpt,name="prompt_api"),
    path("user/chats/",views.user_chats,name="user chats"),
    path("chat/delete/<uuid:chat_id>/",views.delete_chat,name="delete_chat"),
    path("chat/history/<uuid:chat_id>/",views.get_chat_conversation,name="get chat messages"),
]
