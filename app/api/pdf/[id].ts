
import { FileSystem } from 'expo-file-system';
import { Response } from 'expo-router/server';

export async function GET(request) {
  try {
    // Parse the request URL to get the PDF ID
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const pdfId = pathSegments[pathSegments.length - 1];
    
    if (!pdfId) {
      return new Response('PDF ID is required', { status: 400 });
    }

    // For web platform, we need to return the path to the public asset
    if (typeof window !== 'undefined') {
      // In web environment, redirect to the static file
      return Response.redirect(`${url.origin}/assets/attached_assets/${pdfId}`);
    } else {
      // For native platforms, we'd need to use FileSystem
      const fileUri = `${FileSystem.documentDirectory}attached_assets/${pdfId}`;
      const fileExists = await FileSystem.getInfoAsync(fileUri);
      
      if (!fileExists.exists) {
        return new Response('PDF not found', { status: 404 });
      }
      
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      return new Response(fileContent, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${pdfId}"`,
        }
      });
    }
  } catch (error) {
    console.error('Error serving PDF:', error);
    return new Response('Error serving PDF', { status: 500 });
  }
}
