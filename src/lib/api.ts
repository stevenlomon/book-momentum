// For our communication with the Gutenberg API where we'll get all book data. A lot of the code will be borrowed from my PokéCollector Next.js re-build
const BASE_URL = "https://project-gutenberg-free-books-api1.p.rapidapi.com";

// Small helper function so that we don't have to repeat headers
function getHeaders() {
  const apiKey = process.env.GUTENBERG_API_KEY;
  
  // Fail early and fail loud
  if (!apiKey) {
    throw new Error(
      "CRITICAL: GUTENBERG_API_KEY is missing. Set it in .env or .env.local!"
    );
  }

  return {
    'Content-Type': 'application/json',
    'x-rapidapi-host': 'project-gutenberg-free-books-api1.p.rapidapi.com',
    'x-rapidapi-key': apiKey
  }
};

export const searchBooks = async (query: string, page = 1, limit = 20) => { // Keeping the exact same function defition like in the Pokémon project (minus the function name)..
  try {
    // ..but map to the actual API keys! page maps the same but limit maps to page_size here
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      page_size: limit.toString()
    });

    const res = await fetch(`${BASE_URL}/books?${params.toString()}`, {
      headers: getHeaders(),
    });

    if (!res.ok) {
      // If the API returns a 404 or 500, we throw our own clear error of type Error
      throw new Error(`Gutenberg API returned status: ${res.status}`);
    }

    return res.json(); // Parse the external JSON from Gutenberg into a JS object
  
  } catch(err) {
    // Whether `err` is already of type Error or not, we log the raw, ugly error to the server console for US to debug
    console.error(`Server error fetching books using searchBooks:`, err);

    // Now; normalize the error so that the UI (our to-be-built `error.tsx`) always gets a predictable Error object
    if (err instanceof Error) { 
      // If it is *already* of type Error...
      throw err; // ..simply toss it up the chain to the UI
    } else {
      // Else..
      throw new Error("An unexpected network error occurred while contacting Gutenberg."); // ..create our own Error object
    }
  }
};