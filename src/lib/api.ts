import { Book, Author } from './types';

// For our communication with the Open Library (dropped Gutenberg) where we'll get all book data
const BASE_URL = 'https://openlibrary.org';
const COVER_BASE_URL = 'https://covers.openlibrary.org/b/id';

// Small helper function so that we don't have to repeat headers
function getHeaders() {
  // Open Library requires no API key!

  return {
    'Content-Type': 'application/json',
    // Identifying our app per Open Library's request for better rate limits
    'User-Agent': 'Florilegium/1.0 (steven.lennartsson@gmail.com)'
  }
};

export const searchBooks = async (query: string, page = 1, limit = 5) => { // Keeping the exact same function defition like in the Pokémon project. Limit default dropped to 5 now with Open Library
  try {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
      fields: 'key,title,author_name,subject,cover_i,editions,editions.key,editions.number_of_pages' // We explicitly ask only for what we need. Now includes editions and page count
    });

    const res = await fetch(`${BASE_URL}/search.json?${params.toString()}`, {
      headers: getHeaders(),
    });

    if (!res.ok) {
      // If the API returns a 404 or 500, we throw our own clear error of type Error
      throw new Error(`Open Library API returned status: ${res.status}`);
    }

    const data = await res.json(); // Parse the external JSON from Open Library into a JS object. But we don't return yet!

    // Map Open Library's layout into our 'Book' type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedBooks: Book[] = (data.docs || []).map((doc: any) => { // `any` since it's 3rd party data
      // Open Library Keys look like "/works/OL27448W". We split and grab the actual ID.
      const rawId = doc.key ? doc.key.split('/').pop() : Math.random().toString();

      // Grab the "default" edition Open Library picked!
      const bestEdition = doc.editions?.docs?.[0];
      const editionId = bestEdition?.key ? bestEdition.key.split('/').pop() : null;

      return {
        id: rawId, // We keep the Work ID as the main ID
        title: doc.title || 'Unknown Title',
        authors: (doc.author_name || []).map((name: string) => ({ name })),
        subjects: doc.subject || [],
        summary: '', // Search API doesn't return summaries; we'll fetch this on the detailed view
        // If they have a cover_i (Cover ID), we manually construct the CDN URL
        // -M means Medium size. We use -L (Large) for the detailed view later.
        cover_image: doc.cover_i ? `${COVER_BASE_URL}/${doc.cover_i}-M.jpg` : '',
        page_count: bestEdition?.number_of_pages || null,
        default_edition_id: editionId,
      };
    });

    return { results: mappedBooks };

  } catch (err) {
    // Whether `err` is already of type Error or not, we log the raw, ugly error to the server console for US to debug
    console.error(`Server error fetching books using searchBooks:`, err);

    // Now; normalize the error so that the UI (our to-be-built `error.tsx`) always gets a predictable Error object
    if (err instanceof Error) {
      // If it is *already* of type Error...
      throw err; // ..simply toss it up the chain to the UI
    } else {
      // Else..
      throw new Error("An unexpected network error occurred while contacting Open Libary."); // ..create our own Error object
    }
  }
};

export const getBookById = async (id: string): Promise<Book> => {
  try {
    // Fetch the exact Work using the ID we stripped out during the search
    const res = await fetch(`${BASE_URL}/works/${id}.json`, {
      headers: getHeaders(),
    });

    if (!res.ok) throw new Error(`Open Library API returned status: ${res.status}`);

    const data = await res.json(); // Once again, we can't return yet. Open Library's data is.. extensive haha

    // Safely extract the summary (handling Open Library's string vs. object quirk)
    let summary = '';
    if (typeof data.description === 'string') {
      summary = data.description;
    } else if (data.description && data.description.value) {
      summary = data.description.value;
    }

    // Construct the Large (-L) cover image URL
    const coverId = data.covers && data.covers.length > 0 ? data.covers[0] : null;
    const coverUrl = coverId ? `${COVER_BASE_URL}/${coverId}-L.jpg` : '';

    // Fetch Author Names in parallel using their Author Keys
    const authors: Author[] = [];
    if (data.authors && Array.isArray(data.authors)) {
      // Map over the author keys and fire off simultaneous fetch requests
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const authorPromises = data.authors.map(async (a: any) => {
        if (a.author && a.author.key) {
          const authorRes = await fetch(`${BASE_URL}${a.author.key}.json`, {
            headers: getHeaders(),
          });
          if (authorRes.ok) {
            const authorData = await authorRes.json();
            return { name: authorData.name || 'Unknown Author' };
          }
        }
        return { name: 'Unknown Author' };
      });

      // Wait for all author names to return
      const resolvedAuthors = await Promise.all(authorPromises);
      authors.push(...resolvedAuthors);
    }

    // We will actively hunt for an edition with a page count!
    let pageCount: number | null = null;
    let defaultEditionId: string | undefined = undefined;

    try {
      // Fetch the editions associated with this Work
      const editionsRes = await fetch(`${BASE_URL}/works/${id}/editions.json?limit=50`, {
        headers: getHeaders(),
      });

      if (editionsRes.ok) {
        const editionsData = await editionsRes.json();
        const editions = editionsData.entries || [];

        // Find the FIRST edition in the list that actually has a valid number_of_pages!
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const editionWithPages = editions.find((ed: any) =>
          typeof ed.number_of_pages === 'number' && ed.number_of_pages > 0
        );

        if (editionWithPages) {
          const rawPages = editionWithPages.number_of_pages;
          // Rounds to the nearest 50, with a floor of 50 to prevent 0-page books
          pageCount = Math.max(50, Math.round(rawPages / 50) * 50);
          defaultEditionId = editionWithPages.key.split('/').pop();
        } else if (editions.length > 0) {
          // Fallback: If NONE of them have pages, just grab the ID of the first edition
          defaultEditionId = editions[0].key.split('/').pop();
        }
      }
    } catch (err) {
      console.warn(`Could not fetch editions for Work ${id}:`, err);
    }

    // Map everything back into our UI's expected Book type
    return {
      id: id,
      title: data.title || 'Unknown Title',
      authors: authors.length > 0 ? authors : [{ name: 'Unknown Author' }],
      subjects: data.subjects || [],
      summary: summary,
      cover_image: coverUrl,
      page_count: pageCount,
      default_edition_id: defaultEditionId,
    };
  } catch (err) {
    console.error(`Server error fetching book details with id ${id} using getBookById:`, err);

    if (err instanceof Error) {
      throw err; //
    } else {
      throw new Error("An unexpected network error occurred while contacting Open Library."); //
    }
  }
};