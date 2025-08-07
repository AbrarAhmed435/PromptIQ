import uuid
from django.db import models
from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractUser
from django.conf import settings

# Create your models here.

# Register your models here.
# admin.site.register(User)
class CustomUser(AbstractUser):
    email=models.EmailField(unique=True)
    
    def __str__(self):
        return self.username
    


class Chat(models.Model):
    id=models.UUIDField(default=uuid.uuid4,primary_key=True,editable=False);
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='chats',null=True)
    title=models.CharField(max_length=255,blank=True,null=True);
    created_at=models.DateTimeField(auto_now_add=True);
    
    def __str__(self):
        return self.title or f"session {self.id}"
    
class ChatMessage(models.Model):
    ROLES = (("assistant","assistenat"),("user","user"))
    chat =models.ForeignKey(Chat,on_delete=models.CASCADE,related_name="messages")
    role=models.CharField(max_length=15,choices=ROLES)
    content=models.TextField()
    created_at=models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.role}: {self.content[:50]}"
    
class UploadedPDF(models.Model):
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
    chat=models.ForeignKey('Chat',on_delete=models.CASCADE,related_name="pdfs",null=True,blank=True)
    pdf_file=models.FileField(upload_to='pdfs/')
    uploaded_at=models.DateTimeField(auto_now_add=True)
    text_content=models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.pdf_file.name} for {self.user.username} (chat: {self.chat_id})"
    