from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from api.models import Chat,ChatMessage,CustomUser,UploadedPDF
from django.contrib.auth import get_user_model

# Register your models here.
CustomUser = get_user_model()

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('username', 'email', 'is_staff','preferred_bot')
    fieldsets = UserAdmin.fieldsets + (
        ("Bot Preference", {"fields": ("preferred_bot",)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Bot Preference", {"fields": ("preferred_bot",)}),
    )
    

@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    model=Chat
    list_display=("id","title","created_at")
    
@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    model=ChatMessage
    list_display=("id","role","content","created_at")


@admin.register(UploadedPDF)
class UploadedPDFAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'chat', 'pdf_file', 'uploaded_at')
    search_fields = ('user__username', 'chat__id')


