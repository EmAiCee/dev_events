import { title } from "process"
import ExploreBtn from "./components/ExploreBtn"
import EventCard from "./components/EventCard"
import { Event } from "@/database"
import { cacheLife } from "next/cache";
import { headers } from 'next/headers';
// import { events } from "@/lib/constant"

const page = async () => {
  'use cache';
  cacheLife('hours')
  
  // Get the base URL dynamically
  const headersList = await headers();
  const host = headersList.get('host');
  
  // Determine protocol (http for local, https for production)
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  
  // Use VERCEL_URL in production if available, otherwise construct from host
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_BASE_URL 
      ? process.env.NEXT_PUBLIC_BASE_URL
      : `${protocol}://${host}`;

  try {
    const response = await fetch(`${baseUrl}/api/events`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      console.error('Failed to fetch events:', response.status);
      return (
        <section>
          <h1 className='text-center'>Failed to load events</h1>
        </section>
      );
    }
    
    const { events } = await response.json();

    return (
      <section>
        <h1 className='text-center'>The Hub For Every Web3 <br /> Event You Can't Miss</h1>
        <p className='text-center mt-5'>Hackathons, Meetups, Conferences, and Tech Talks All in One Place</p>
        <ExploreBtn/>

        <div className="mt-20 space-y-7">
          <h3>Featured Events</h3>
          <ul className="events list-none">
            {events && events.length > 0 && events.map((event: Event) => (
              <li key={event.title}>
                <EventCard {...event}/>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Error fetching events:', error);
    return (
      <section>
        <h1 className='text-center'>Failed to load events</h1>
      </section>
    );
  }
}

export default page;