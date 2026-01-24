# Guestbook

A simple guestbook application built with Java, Javalin, and SQLite.

## Features

- **Guestbook Entries**: Users can sign the guestbook and view existing entries.
- **Pagination**: Support for paginated reading of entries.
- **Email Notifications**: Automatically sends an email notification via [Resend](https://resend.com) when a new entry is created.
- **Reactive Updates**: Uses Java's Flow API for internal event handling.

## Prerequisites

- **Java 21** or higher.
- **Maven 3.8+** for building.

## Configuration

The application is configured using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_PORT` | The port the server will listen on. | `8080` |
| `CONNECTION_STRING` | JDBC connection string for SQLite. | `jdbc:sqlite:guestbook.db` |
| `DEFAULT_PAGE_SIZE` | Default number of entries per page. | `10` |
| `ALTCHA_HMAC_KEY` | Secret key for Altcha HMAC-SHA256. | (none) |
| `IS_ALTCHA_VERIFICATION_ENABLED` | Whether to verify Altcha payloads. | `false` |
| `SENDER_EMAIL_ADDRESS` | The sender email address for notifications. | (none) |
| `RECIPIENT_EMAIL_ADDRESS` | The recipient email address for notifications. | (none) |
| `RESEND_API_KEY` | API key for the Resend service. | (none) |

Note: `ALTCHA_HMAC_KEY`, `SENDER_EMAIL_ADDRESS`, and `RECIPIENT_EMAIL_ADDRESS` must be set for the application to start. `RESEND_API_KEY` is required for email notifications to work.

## Getting Started

### Build the project

```bash
mvn clean package
```

### Run the application

```bash
java -jar target/guestbook-1.0-SNAPSHOT.jar
```

Alternatively, you can run it directly using Maven:

```bash
mvn exec:java -Dexec.mainClass="no.clueless.guestbook.Application"
```

### Run with Podman (Quadlet)

You can run the guestbook as a rootless systemd service using Podman Quadlets.

#### 1. Build the image

```bash
podman build -t guestbook:latest .
```

#### 2. Create the Quadlet file

Create a file named `guestbook.container` in `~/.config/containers/systemd/`:

```ini
[Unit]
Description=Guestbook Microservice
After=network-online.target

[Container]
Image=guestbook:latest
PublishPort=8080:8080
Environment=SERVER_PORT=8080
Environment=CONNECTION_STRING=jdbc:sqlite:/app/data/guestbook.db
Environment=ALTCHA_HMAC_KEY=your-hmac-key
Environment=SENDER_EMAIL_ADDRESS=guestbook@example.com
Environment=RECIPIENT_EMAIL_ADDRESS=you@example.com
Environment=RESEND_API_KEY=your-resend-api-key
Volume=%h/guestbook-data:/app/data:Z

[Install]
# Start this unit when the user logs in
WantedBy=default.target
```

*Note: Ensure the directory `%h/guestbook-data` (where `%h` is your home directory) exists on your host to persist the database.*

#### 3. Start the service

Reload systemd to recognize the new Quadlet file and start the service:

```bash
systemctl --user daemon-reload
systemctl --user start guestbook.service
```

To enable the service to start automatically on boot:

```bash
systemctl --user enable guestbook.service
```

#### 4. Check status and logs

```bash
systemctl --user status guestbook.service
journalctl --user -u guestbook.service -f
```

## API Endpoints

### Get Entries

Returns a list of guestbook entries.

- **URL**: `/entries`
- **Method**: `GET`
- **Query Parameters**:
    - `pageNumber` (optional): The page to retrieve (default: 0).
    - `pageSize` (optional): The number of entries per page (default: `DEFAULT_PAGE_SIZE`).
- **Success Response**: `200 OK` with a JSON array of entries.

### Sign Guestbook

Creates a new guestbook entry.

- **URL**: `/entries`
- **Method**: `POST`
- **Headers**:
    - `altcha`: Base64 encoded Altcha payload (required if `IS_ALTCHA_VERIFICATION_ENABLED` is `true`).
- **Body**:
  ```json
  {
    "name": "Your Name",
    "message": "Your Message"
  }
  ```
- **Success Response**: `200 OK` with the created entry JSON.

### Get Altcha Challenge

Returns a new Altcha challenge.

- **URL**: `/altcha`
- **Method**: `GET`
- **Success Response**: `200 OK` with the Altcha challenge JSON.
- **Error Response**: `500 Internal Server Error` if Altcha is not configured (since `ALTCHA_HMAC_KEY` is mandatory).
