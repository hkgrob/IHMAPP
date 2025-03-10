
import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';
import { Response } from 'expo-router/server';

export async function GET(request) {
  try {
    // Parse the URL to get the filename
    const url = new URL(request.url);
    const filePath = url.pathname.replace('/api/static/', '');
    
    // In Expo, we need to use the file system differently
    const fullPath = `${FileSystem.documentDirectory}attached_assets/${filePath}`;
    
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(fullPath);
    if (!fileInfo.exists) {
      console.error('File not found:', fullPath);
      return new Response('File not found', { status: 404 });
    }
    
    // Read the file
    const fileContent = await FileSystem.readAsStringAsync(fullPath, {
      encoding: FileSystem.EncodingType.Base64
    });
    
    // Determine content type based on file extension
    let contentType = 'application/octet-stream';
    if (filePath.endsWith('.pdf')) {
      contentType = 'application/pdf';
    } else if (filePath.endsWith('.txt')) {
      contentType = 'text/plain';
    }
    
    // Return the file with appropriate headers
    return new Response(fileContent, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filePath.split('/').pop()}"`,
      },
      status: 200,
    });
  } catch (error) {
    console.error('Error serving static file:', error);
    return new Response('Error serving file', { status: 500 });
  }
}
