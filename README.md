## ***Your Digital Renaissance Book Garden***
*This app is built for those that want to rekindle that spark and love for reading they had as children and teenagers but lost somewhere along the way, as well as those that have a reading routine and want to sustain it with momentum to not lose it.*

The building project name is Book Momentum but the final name is very subject to change.  
EDIT jul 7: The name for now is _Florilegium_!  
<img width="1891" height="823" alt="Screenshot_2026-07-07_17-53-36" src="https://github.com/user-attachments/assets/23c02e2e-04b3-4574-8d1b-9856b44df1ae" />
<img width="1891" height="823" alt="Screenshot_2026-07-07_17-36-19" src="https://github.com/user-attachments/assets/9e11da40-af2d-4404-8e94-d3aa088cffb3" />


I am patient zero. I have just gotten back into reading and I want to keep my momentum. I read an incredible amount as a kid. But I noticed a month ago that I had lost that love now as an adult in this fast-moving world. I'm building an app that I myself will use first and foremost and then I'll build it out with Friends and social features.

**The main features of this app are all built around _intentionality_** 

### **Horizon Books**
A user can have up to 5 Horizon Books. These are the books where it's not a question about *if* you're going to read them but ***when.*** The dense literary masterpieces that you don't want to dive into in the beginning of your reading journey or when just starting out again. You want to work your way up to these, build momentum enough to tackle them. But we also always when them visible on the user's horizon in their reading journey.  
Intentionally restricted and kept to a maximum of 5 at any given time, even 10 would be too many. We don't want this to become "TBR Pile: Part 2". This special list is all about clarity and conscious choice. When the user marks a Horizon Books as Reading, they will be met with a message of encouragement and when it's then switched to Read, they will be greeted with a message of gratification and celebration. At this point they are also able to slot a new Horizon book into the now-empty slot.  
My 5 Horizon Books are Brothers Karamazov, The Count of Monte Cristo, Crime and Punishment, Lonesome Dove, and The Stormlight Archive series

### **Reading Tracks**
A user will be able to have 1 to 5 parallell Reading Tracks at any given time. And for any given Reading Track, they can have 1 active book. When a book is slotted into a track as Currently Reading, the UI intelligently prompts the user to define the _Follow-Up_, removing all friction from picking up their next read. If the Currently Reading is part of a series, the app suggests the next book in the series by default.  
My 3 Reading Tracks are Fiction, Non-fiction, and Bedtime (Harry Potter before bed is a non-negotiable haha!)

### **Reading Session**
My Lock In Intention timer code will be borrowed over here! Put in a new context as an integrated, distraction-free reading timer. And when life inevitably interrupts a session, there is no punishing "Quit" or "Reset" button. The user clicks **Wrap Up**, the timer freezes, and a contextual log slides up allowing them to capture the exact partial time and pages read alongside a reflection note.

### **Recommendation Provenance**
Book recommendations rarely appear in a vacuum. An absence of Goodreads that baffles me is the inability to add notes to book in your "Want to Read" list. A user will be able to here; in their TBR stack, they can attach context to _how_ a book found them (e.g., a YouTube video, a friend's recommendation, or a podcast quote)

### **Re-Reading Journeys!**
I want the app to highly encourage re-reading of the books in "My Bookshelf". Heraclitus said _"No man ever steps in the same river twice."_ If a user returns to a favorite book years later, historical reading sessions won't bleed into the current one and instead becomes its own Reading Journey. There are so many books that I myself want to revisit now with fresh new eyes!  
Quick note on having books makred as "Read" and rating them: 4.5 is now possible! One of my biggest gripes with Goodreads is that I can't rate books 4.5 and 3.5 haha!

### **Some of the technical stuff**
The project is built using Next.js, TypeScript and TailwindCSS.  
The external API for all book data started as Gutenberg API: https://gutenbergapi.com/, but every single image took at least 5-6 seconds to load so 2 days in I switched to Open Library's API: https://openlibrary.org/developers/api. The images load way faster now! But the biggest downside by far is the inconsistency in their data and data shapes which means that there's been a lot of vibe coding just to get in a predictable TypeScript interface shape.  
Open Library acts as the massive library and the main source of book data. But when a user wants to add a book to their User Bookshelf, we create a "local copy" to our own Book table with only the essential data for the app to function for faster look-ups now that we've confirmed this is a relevant book to the users. 

<img width="949" height="951" alt="BookMomentum drawio" src="https://github.com/user-attachments/assets/bc62b82d-6029-41b0-82dd-f44ca5628513" />

The Book table has all the book-specific data for a specific Edition of a book, the Bookshelf_Item table has all the user-specific data for a specific instance of said book. Changing editions of a book in My Bookshelf is something the database easily allows.

Rather than having an is_horizon_book boolean in the Bookshelf_Item table, I've opted for a horizon_slot integer row which will be a nullable integer between 1 to 5. A boolean can only give *if* a book is a Horizon Book, the integers can also give *the order* which simplifies building the UI a lot! The exact same rationale applies to the Peak books and peak_slot


Design-wise, I want to lean heavily into "Digital Renaissance Book Garden". Lots of green, olive etc.

I'll add and elaborate more here as I build 🌱
