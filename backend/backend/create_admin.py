from django.contrib.auth import get_user_model

User = get_user_model()

email = "admin@gmail.com.com"        
sword = "admin"          

if not User.objects.filter(email=email).exists():
    User.objects.create_superuser(
        email=email,
        password=password,
        role='admin',
        department='ict',
        first_name='Admin',
        last_name='User'
    )
    print(f"Superuser with email {email} created successfully!")
else:
    print(f"Superuser with email {email} already exists.")