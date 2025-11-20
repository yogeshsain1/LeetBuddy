import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import sharp from 'sharp';
import { db } from '@/db';
import { fileUploads } from '@/db/schema/messages';
import { APIError } from '@/lib/api-response';
import { eq, desc } from 'drizzle-orm';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/zip',
];

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Generate unique filename
function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${random}.${extension}`;
}

// Optimize and resize image
async function optimizeImage(
  buffer: Buffer,
  mimeType: string
): Promise<{ buffer: Buffer; thumbnail: Buffer }> {
  const image = sharp(buffer);
  const metadata = await image.metadata();

  // Resize if too large (max 2000px width)
  let optimized = image;
  if (metadata.width && metadata.width > 2000) {
    optimized = image.resize(2000, null, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Convert to appropriate format
  if (mimeType === 'image/png') {
    optimized = optimized.png({ quality: 90 });
  } else {
    optimized = optimized.jpeg({ quality: 85 });
  }

  const optimizedBuffer = await optimized.toBuffer();

  // Create thumbnail (300px width)
  const thumbnailBuffer = await sharp(buffer)
    .resize(300, null, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 80 })
    .toBuffer();

  return { buffer: optimizedBuffer, thumbnail: thumbnailBuffer };
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Get userId from session/auth
    const userId = '1'; // Placeholder (should be a string UUID)

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_FILE', message: 'No file provided' } },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
        { success: false, error: { code: 'FILE_TOO_LARGE', message: 'File size exceeds 10MB limit' } },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_FILE_TYPE', message: 'File type not allowed' } },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    await ensureUploadDir();

    // Read file buffer
    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);

    // Generate filenames
    const fileName = generateFileName(file.name);
    const filePath = join(UPLOAD_DIR, fileName);
    const fileUrl = `/uploads/${fileName}`;

    let thumbnailUrl: string | null = null;

    // Handle images
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
      const { buffer: optimizedBuffer, thumbnail } = await optimizeImage(buffer, file.type);
      buffer = Buffer.from(optimizedBuffer);

      // Save thumbnail
      const thumbnailFileName = `thumb_${fileName}`;
      const thumbnailPath = join(UPLOAD_DIR, thumbnailFileName);
      await writeFile(thumbnailPath, thumbnail);
      thumbnailUrl = `/uploads/${thumbnailFileName}`;
    }

    // Save file
    await writeFile(filePath, buffer);

    // Save to database
    const now = new Date().toISOString();
    const [upload] = await db
      .insert(fileUploads)
      .values({
        userId: String(userId),
        fileName: file.name,
        fileUrl,
        thumbnailUrl,
        fileSize: buffer.length,
        mimeType: file.type,
        uploadedAt: now,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        id: upload.id,
        fileName: file.name,
        fileUrl,
        thumbnailUrl,
        fileSize: buffer.length,
        mimeType: file.type,
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'UPLOAD_ERROR', message: 'Upload failed' } },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session/auth
    const userId = '1'; // Placeholder (should be a string UUID)

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const uploads = await db
      .select()
      .from(fileUploads)
      .where(eq(fileUploads.userId, String(userId)))
      .orderBy(desc(fileUploads.uploadedAt))
      .limit(limit);

    return NextResponse.json({ success: true, data: uploads });
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch uploads' } },
      { status: 500 }
    );
  }
}
