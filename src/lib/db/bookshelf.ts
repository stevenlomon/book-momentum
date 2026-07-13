import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { pool } from '@/lib/db';
import { type BookshelfItem } from '../types';

export async function getDetailedBookshelf(): Promise<BookshelfItem[]> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  // In order for the initial fetch to also include recommendation rows, the query has grown. Oh boy has it grown haha. This is the most 
  // intimidating SQL query I've seen in my 3 years of programming. I have never seen COALESCE before. And I have taken "Advanced SQL" 
  // courses on LinkedIn learning haha! 
  // It's Saturday as of writing this and I am imposing a hard rule on myself to create some distance with the codebase in order to let it 
  // all marinate; no more new features until I understand this SQL query. And I will sit down with the intent to do that now on Monday. I 
  // am making it a conscious point to not rack up a mountain of technical debt. I want to be a developer and engineer of integrity.
  // Til Monday, there will only be polishing of the features that are already implemented and UX polishes. Maintaining! To get familiar with
  // the codebase that has *already* grown a bit faster than I can wrap my mind around.
  const query = {
    name: 'get-user-bookshelf-all',
    // It is Monday morning and I have had Gemini act infinitely patient senior developer and... this query is not as scary anymore! In fact!
    // COALESCE is by far the *least* scary part and the easiest to understand! Let's take this in the order it unfolded and clicked with me,
    // starting with the question I first asked: why can't we just JOIN the three tables Book, Bookshelf_Item, and Recommendation_Context_Row?
    // Because. There would be several rows per bookshelf item to accomodate for the Recommendation_Context_Row columns:
    // bookshelf_item_id, title,   author, recommended_by, link, notes
    // 101,               My book, me :),  Bob,            NULL  "Scuffed book, but a fun time"
    // 101,               My book, me :),  Dave,           NULL  "What?"
    // We'd rather not want this. Compounded over every single item in our bookshelf, it would be a lot of bloat. 
    // So the core engine of this query is `json_agg` working with `json_build_object` and `GROUP BY bi.id, b.id`. These ensure that we get a
    // single column recommendation_context instead for every book, all in one row! Where the recommendation context is in neat JSON
    // bookshelf_item_id, title,   author, recommendation_context
    // 101,               My book, me :),  [{"recommended_by": "Bob", ...}, {"recommended_by": "Dave", ...}]
    // We need `GROUP BY bi.id, b.id` since we're matching by both the id of the Bookshelf_Item table and the id of the Book table
    // The output of this core engine is wrapped in `COALESCE` and also uses a neat `FILTER (WHERE rcr.id IS NOT NULL)`
    // FILTER (WHERE rcr.id IS NOT NULL) ensure there are no "ghost rows"; if there is no recommendation context for a bookshelf item, skip it
    // To understand COALESCE and the role it plays here, there is one important piece of information to consider; if the filter was to do a
    // *too* good of a job, and there are *no* recommendation context for *any* bookshelf items, the output of the core engine would be NULL.
    // Postgres itself would be okay with this! The object arriving in Next.js would simply be `recommendation_context: null`. What would crash
    // is our JavaScript code on the frontend when it tries to call `.map()` on an empty list! COALESCE acts a safety net. And speaking of JS, 
    // it acts just like a ternary operator!
    // `const recommendation_context = output_of_json_agg !== NULL ? output_of_json_agg : []`
    // Or! The more elegant version that uses what in JavaScript it even called The Nullish *Coalescing* Operator! They're siblings haha! Doing
    // the exact same thing in two different environment.
    // `const recommendation_context = output_of_json_agg ?? []`
    // It works exactly the same here. Query conquered! 🌿
    text: `
      SELECT 
        bi.id AS bookshelf_item_id,
        bi.status_id,
        bi.user_rating,
        b.id AS book_id,
        b.external_id,
        b.title,
        b.author,
        b.cover_image_url,
        COALESCE(
          json_agg(
            json_build_object(
              'id', rcr.id,
              'bookshelf_item_id', rcr.bookshelf_item_id,
              'recommended_by', rcr.recommended_by,
              'link', rcr.link,
              'notes', rcr.notes
            )
          ) FILTER (WHERE rcr.id IS NOT NULL),
          '[]'
        ) AS recommendation_context
      FROM "Bookshelf_Item" bi
      JOIN "Book" b ON bi.book_id = b.id
      LEFT JOIN "Recommendation_Context_Row" rcr ON bi.id = rcr.bookshelf_item_id
      WHERE bi.user_id = $1
      GROUP BY bi.id, b.id
      ORDER BY bi.added_at DESC
    `,
    values: [user.id]
  };

  const res = await pool.query(query);
  const initialBooks = res.rows;

  return initialBooks;
};