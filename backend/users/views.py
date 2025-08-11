from django.shortcuts import render
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.permissions import IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db import models
from .models import User
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    UserListSerializer,
)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)

class LoginView(generics.GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return Response({
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "full_name": user.get_full_name(),
            },
            "tokens": {
                "access": access_token,
                "refresh": str(refresh),
            },
            "message": "Login successful"
        })

class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user

class UserListView(generics.ListAPIView):
    """FIXED: Proper role-based filtering and query parameters"""
    queryset = User.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = UserListSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = User.objects.all()
        
        # Role-based access control
        if user.role == 'user':
            queryset = queryset.filter(id=user.id)
        elif user.role == 'engineer':
            queryset = queryset.filter(role__in=['user', 'engineer'])
        # Admins can see all users (no filtering)
        
        # Apply query parameter filters - THIS FIXES /api/users/?role=engineer
        role_filter = self.request.query_params.get('role')
        if role_filter:
            queryset = queryset.filter(role=role_filter)
            
        department_filter = self.request.query_params.get('department')
        if department_filter:
            queryset = queryset.filter(department=department_filter)
            
        is_active_filter = self.request.query_params.get('is_active')
        if is_active_filter is not None:
            is_active = is_active_filter.lower() == 'true'
            queryset = queryset.filter(is_active=is_active)
            
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(first_name__icontains=search) |
                models.Q(last_name__icontains=search) |
                models.Q(email__icontains=search)
            )
        
        return queryset.order_by('-created_at')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data["refresh_token"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logout successful'}, status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_admin():
            return User.objects.all()
        return User.objects.none()

# @api_view(['GET'])
# @permission_classes([permissions.IsAuthenticated])
# def get_engineers(request):
#     """NEW: Get engineers for admin assignment"""
#     if request.user.role != 'admin':
#         return Response(
#             {'error': 'Only administrators can view engineer list'},
#             status=status.HTTP_403_FORBIDDEN
#         )
    
#     engineers = User.objects.filter(role='engineer', is_active=True)
#     serializer = UserListSerializer(engineers, many=True)
    
#     return Response({
#         'engineers': serializer.data,
#         'count': engineers.count()
#     }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_engineers(request):
    try:
        engineers = User.objects.filter(role='engineer')
        serializer = UserListSerializer(engineers, many=True)
        return Response(serializer.data)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)