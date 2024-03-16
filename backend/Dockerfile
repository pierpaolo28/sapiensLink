# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set environment variables
ARG ENVIRONMENT
ENV ENVIRONMENT=${ENVIRONMENT}
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       gcc \
       libc6-dev \
       graphviz \
       libgraphviz-dev \
       postgresql-client \ 
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements/all.txt /app/
COPY requirements/base.txt /app/
COPY requirements/ml.txt /app/

# Install any needed packages specified in requirements-all.txt
RUN pip install --no-cache-dir -r all.txt

# Copy project
COPY . /app/

COPY entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
# Run Daphne
CMD python manage.py runserver 0.0.0.0:8000

