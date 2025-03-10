
import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { file: string[] } }
) {
  try {
    // Get the file path from the URL
    const filePath = params.file.join('/');
    
    // Construct the full path to the file
    const fullPath = join(process.cwd(), 'attached_assets', filePath);
    
    // Read the file
    const fileData = readFileSync(fullPath);
    
    // Determine content type based on file extension
    let contentType = 'application/octet-stream';
    if (filePath.endsWith('.pdf')) {
      contentType = 'application/pdf';
    } else if (filePath.endsWith('.txt')) {
      contentType = 'text/plain';
    }
    
    // Return the file with appropriate headers
    return new NextResponse(fileData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filePath.split('/').pop()}"`,
      },
    });
  } catch (error) {
    console.error('Error serving static file:', error);
    return new NextResponse('File not found', { status: 404 });
  }
}
