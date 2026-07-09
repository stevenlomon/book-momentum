import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcrypt';

// The Route Handler to be called when assigning a book, either from the User Bookshelf or Open Library, as their Currently Reading or Follow-up
// to one of their Reading Track. Now in Development, the Reading Tracks are hard coded as my three Reading Tracks, set in TRACKS in ReadinTracksSection.tsx
export async function POST(req: Request) {
  // To be implemented
};