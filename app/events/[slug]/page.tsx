import { get, request } from "http";
import { notFound } from "next/navigation";
import Image from "next/image"
import BookEvent from "@/app/components/BookEvent";
import { getSemilarEventsBySlug } from "@/lib/actions/event.action";
import { EventEmitter } from "stream";
import EventCard from "@/app/components/EventCard";
const BASE_URL=process.env.NEXT_PUBLIC_BASE_URL;

const EventdetailItem=({icon,alt,label}:{icon:string,alt:string,label:string})=>{
 return(
  <div className="flex gap-2 items-center">
    <Image src={icon} alt={alt} width={16} height={16}/>
    <p>{label}</p>
  </div>
 )
}
const EventAgenda = ({ agendaitems }: { agendaitems: string[] }) => {
  return (
    <div className="agenda">
      <h2>Agenda</h2>
      <ul>
        {agendaitems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
};
const Eventtags=({tags}:{tags:string[]})=>{
  return(
    <div className="flex felx-row gap-2 flex-wrap">
    {tags.map((tag)=>(
      // <span key={tag} className="tag">{tag}</span>
      <span className="pill" key={tag} >{tag}</span>
    ))}
  </div>
  )
}
const Eventdetails = async  ({params}:{params:Promise<{slug:string}>}) => {
    const {slug}=await params;
 const request = await fetch(`${BASE_URL}/api/events/${slug}`, { cache: "no-store" });
const  event = await request.json();


    if(!event) return notFound();
    const bookings=20;
    const similarEvents= await getSemilarEventsBySlug(slug); 
   

  return (
    <section id="event">
    <div className="header">
      
     <h1>Event Description</h1>
     <p>{event.description}</p>
    </div>

    <div className="details">
{/* left side for hte conntent */}
<div className="content">
<Image src={event.image} alt="event" width={800} height={800} className="banner"/>
<section className="flex-col-gap-2">
  <h2>Overview</h2>
  <p>{event.overview}</p>
</section>
<section className="flex-col-gap-2">
  <h2>Event Details</h2>
 <EventdetailItem icon="/icons/calendar.svg" alt="date" label={event.date} />
  <EventdetailItem icon="/icons/clock.svg" alt="time" label={event.time} />
  <EventdetailItem icon="/icons/pin.svg" alt="location" label={event.location} />
  <EventdetailItem icon="/icons/mode.svg" alt="mode" label={event.mode} />
  <EventdetailItem icon="/icons/audience.svg" alt="audience" label={event.audience} />
 
</section>
<EventAgenda agendaitems={event.agenda} />
<section className="flex-col-gap-2">
  <h2>About The Organizer</h2>
  <p>{event.organizer}</p>
</section>
<Eventtags tags={event.tags} />
</div>
{/* rifht side fo booking event */}
<aside className="booking">
 <div className="signup-card">
<h2>Book Your Event</h2>
{bookings>0 ? (
  <p className="text-sm">join {bookings} people who have aready booked their spot</p>
):(
  <p className="text-sm"> Be the first one to book your spot!</p>
)}
<BookEvent slug={slug} />
 </div>
</aside>
    </div>

    <div className="flex w-full  flex-col gap-4 pt-20">
      <h2>Similar Events</h2>
     <div className="events">
      {similarEvents.length>0 && similarEvents.map((similarEvent)=>
        (
          <EventCard key={similarEvent._id} {...similarEvent} />

        ))}
     </div>
      
    </div>
    </section>
  )
}

export default Eventdetails