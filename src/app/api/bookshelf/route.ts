// For inserting and updating items onto the user's Bookshelf. Affects the Bookshelf_Item table
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await req.json();

    // The server provides all data except added_at that Postgres can automatically generate
    // When creating and inserting a bookshelf item, we omit horizon_slot, peak_slot and user_rating; these are updated in a separate fetch
    const itemId = crypto.randomUUID();

    const query = {
      name: 'insert-user-bookshelf-item',
      text: 'INSERT INTO "Bookshelf_Item"(id, user_id, book_id, status_id) VALUES($1, $2, $3, $4) RETURNING *',
      values: [itemId, user.id, body.book_id, body.status_id]
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

export async function GET(_req: Request) { // We accept req just in case we need URL parameters later. `_req` and not `req` to signal to TS "I know I'm not using this variable but it will be used!"
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const query = {
      name: 'get-user-bookshelf-for-horizon', // Specific Horizon fetch query for now. We'll build it out with dynamic parameters later as needed
      // The query itself is a chonky one, slightly overwhelming to look at haha! But we need a JOIN cuz we need data from both the
      // Bookshelf_Item and the Book table. They're joined on book_id (id in the Book table). This is Database 101 coming back haha
      // `WHERE bi.user_id = $1` This is a crucial line to ensure we only return results for the user in question
      // `AND bi.status_id IN (1, 2)` This is specific to only this Horizon fetch query
      // `ORDER BY bi.added_at DESC` Golden rule of backend engineering: Leverage the power of the database! Always let Postgres that is written
      // in ultra-optimized C do sorting and filtering. It does it faster than any JavaScript we can possibly write haha
      text: `
        SELECT 
          bi.id AS bookshelf_item_id, 
          bi.status_id, 
          bi.horizon_slot,
          b.id AS book_id, 
          b.title, 
          b.author, 
          b.cover_image_url, 
          b.page_count
        FROM "Bookshelf_Item" bi
        JOIN "Book" b ON bi.book_id = b.id
        WHERE bi.user_id = $1 
          AND bi.status_id IN (1, 2) 
        ORDER BY bi.added_at DESC
      `,
      values: [user.id]
    };

    const res = await pool.query(query);
    const bookshelfItems = res.rows; // Not `res.rows[0];`! Muscle memory to break when consciously needed haha; here we actually want all the rows!
    console.log("Bookshelf items retrieved from user for Horizon fetch", bookshelfItems);

    return NextResponse.json({
      success: "ok",
      data: bookshelfItems // No need to make it an array of Book objects; this *is* the array! We simply return it haha!
    });
  } catch (err) {
    console.error("Unexpected error when trying to retrieve user Bookshelf", err);
    return NextResponse.json({ success: "not ok" }, { status: 500 });
  }
};