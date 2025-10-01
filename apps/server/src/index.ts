import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import OpenAI from 'openai';
import type { AIRequest, AIResponse, OCRRequest, OCRResponse, ApiResponse } from '@guardianest/shared';

type Bindings = {
  OPENAI_API_KEY: string;
  GOOGLE_CLOUD_API_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware
app.use('/*', cors({
  origin: ['http://localhost:3000', 'http://localhost:8081', 'https://guardianest.vercel.app', 'null'], // 'null' allows file:// origins
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check endpoint
app.get('/', (c) => {
  return c.json({ message: 'Guardianest API is running!', timestamp: new Date().toISOString() });
});

// Health endpoint for monitoring
app.get('/health', (c) => {
  return c.json({ 
    ok: true, 
    time: new Date().toISOString(),
    service: 'guardianest-api',
    version: '1.0.0'
  });
});

// AI completion endpoint
const aiRequestSchema = z.object({
  text: z.string().min(1).max(2000),
  type: z.enum(['homework', 'story']),
  childAge: z.number().min(3).max(18).optional(),
});

app.post('/ai/complete', zValidator('json', aiRequestSchema), async (c) => {
  try {
    const { text, type, childAge } = c.req.valid('json');
    const openai = new OpenAI({ apiKey: c.env.OPENAI_API_KEY });

    // Create age-appropriate system prompts
    const getSystemPrompt = (type: string, age?: number): string => {
      const ageGroup = age ? (
        age <= 6 ? 'preschooler' :
        age <= 9 ? 'early elementary' :
        age <= 12 ? 'late elementary' :
        age <= 15 ? 'middle school' : 'high school'
      ) : 'school-age';

      if (type === 'homework') {
        return `You are a helpful, encouraging AI tutor for ${ageGroup} children. Your goal is to guide them to learn, not give direct answers. 

Rules:
- Break down complex problems into simple steps
- Ask guiding questions to help them think
- Use age-appropriate language and examples
- Be patient and encouraging
- Never do their homework for them
- Focus on understanding concepts, not just getting answers
- Keep responses under 200 words
- Make learning fun and engaging

If the question seems inappropriate for a child or not educational, politely redirect them to ask about schoolwork.`;
      } else {
        return `You are a creative storyteller for ${ageGroup} children. Create engaging, age-appropriate stories that are:

- Safe and positive
- Educational when possible
- Imaginative and fun
- Under 300 words for attention span
- Free of scary, violent, or inappropriate content
- Inclusive and diverse

If the request is inappropriate, politely suggest a different story topic instead.`;
      }
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: getSystemPrompt(type, childAge) },
        { role: 'user', content: text }
      ],
      max_tokens: type === 'story' ? 400 : 300,
      temperature: type === 'story' ? 0.8 : 0.7,
    });

    const response: ApiResponse<AIResponse> = {
      success: true,
      data: {
        response: completion.choices[0]?.message?.content || 'I\'m sorry, I couldn\'t generate a response. Please try again.',
        usage: {
          prompt_tokens: completion.usage?.prompt_tokens || 0,
          completion_tokens: completion.usage?.completion_tokens || 0,
          total_tokens: completion.usage?.total_tokens || 0,
        },
      },
    };

    return c.json(response);
  } catch (error) {
    console.error('AI completion error:', error);
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to generate AI response. Please try again.',
    };
    return c.json(errorResponse, 500);
  }
});

// OCR fallback endpoint (Google Cloud Vision API)
const ocrRequestSchema = z.object({
  image: z.string(), // base64 encoded image
});

app.post('/ocr/extract', zValidator('json', ocrRequestSchema), async (c) => {
  try {
    const { image } = c.req.valid('json');
    
    if (!c.env.GOOGLE_CLOUD_API_KEY) {
      const errorResponse: ApiResponse = {
        success: false,
        error: 'OCR service not configured',
      };
      return c.json(errorResponse, 503);
    }

    // Call Google Cloud Vision API
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${c.env.GOOGLE_CLOUD_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: image.replace(/^data:image\/[a-z]+;base64,/, ''),
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1,
              },
            ],
          },
        ],
      }),
    });

    const visionResult = await response.json();
    
    if (!response.ok) {
      throw new Error(`Vision API error: ${visionResult.error?.message || 'Unknown error'}`);
    }

    const textAnnotation = visionResult.responses?.[0]?.textAnnotations?.[0];
    const extractedText = textAnnotation?.description || '';
    const confidence = textAnnotation?.confidence || 0;

    const ocrResponse: ApiResponse<OCRResponse> = {
      success: true,
      data: {
        text: extractedText,
        confidence: confidence * 100, // Convert to percentage
      },
    };

    return c.json(ocrResponse);
  } catch (error) {
    console.error('OCR error:', error);
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to extract text from image. Please try again.',
    };
    return c.json(errorResponse, 500);
  }
});

// Middleware to handle 404s
app.notFound((c) => {
  return c.json({ success: false, error: 'Endpoint not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Unexpected error:', err);
  return c.json({ success: false, error: 'Internal server error' }, 500);
});

export default app;
