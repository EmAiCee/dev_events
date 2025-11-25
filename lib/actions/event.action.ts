'use server';
import { EventModel } from '@/database'; 
import connectToDatabase from '../mongodb';
 export const getSimilarEventsBySlug=async (slug:string)=>{
    try{

        await connectToDatabase();
       
           const event = await EventModel.findOne({slug  });
           const similarEvents = await EventModel.find({
            _id: { $ne: event?._id },
            tags: { $in: event?.tags }
           }).lean().limit(3);
           return similarEvents;
    }catch(error){
        console.error("Error fetching similar events:", error);
        return [];
    }
 }
