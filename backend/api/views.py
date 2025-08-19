from django.shortcuts import render
from rest_framework import status,viewsets
from rest_framework.views import APIView
from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from .models import Chat,ChatMessage,UploadedPDF
from rest_framework import permissions,generics
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer,EmailTokenObtainPairSerializer,UploadedPDFSerializer
from django.contrib.auth import get_user_model
from rest_framework.parsers import MultiPartParser,FormParser
from rest_framework.exceptions import ValidationError
import fitz
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

import PyPDF2

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

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def improvePrompt(request):
    user_message=request.data.get("message","")
    if not user_message:
        return Response({"error":"No message provided"},status=400)
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
               {"role": "system", "content": "You are a Prompt Optimizer. Your task is to imporve this prompt. Dont start like this :Here’s an improved version of your prompt for a more detailed and engaging response:, directly give the prompt"},

                {"role": "user", "content": user_message},
            ]
        )
        prompt = response.choices[0].message.content.strip()
    except Exception: 
        prompt=user_message
    return Response({"betterprompt":prompt},status=200)
        
   
def createChatTitle(user_message):
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
               {"role": "system", "content": "You are a title generator. Your task is to return a very short, descriptive title in at most 5 words. Do not explain or respond with paragraphs."},

                {"role": "user", "content": user_message},
            ]
        )
        title = response.choices[0].message.content.strip()
    except Exception: 
        title = user_message[:50]
    return title

from PyPDF2 import PdfReader
from .models import UploadedPDF  # ensure it's imported


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def prompt_gpt(request):
    chat_id = request.data.get("chat_id")
    content = request.data.get("content")

    if not chat_id:
        return Response({"error": "Chat ID was not provided"}, status=400)

    if not content:
        return Response({"error": "There was no prompt passed"}, status=400)

    # Fetch or create chat
    chat, created = Chat.objects.get_or_create(id=chat_id, defaults={"user": request.user})

    if chat.user != request.user:
        return Response({"error": "Unauthorized access to this chat"}, status=403)

    # Set chat title if new
    if created or not chat.title:
        chat.title = createChatTitle(content)
        chat.save()

    # Save user message
    ChatMessage.objects.create(role="user", chat=chat, content=content)

    # 🔍 Check if there's a PDF associated with the chat
    pdf = UploadedPDF.objects.filter(chat=chat).first()

    if pdf:
        # Use stored text_content as context
        pdf_text = pdf.text_content
        full_prompt = f"{pdf_text.strip()}\n\nUser: {content}"
        print(full_prompt)
        openai_messages = [{"role": "user", "content": full_prompt}]
    else:
        print("INSIDE ELSE")
        # No PDF → use chat history
        openai_messages = [
            {"role": message.role, "content": message.content}
            for message in chat.messages.order_by("created_at")[:10]
        ]
        if not any(msg["role"] == "assistant" for msg in openai_messages):
            openai_messages.insert(0, {"role": "assistant", "content": "You are a helpful assistant."})

    # 🔮 Call OpenAI
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=openai_messages
        )
        openai_reply = response.choices[0].message.content
    except Exception as e:
        return Response({"error": f"An error occurred with OpenAI: {str(e)}"}, status=500)

    # Save assistant reply
    ChatMessage.objects.create(role="assistant", content=openai_reply, chat=chat)

    return Response({"reply": openai_reply, "title": chat.title}, status=status.HTTP_201_CREATED)





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


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_chat_conversation(request,chat_id):
    print("funct hit")
    try:
        chat=Chat.objects.get(id=chat_id,user=request.user)
        messages=ChatMessage.objects.filter(chat=chat).order_by("created_at")
        
        data={
            "chat_id":str(chat_id),
            "title":chat.title,
            "messages":[
                {
                    "role":message.role,
                    "content":message.content,
                    "timestamp":message.created_at
                }
                for message in messages
            ]
        }
        return Response(data,status=200)
    except Chat.DoesNotExist:
        return Response({"error":"Chat not found"},status=404)


""" PDF """


class UploadedPDFView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        print(request.data)
        serializer = UploadedPDFSerializer(data=request.data)
        if serializer.is_valid():
            chat_id = serializer.validated_data.pop('chat_id')

            try:
                # chat = Chat.objects.get(id=chat_id, user=request.user)
                chat, created = Chat.objects.get_or_create(
                id=chat_id,
                defaults={'user': request.user}
                )


            except Chat.DoesNotExist:
                return Response({'error': 'Chat not found'}, status=status.HTTP_404_NOT_FOUND)

            pdf_file = serializer.validated_data['pdf_file']

            # Parse text content from PDF
            text_content = self.extract_text_from_pdf(pdf_file)

            # Save UploadedPDF instance
            uploaded_pdf = UploadedPDF.objects.create(
                user=request.user,
                chat=chat,
                pdf_file=pdf_file,
                text_content=text_content
            )

            return Response({'message': 'PDF uploaded and parsed successfully.'}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def extract_text_from_pdf(self, pdf_file):
        text = ''
        with fitz.open(stream=pdf_file.read(), filetype="pdf") as doc:
            for page in doc:
                text += page.get_text()
        print(text)
        return text.strip()

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def download_latest_response_pdf(request,chat_id):
    try:
        chat=Chat.objects.get(id=chat_id,user=request.user)
    except Chat.DoesNotExist:
        return Response({"error":"Chat not found or unauthorized"},status=404)
    latest_message=ChatMessage.objects.filter(chat=chat,role="assistant").last()
    
    if not latest_message:
        return Response({"Error":"No assistance response found for this chat"},status=404);
    
    response=HttpResponse(content_type="application/pdf")
    response["Content-Disposition"]='attachment: filename="response.pdf"'
    
    p = canvas.Canvas(response, pagesize=letter)
    width, height = letter
    y = height - 40
    p.setFont("Helvetica", 12)
    
    for line in latest_message.content.split("\n"):
        for chunk in [line[i:i+90] for i in range(0, len(line), 90)]:  # wrap at ~90 chars
            p.drawString(50, y, chunk)
            y -= 20
            if y < 50:
                p.showPage()
                y = height - 40
    p.save()
    return response
    
    
    


