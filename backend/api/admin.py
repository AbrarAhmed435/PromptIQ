from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from api.models import Chat,ChatMessage,CustomUser
from django.contrib.auth import get_user_model

# Register your models here.
CustomUser = get_user_model()

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('username', 'email', 'is_staff')
    

@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    model=Chat
    list_display=("id","title","created_at")
    
@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    model=ChatMessage
    list_display=("id","role","content","created_at")
