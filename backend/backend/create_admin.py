from django.contrib.auth import get_user_model

User = get_user_model()

email = "Admin@gmail.com"       # Change to your preferred email
password = "Admin"         # Change to your preferred password
first_name = "Admin"
last_name = "User"

if not User.objects.filter(email=email).exists():
    User.objects.create_superuser(
        email=email,
        password=password,
        role='admin',
        department='ict',
        first_name=first_name,
        last_name=last_name
    )
    print(f"✅ Superuser {email} created successfully!")
else:
    print(f"ℹ Superuser {email} already exists.")