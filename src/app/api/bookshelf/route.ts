// For inserting and updating items onto the user's Bookshelf. Affects the Bookshelf_Item table
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET endpoint to fetch a user's entire bookshelf
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const query = {
      name: 'get-user-bookshelf-all-api',
      text: `
        SELECT 
          bi.id AS bookshelf_item_id,
          bi.status_id,
          bi.user_rating,
          bi.horizon_slot,
          b.id AS book_id,
          b.external_id,
          b.title,
          b.author,
          b.cover_image_url
        FROM "Bookshelf_Item" bi
        JOIN "Book" b ON bi.book_id = b.id
        WHERE bi.user_id = $1
        ORDER BY bi.added_at DESC
      `,
      values: [user.id]
    };

    const res = await pool.query(query);

    return NextResponse.json({
      success: "ok",
      data: res.rows
    });

  } catch (err) {
    console.error("Unexpected error fetching bookshelf:", err);
    return NextResponse.json({ success: "not ok", error: (err as Error).message }, { status: 500 });
  }
}

// POST endpoint to create a new resource in the user's bookshelf
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // The server provides all data except added_at that Postgres can automatically generate
    // When creating and inserting a bookshelf item, we omit peak_slot and user_rating; these are updated in a separate fetch
    const itemId = crypto.randomUUID();

    // We now expect that this can contain horizon_slot but also need to be prepared that it might be undefined!
    const { book_id, status_id, horizon_slot = null } = body; // horizon_slot defaults to null

    const query = {
      name: 'insert-user-bookshelf-item',
      text: 'INSERT INTO "Bookshelf_Item"(id, user_id, book_id, status_id, horizon_slot) VALUES($1, $2, $3, $4, $5) RETURNING *',
      values: [itemId, user.id, book_id, status_id, horizon_slot]
    }
    const res = await pool.query(query);
    const item = res.rows[0];
    console.log("Bookshelf item insertion results", item);

    return NextResponse.json({
      success: "ok",
      data: {
        id: item.id,
        user_id: item.user_id,
        book_id: item.book_id,
        status_id: item.status_id,
      }
    });
  } catch (err) {
    console.error("Unexpected error when trying to insert Bookshelf item", err);
    return NextResponse.json({ success: "not ok" }, { status: 500 });
  }
};

// The Route Handler to be called when assigning a rating to a Bookshelf Item. Completely decoupled from status; no requirement that 
// the book needs to be marked "Read" in order to rate it. It would cause more frustration overall that appreciation!
// Now also handles read status updates! Which re-wires the logic of the route handler slightly to be more flexible and dynamic
export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bookshelf_item_id, user_rating, status_id } = body; // Now also takes status!

    // This is now the only element in the payload that is truly required that we check before anythign else
    if (!bookshelf_item_id) {
      return NextResponse.json({ error: "Missing required bookshelf_item_id" }, { status: 400 });
    }

    // Instead, we use "gatekeeper if statements"; one for the user rating code we've already written...
    if (user_rating !== undefined) {
      // Golden Rule of Web Dev: Never trust the client haha! Even if our Frontend might ensure only valid half or whole star
      // ratings are used via a sleek Letterboxd client component, someone could still send an invalid request via Postman!
      if (user_rating !== null) { // We know now that it's not undefined, final check to ensure it's not null
        const isInvalidRating = user_rating < 0.5 || user_rating > 5.0 || (user_rating * 2) % 1 !== 0;

        if (isInvalidRating) {
          return NextResponse.json({
            error: "Rating must be a valid half or whole star rating between 0.5 to 5.0"
          }, { status: 400 });
        }
      }

      const query = {
        name: 'update-user-rating',
        text: `
        UPDATE "Bookshelf_Item" 
        SET user_rating = $1 
        WHERE id = $2 AND user_id = $3 
        RETURNING *
      `,
        values: [user_rating, bookshelf_item_id, user.id]
      };

      const res = await pool.query(query);
      const updatedUserRating = res.rows[0];

      // If rowCount is 0, it means the item didn't exist OR it didn't belong to this user
      if (res.rowCount === 0) {
        return NextResponse.json({ error: "Item not found or unauthorized" }, { status: 404 });
      }

      console.log(`Successfully updated user rating for Bookshelf_Item with id ${bookshelf_item_id} to:`, updatedUserRating);

      return NextResponse.json({
        success: "ok",
        data: updatedUserRating
      });
    }

    // ..and one for the new code that updates the read status!
    if (status_id !== undefined) {
      const query = {
        name: 'update-status-id',
        text: `
          UPDATE "Bookshelf_Item" 
          SET status_id = $1 
          WHERE id = $2 AND user_id = $3 
          RETURNING *
        `,
        values: [status_id, bookshelf_item_id, user.id]
      };

      const res = await pool.query(query);
      if (res.rowCount === 0) return NextResponse.json({ error: "Item not found" }, { status: 404 });
      return NextResponse.json({ success: "ok", data: res.rows[0] });
    }

    // And for this "gatekeeper" logic to fully work, we need a fallback in case the payload doesn't acutally contain a valid
    // user rating, status upadte, review or anything of the sort
    return NextResponse.json({ 
      error: "No valid fields provided for update (expected user_rating or status_id (for now))" 
    }, { status: 400 });

  } catch (err) {
    console.error("Unexpected error in user rating assignment:", err);
    return NextResponse.json({ success: "not ok", error: (err as Error).message }, { status: 500 });
  }
};