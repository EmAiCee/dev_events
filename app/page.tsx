import ExploreBtn from "./components/ExploreBtn"
import EventCard from "./components/EventCard"
import { Event } from "@/database"
import { cacheLife, unstable_cache } from "next/cache";
import { headers } from 'next/headers';

// Move data fetching to a separate cached function
const getEvents = unstable_cache(
  async () => {
    // Get the base URL outside of cache
    const headersList = await headers();
    const host = headersList.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL 
        ? process.env.NEXT_PUBLIC_BASE_URL
        : `${protocol}://${host}`;

    try {
      const response = await fetch(`${baseUrl}/api/events`, {
        next: { revalidate: 3600 }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`);
      }
      
      const { events } = await response.json();
      return events;
    } catch (error) {
      console.error('Error fetching events:', error);
      return null;
    }
  },
  ['events'], // Cache key
  { revalidate: 3600 } // Cache for 1 hour
);

const page = async () => {
  'use cache';
  cacheLife('hours');
  
  const events = await getEvents();

  if (!events) {
    return (
      <section>
        <h1 className='text-center'>Failed to load events</h1>
      </section>
    );
  }

  return (
    <section>
      <h1 className='text-center'>The Hub For Every Web3 <br /> Event You Can't Miss</h1>
      <p className='text-center mt-5'>Hackathons, Meetups, Conferences, and Tech Talks All in One Place</p>
      <ExploreBtn/>

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>
        <ul className="events list-none">
          {events.length > 0 && events.map((event: Event) => (
            <li key={event.title}>
              <EventCard {...event}/>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default page;