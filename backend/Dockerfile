# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

RUN apt-get update \
    && apt-get install -y \
        python3-dev \
        graphviz \
        libgraphviz-dev \
        pkg-config \
        gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install su-exec
RUN apt-get update && \
    apt-get install -y \
        curl \
    && \
    rm -rf /var/lib/apt/lists/* && \
    curl -o /usr/local/bin/su-exec https://github.com/ncopa/su-exec/releases/download/v0.2/su-exec-amd64 && \
    chmod +x /usr/local/bin/su-exec

# Install gosu
RUN apt-get update && apt-get install -y gosu && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container at /app
COPY requirements.txt /app/
COPY wait-for-it.sh /app/

RUN chmod +x /app/wait-for-it.sh 

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . /app/

# Run the collectstatic command
RUN python manage.py collectstatic --noinput

# Set execute permissions for the entrypoint script
RUN chmod +x docker-entrypoint.sh

# Set the entrypoint for the container
ENTRYPOINT ["./docker-entrypoint.sh"]

# Set the default command to run when the container starts
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "sapiensLink.wsgi:application"]
