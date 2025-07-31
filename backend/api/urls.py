from django.urls import path
from . import views



urlpatterns = [
    path("prompt_gpt/",views.prompt_gpt,name="prompt_api"),
]
