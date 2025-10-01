# API Testing Guide

This document provides example `curl` commands to test your Guardianest API endpoints locally and in production.

## Local Development

Start your local server first:
```bash
npm run dev:server
# Server will be available at http://127.0.0.1:8787
```

## Health Check

Test the health endpoint:
```bash
# Basic health check
curl http://127.0.0.1:8787/

# Monitoring health endpoint  
curl http://127.0.0.1:8787/health
```

Expected responses:
```json
{
  "message": "Guardianest API is running!",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

```json
{
  "ok": true,
  "time": "2024-01-01T12:00:00.000Z", 
  "service": "guardianest-api",
  "version": "1.0.0"
}
```

## AI Completion Endpoints

### Homework Help (Tutor)

Test the tutoring endpoint with a math question:
```bash
curl -X POST http://127.0.0.1:8787/ai/complete \
  -H "Content-Type: application/json" \
  -d '{
    "text": "What is 15 + 27? I need help understanding addition with carrying.",
    "type": "homework",
    "childAge": 8
  }'
```

Test with a science question:
```bash
curl -X POST http://127.0.0.1:8787/ai/complete \
  -H "Content-Type: application/json" \
  -d '{
    "text": "How do plants make their own food?",
    "type": "homework",
    "childAge": 10
  }'
```

### Story Generation

Test creative storytelling:
```bash
curl -X POST http://127.0.0.1:8787/ai/complete \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Tell me a story about a brave little robot who helps clean up the ocean",
    "type": "story",
    "childAge": 7
  }'
```

Test with older child:
```bash
curl -X POST http://127.0.0.1:8787/ai/complete \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Create an adventure story about time travel and friendship",
    "type": "story",
    "childAge": 12
  }'
```

### Edge Cases

Test validation - text too short:
```bash
curl -X POST http://127.0.0.1:8787/ai/complete \
  -H "Content-Type: application/json" \
  -d '{
    "text": "",
    "type": "homework"
  }'
```

Test validation - invalid type:
```bash
curl -X POST http://127.0.0.1:8787/ai/complete \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Help me with this problem",
    "type": "invalid-type"
  }'
```

Test validation - child age out of bounds:
```bash
curl -X POST http://127.0.0.1:8787/ai/complete \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Help with homework",
    "type": "homework",
    "childAge": 25
  }'
```

## OCR Endpoints

### Text Extraction from Images

Test OCR with a base64 encoded image:
```bash
# Note: Replace BASE64_IMAGE_DATA with actual base64 encoded image data
curl -X POST http://127.0.0.1:8787/ocr/extract \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
  }'
```

Test OCR when service is not configured (should return 503):
```bash
curl -X POST http://127.0.0.1:8787/ocr/extract \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
  }' \
  -v
```

### Creating a Test Image

To test OCR locally, you can create a simple test image with text:

```bash
# Install ImageMagick if not available
# Ubuntu/Debian: sudo apt install imagemagick
# macOS: brew install imagemagick

# Create a test image with text
convert -size 300x100 xc:white -font Arial -pointsize 20 -fill black -annotate +10+30 "Hello World!" test-image.png

# Convert to base64
base64 -i test-image.png | tr -d '\n' > test-image-base64.txt

# Use in curl command
curl -X POST http://127.0.0.1:8787/ocr/extract \
  -H "Content-Type: application/json" \
  -d "{\"image\": \"data:image/png;base64,$(cat test-image-base64.txt)\"}"
```

## Error Testing

### 404 Not Found
```bash
curl http://127.0.0.1:8787/nonexistent-endpoint
```

### 405 Method Not Allowed  
```bash
curl -X PUT http://127.0.0.1:8787/ai/complete
```

### CORS Preflight
```bash
curl -X OPTIONS http://127.0.0.1:8787/ai/complete \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
```

## Production Testing

When testing against production, replace the localhost URL with your deployed Worker URL:

```bash
# Replace with your actual Cloudflare Worker URL
PROD_URL="https://your-worker.your-subdomain.workers.dev"

# Health check
curl $PROD_URL/health

# AI completion
curl -X POST $PROD_URL/ai/complete \
  -H "Content-Type: application/json" \
  -d '{
    "text": "What is photosynthesis?",
    "type": "homework",
    "childAge": 9
  }'
```

## Load Testing

For basic load testing, you can use `curl` in a loop:

```bash
# Simple load test - 10 concurrent requests
for i in {1..10}; do
  curl -X POST http://127.0.0.1:8787/ai/complete \
    -H "Content-Type: application/json" \
    -d '{
      "text": "Test question '$i'",
      "type": "homework"
    }' &
done
wait
```

For more sophisticated load testing, consider using tools like:
- Apache Bench (`ab`)
- wrk
- Artillery.io
- k6

## Expected Response Format

All successful API responses follow this format:
```json
{
  "success": true,
  "data": {
    "response": "AI generated response...",
    "usage": {
      "prompt_tokens": 45,
      "completion_tokens": 123,
      "total_tokens": 168
    }
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## Environment Variables for Testing

When testing locally, make sure your `.dev.vars` file is properly configured:

```bash
# apps/server/.dev.vars (local development only)
OPENAI_API_KEY=your-openai-api-key-here
GOOGLE_CLOUD_API_KEY=your-google-cloud-api-key-here
SUPABASE_URL=your-supabase-url-here  
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key-here
```

For production testing, these should be configured as Cloudflare Worker environment variables.
