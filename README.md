# SapiensLink

SapiensLink was created by a team of highly interdisciplinary individuals who are passionate about learning and sharing knowledge.

The main objective is to make complex educational content accessible and to empower individual creators to make their creations accessible to wider audiences without losing their ownership. In order to unlock this vision, we are planning to create a space where information can be consumed in different possible ways and Sapionauts can be provided with automatically generated tests to validate and prove newly acquired expertise.

SapiensLink is an open source project, any contribution is welcome!

[![](docs/images/sapienslink_demo.mp4)](https://github.com/user-attachments/assets/b9c241cb-1513-4d84-adee-8c221593d197)

This project is built with [Next.js](https://nextjs.org/) and [Django](https://www.djangoproject.com/).

The overall architecture design can be found below:

![](docs/images/architecture_system.png)

# Docker Setup Option

Once installed Docker on your local machine, run the following command from the root of the project:

`DB_USER='YOUR_USER_NAME' DB_PASSWORD='YOUR_USER_PASSWORD' docker-compose up`

Before running this command, make sure you have a `app_secrets.py` file in the backend directory and to have removed any pre-existing .next, node_modules folders from the frontend folder.

```
SENDGRID_API_KEY = 'TODO'
FROM_EMAIL = 'TODO'
POSTGRESQL_USERNAME = 'TODO'
POSTGRESQL_PASSWORD = 'TODO'
GOOGLE_CLIENT_ID = 'TODO'
GOOGLE_CLIENT_SECRET = 'TODO'
DJANGO_SECRET_KEY = 'TODO'
CUSTOM_HEADER_VALUE = 'TODO'
```

In the frontend folder, make sure instead to have the `.env` file setup:

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'TODO'
NEXT_PUBLIC_MAILCHIMP_API_KEY = 'TODO'
NEXT_PUBLIC_FORMSPREE_API_KEY = 'TODO'
NEXT_PUBLIC_X_NEXTJS_APPLICATION = 'TODO'
NEXT_PUBLIC_API_BASE_URL= 'http://localhost'
NEXT_PUBLIC_WEBSOCKET_URL= 'localhost'
```

If you want to rebuild everything use: `DB_USER='admin' DB_PASSWORD='password' docker-compose up --build`. Or if need to clear everything use `docker system prune --volumes`.

The Django frontend should be accessible from [localhost:8001](http://localhost:8001/), the Next.js frontend from [localhost:3001](http://localhost:3000/), the Nginx frontend from [localhost](http://localhost/) and pgAdmin to access the PostgreSQL DB at [localhost:5051](http://localhost:5051/). Whenever calling the Django REST APIs, make sure to do so from the Nginx interface and not NextJS.

To create an admin user, run these commands from the terminal and follow the instructions:

```
docker exec -it sapienslink_django_1 /bin/bash
python manage.py createsuperuser
```

Once created the admin user you can then access the admin panel from [this address](http://localhost/admin/).

To clear resources after usage use: `docker-compose down -v`.

## Initial PGAdmin Setup

To register the PostgreSQL server on the PGAdmin page, follow these steps:

Open your web browser and navigate to [localhost:5051](http://localhost:5051) (assuming you're running PGAdmin on your local machine).

Log in using the email and password set in the docker-compose.yml. In this case, admin@admin.com and the password is ${DB_PASSWORD}.

Once logged in, you should see the PGAdmin dashboard.

To register the PostgreSQL server, follow these steps:
- Click on the "Add New Server" button (usually found on the left-hand side, under the "Servers" section).
- In the "General" tab, enter a name for the server (e.g., "PostgreSQL Server").
- In the "Connection" tab:
    1. Hostname/address: Enter postgresdb, which is the service name defined in the docker-compose.yml.
    2. Port: Enter 5432, which is the default port for PostgreSQL.
    3. Maintenance database: Enter sapiensdb, which is the database specified in the docker-compose.yml.
    4. Username: Enter ${DB_USER}. This is an environment variable, ensure it's defined and contains the correct username.
    5. Password: Enter ${DB_PASSWORD}. This is also an environment variable, ensure it's defined and contains the correct password.
    6. Click on the "Save" button.
- Once saved, you should see your PostgreSQL server listed under the "Servers" section in PGAdmin.
- Click on your server's name to expand it and access the databases, schemas, tables, etc., within it.

# Local Setup Option

## Django Backend

Run a django project with `python manage.py runserver` from the backend folder (in this case make sure to setup DEBUG=True and 'HOST': 'localhost' in the settings.py).

You might need to create a local DB and/or superuser credentials to access the admin panel.

## Make sure to work in your virtualenv in the backend folder

If you don't have virtualenv installed use: `pip install virtualenv`.

For the first usage, to create a virtualenv called venv, use `virtualenv venv` from command line.

Then every time you are developing make sure to first activate your virtualenv using `source venv/bin/activate` (for Mac/Linux, for Windows use: `.env\Scripts\activate.bat`).

After you install any Python package, use `pip freeze > requirements.txt`.

If you need to install any missing package someone else might have added since your last contribution, then use: `pip install -r requirements/all.txt`.

Once finished developing use: `deactivate`.

NOTE: for this project we use 2 key requirements files: requirements-base.txt and requirements-ml.txt which combined together give requirements-all.txt which can be used to run the Django application locally.

## PostgreSQL (Create Your Local DB in the backend folder)

To install postgresql on Mac and the Pgadmin user interface use the following commands:

`brew install postgresql`

`brew install --cask pgadmin4`

Finally, make sure your environment is up to date with the requirements.txt file.

Now open pgadmin4, click on servers, register servers, then choose a name for the server. For host name/address put localhost, port 5432, and choose an username/password (if needed, create a user for the database by using the Login/Group Roles tab in the Server from where you can also specify its permissions). Now we can create a database and specify its name and access in the app_secrets.py.

Once created the database and accordingly updated the settings.py file we can run the following commands:

`python manage.py makemigrations` (create db migration files based on the Django models)

`python manage.py migrate` (apply migration files to db)

`python manage.py migrate auth`

`python manage.py migrate --run-syncdb` (sync db schema with state of Django models)

The server can then be launched using: `python manage.py runserver` and the front end reachable at [http://localhost:8000/](http://localhost:8000/).

## Visualizing the database

In order to create a snapshot of the database architecture, the following command can be used: `python manage.py graph_models -a sapinesApp -o ../db.png` from the backend folder.

![](docs/images/db.png)

### Create Superuser

If you want to create a superuser account to access the admin interface, run the following commands:

- `python manage.py createsuperuser`

Add an email address and a password as requested.

The superuser is a special type of user with elevated privileges, typically used for administering and managing the application.

Access the admin panel by navigating to [http://localhost:8000/admin](http://localhost:8000/admin) and login with your superuser credentials

## Run Redis Server (notifications and task execution)

In order to have the web application notification system up and running, you need to make sure to have the Redis Server up and running (opening a new terminal window in the backend folder and running the following command):

- `redis-server`

## Celery

Celery is a distributed task queue system which can be used to schedule recurring tasks (e.g. clearing up read notifications, etc.). In order to be correctly working we
need to have the celery worker (executing tasks) and beat (scheduling periodic tasks at the specified intervals) running in two separate terminal windows (both from the backend folder) using the following commands (sudo permissions might be required):

- `celery -A sapiensLink worker --loglevel=info`
- `celery -A sapiensLink beat --loglevel=info`

## Accessing the API Documentation

The SapiensLink API documentation is available through [Django default interface](http://localhost:8000/api/), [Swagger UI](http://localhost:8000/api/swagger/) and [Redoc](http://localhost:8000/api/redoc/).

To test secured endpoints for example using Swagger UI, when clicking Authorize, in the token filed make sure to type `Bearer YOUR ACCESS TOKEN`. An access token can for example be generated by creating an account on the platform and then using [this interface](http://localhost:8000/api/token/) to login and get the tokens.

## NextJS Frontend

Run a NextJS project with `npm run start` from the _frontend_ folder.

To run a NextJS project, you need to install its dependencies first. </br>
Inside the _frontend_ folder, run `npm install`.

If you need to fetch data from the Django server, you will need to:

- run NextJS with `npm start` from the _frontend_ folder
- run Django with `python manage.py runserver` from the sapiensLink folder. You might also need to create your local DB as reported above.

## Theme configuration

All theme settings and instructions are available in the AppLayout component.
