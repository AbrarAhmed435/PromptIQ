from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from .models import CustomUser,UploadedPDF,Chat
from django.utils.text import slugify
from rest_framework_simplejwt.tokens import RefreshToken
import random
import string
import logging
import PyPDF2

logger = logging.getLogger(__name__)

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(write_only=True, max_length=100)
    last_name = serializers.CharField(write_only=True, max_length=100)
    username = serializers.CharField(required=False, allow_blank=True, max_length=150)
    password=serializers.CharField(write_only=True,min_length=8,max_length=32,style={'input_type':'password'})
    confirm_password=serializers.CharField(write_only=True,max_length=32, style={'input_type':'password'})
   

    class Meta:
        model = CustomUser
        fields = ['first_name','last_name','email','username','password','confirm_password']
        extra_kwargs={'password':{'write_only':True}}
    def validate(self, data):
        if data['password']!=data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data
    
    def generate_unique_username(self,first_name,last_name):
        base=slugify(f"{first_name}{last_name}")
        while True:
            random_suffix=''.join(random.choices(string.digits,k=4))
            username=f"{base}{random_suffix}"
            if not CustomUser.objects.filter(username=username).exists():
                return username
            
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        first_name=validated_data['first_name']
        last_name=validated_data['last_name']
        email = validated_data['email']
        username = validated_data.get('username')
        
        if not username:
            username=self.generate_unique_username(first_name,last_name)
        
        user =CustomUser(
            username=username,
            email=email,
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        user.password=make_password(validated_data['password'])
        user.save()
        return user
    
User=get_user_model()

class EmailTokenObtainPairSerializer(serializers.Serializer):
    email=serializers.EmailField(label="Enter Email")
    password=serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email=attrs.get("email")
        password=attrs.get("password")
        
        try:
            user=User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or Password")
        
        if not user.check_password(password):
            raise serializers.ValidationError("Invalid email or Password")
        
        if not user.is_active:
            raise serializers.ValidationError("User is inactive")
        
        refresh=RefreshToken.for_user(user)
        
        return{
            "refresh":str(refresh),
            "access":str(refresh.access_token),
            # "user_id": user.id,  Sometimes you might want to      return user info in the response or access it later:     
            # "email": user.email,
        }


""" PDF """


class UploadedPDFSerializer(serializers.ModelSerializer):
    chat_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = UploadedPDF
        fields = ['pdf_file', 'chat_id']