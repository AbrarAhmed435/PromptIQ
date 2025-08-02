from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from .models import Chat,ChatMessage
from rest_framework import permissions,generics
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer,EmailTokenObtainPairSerializer
from django.contrib.auth import get_user_model

from openai import OpenAI
client=OpenAI()

User=get_user_model()

# Create your views here.


        
class createUserView(generics.CreateAPIView):
    queryset=User.objects.all()
    serializer_class=RegisterSerializer
    permission_classes=[permissions.AllowAny]
    
    def create(self,request,*args,**kwargs):
        serializer=self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user=serializer.save()
        return Response({
            "message": "User registration successful",
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name
        }, status=status.HTTP_201_CREATED)

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class=EmailTokenObtainPairSerializer


   
def createChatTitle(user_message):
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "assistant", "content": "Give a short, descriptive title for this conversation in not more than 5 words."},
                {"role": "user", "content": user_message},
            ]
        )
        title = response.choices[0].message.content.strip()
    except Exception: 
        title = user_message[:50]
    return title

       
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def prompt_gpt(request):
    chat_id=request.data.get("chat_id")
    content=request.data.get("content")
    print(request.data)
    
    if not chat_id:
        return Response({"error":"Chat ID was not provide"},status=400)
    
    if not content:
        return Response({"error":"There was not prompt passed"},status=400)
    
    chat,created=Chat.objects.get_or_create(id=chat_id,defaults={"user":request.user}) #Tries to find a chat with the given UUID.If it doesn't exist, creates a new one with that ID.
    
    if chat.user!=request.user:
        return Response({"error":"Unauthorized acces to this chat"},status=403)


    if created or not chat.title:
        chat.title = createChatTitle(content)
        chat.save()
    
    chat_message=ChatMessage.objects.create(role="user",chat=chat,content=content)
    
    openai_messages = chat.messages.order_by("created_at")[:10]
    
    # openai_messages=[{"role":message.role,"content":message.content} for message in chat_message]
    openai_messages = [{"role": message.role, "content": message.content} 
                       for message in chat.messages.order_by("created_at")[:10] #collect last 10 messages for context
                       ]

    
    if not any(message["role"]=="assistant" for message in openai_messages):  #if message is first
        openai_messages.insert(0,{"role":"assistant","content":"You are a helpful assistant"})
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=openai_messages
        )
        openai_reply=response.choices[0].message.content
    except Exception as e:
        return Response({"Error": f"An errror from openAI{str(e)}"})
    
    ChatMessage.objects.create(role="assistant",content=openai_reply,chat=chat)
    return Response({"reply":openai_reply,'title':chat.title},status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def user_chats(request):
    chats = Chat.objects.filter(user=request.user).order_by("-created_at")
    data = [{"id": str(chat.id), "title": chat.title, "created_at": chat.created_at} for chat in chats]
    return Response(data)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_chat(request,chat_id):
    try:
        chat=Chat.objects.get(id=chat_id,user=request.user)
        chat.delete()
        return Response({"message":"chat deleted successfully"},status.HTTP_200_OK)
    except Chat.DoesNotExist:
        return Response({"error":"Chat not found or unauthorized acces"},status.HTTP_403_FORBIDDEN)
    

#TO LOAD ENTIRE CHAT HISTORY

""" 
@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def user_chat_history(request):
    user = request.user
    chats = Chat.objects.filter(user=user).order_by("-created_at")  # only their chats

    data = []
    for chat in chats:
        messages = ChatMessage.objects.filter(chat=chat).order_by("created_at")
        data.append({
            "chat_id": str(chat.id),
            "title": chat.title,
            "messages": [
                {"role": msg.role, "content": msg.content, "timestamp": msg.created_at}
                for msg in messages
            ]
        })

    return Response(data)

"""