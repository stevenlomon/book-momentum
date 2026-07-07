// Our own internal book API that will be used to create "local copies" of Open Libary books whenever a user adds them to their Bookshelf
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // The server provides all data except id that Postgres can automatically generate. It's here that I realize that I can't possibly
    // include goodreads_url since the URL contains an id that I can't possibly know haha. The row is now deleted from the table
    const query = {
      name: 'insert-open-library-book',
      text: 'INSERT INTO "Book"(title, author, external_provider, external_id, page_count, cover_image_url) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
      values: [body.title, body.author, body.external_provider, body.external_id, body.page_count, body.cover_image_url]
    }
    const res = await pool.query(query);
    const book = res.rows[0];
    console.log("Book insertion results", book);

    return NextResponse.json({
      success: "ok",
      data: {
        title: book.title,
        author: book.author,
        external_provider: book.external_provider,
        external_id: book.external_id,
        page_count: book.page_count,
        cover_image_url: book.cover_image_url
      }
    });
  } catch (err) {
    console.error("Unexpected error when trying to insert Open Libary book", err);
    return NextResponse.json({ success: "not ok" }, { status: 500 });
  }
};

export async function GET(req: Request) {
  // To be implemented
}