# Sapiens link

This project is built with [Django](https://www.djangoproject.com/).

Run a django project with `python manage.py runserver`

You might need to create a local DB and/or superuser credentials to access the admin panel.

## Create Your Local DB

Run the following commands:

- `python manage.py makemigrations` (create db migration files based on the Django models)
- `python manage.py migrate` (apply migration files to db)
- `python manage.py migrate --run-syncdb` (sync db schema with state of Django models)

## Create Superuser

If you want to create a superuser account to access the admin interface, run the following commands:

- `python manage.py createsuperuser`

Add an email address and a password as requested.

The superuser is a special type of user with elevated privileges, typically used for administering and managing the application.

Access the admin panel by navigating to [http://127.0.0.1:8000/admin](http://127.0.0.1:8000/admin) and login with your superuser credentials
