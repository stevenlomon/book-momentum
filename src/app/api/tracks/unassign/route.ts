import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { track_id, slot_id } = body;

    if (!track_id || !slot_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // First, we get the actual db UUID of the track based on the numeric ID
    // Temporary fix mirroring the assignment route, will tend to properly when implementing full CRUD for Reading Tracks
    let dbTrackName = '';
    if (track_id === 1) dbTrackName = 'Fiction';
    if (track_id === 2) dbTrackName = 'Non-fiction';
    if (track_id === 3) dbTrackName = 'Before Bedtime';

    const trackRes = await pool.query(
      'SELECT id FROM "Reading_Track" WHERE user_id = $1 AND name = $2', 
      [user.id, dbTrackName]
    );

    if (trackRes.rowCount === 0) {
      return NextResponse.json({ error: `Reading track '${dbTrackName}' not found for user.` }, { status: 404 });
    }

    const realTrackId = trackRes.rows[0].id;

    if (slot_id === 2) {
      // Building out the unassignment for slot 2 since it's 10x simpler and less complex. It's not multi-step at all; we simply clear the 
      // follow_up_book_id on the Reading_Track table. The Bookshelf_Item is completely untouched and remains Intend to Read.
      const query = {
        name: 'unassign-follow-up-book',
        // In a sea of monster queries... simple by-the-book queries like these are so welcome haha
        text: `
          UPDATE "Reading_Track" 
          SET follow_up_book_id = NULL 
          WHERE id = $1 AND user_id = $2
          RETURNING *
        `,
        values: [realTrackId, user.id] // user.id as inline security check!
      };

      await pool.query(query);

      return NextResponse.json({ success: "ok" });
    }

    // We will build out the Crossroads Modal transaction for Slot 1 right here next
    if (slot_id === 1) {
      return NextResponse.json({ error: "Slot 1 unassignment coming soon!" }, { status: 501 });
    }

    return NextResponse.json({ error: "Invalid slot_id" }, { status: 400 });

  } catch (err) {
    console.error("Unexpected error in reading track unassignment:", err);
    return NextResponse.json({ success: "not ok", error: (err as Error).message }, { status: 500 });
  }
};