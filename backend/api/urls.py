from django.urls import path,include
from rest_framework.routers import DefaultRouter
from . import views


# router=DefaultRouter()
# router = DefaultRouter()
# router.register(r'pdfs', views.UploadedPDFView.as_view(), basename='pdfs')

urlpatterns = [
    path("pdfs/", views.UploadedPDFView.as_view(), name="upload_pdf"),
    path("prompt_gpt/",views.prompt_gpt,name="prompt_api"),
    path("user/chats/",views.user_chats,name="user chats"),
    path("chat/delete/<uuid:chat_id>/",views.delete_chat,name="delete_chat"),
    path("chat/history/<uuid:chat_id>/",views.get_chat_conversation,name="get chat messages"),
    
    # path("",include(router.urls)),
]
