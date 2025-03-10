import * as FileSystem from 'expo-file-system';
import { Response } from 'expo-router/server';
import { Asset } from 'expo-asset';

export async function GET(request) {
  try {
    // Parse the request URL to get the PDF ID
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const pdfId = decodeURIComponent(pathSegments[pathSegments.length - 1]);

    if (!pdfId) {
      return new Response('PDF ID is required', { status: 400 });
    }

    // For web, we'll use a different approach to serve static files
    // Simply redirect to the static path where the PDF should be available
    return Response.redirect(`${url.origin}/attached_assets/${pdfId}`);
  } catch (error) {
    console.error('Error handling PDF request:', error);
    return new Response('Error serving PDF', { status: 500 });
  }
}