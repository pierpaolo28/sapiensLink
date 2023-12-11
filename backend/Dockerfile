# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y \
        python3-dev \
        graphviz \
        libgraphviz-dev \
        pkg-config \
        gcc \
        && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container at /app
COPY requirements.txt /app/

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY wait-for-it.sh /usr/local/bin/wait-for-it
RUN chmod +x /usr/local/bin/wait-for-it

# Copy the rest of the application code into the container
COPY . /app/

# Run the collectstatic command
RUN python manage.py collectstatic --noinput

# Set execute permissions for the entrypoint script
RUN chmod +x docker-entrypoint.sh

# Set the entrypoint for the container
ENTRYPOINT ["wait-for-it", "db:5432", "--", "./docker-entrypoint.sh"]

# Set the default command to run when the container starts
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "sapiensLink.wsgi:application"]
