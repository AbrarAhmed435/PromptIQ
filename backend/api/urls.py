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
    path('improve/prompt/',views.improvePrompt,name="imporve_prompt"),
    path("chat/delete/<uuid:chat_id>/",views.delete_chat,name="delete_chat"),
    path("chat/history/<uuid:chat_id>/",views.get_chat_conversation,name="get chat messages"),
    path("chat/<uuid:chat_id>/download-pdf/",views.download_latest_response_pdf,name="download pdf"),
    path("choose/model/",views.ChooseModelView.as_view(),name="choose model"),
    path("forgot-password/",views.ForgotPasswordView.as_view(),name="Forgot email"),
    path("reset-password/<uidb64>/<token>/",views.ResetPasswordView.as_view(),name="reset-password")
    # path("choose/model/",views.ChooseModelView.as_view(),name="choose model"),
    
    # path("",include(router.urls)),
]
