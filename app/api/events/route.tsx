import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { EventModel } from "@/database/event.model"; 
import { v2 as cloudinary } from "cloudinary";
import { Buffer } from "buffer";
import { get } from "http";


export async function POST(request:NextRequest){
    try {
    await connectToDatabase();
    const formData=await request.formData();
    let event;
    try{
    event=Object.fromEntries(formData.entries());
    }catch(e){
        return NextResponse.json( { message:"Invalid form data"}, { status: 400 } );
    }

    const file =formData.get("image") as File;
    if(!file)return NextResponse.json( { message:"Image file is required"}, { status: 400 } );
    let tags=JSON.parse(formData.get("tags") as string);
     let agenda=JSON.parse(formData.get("agenda") as string);
   const arrayBuffer=await file.arrayBuffer();
   const buffer=Buffer.from(arrayBuffer);

   const uploadresult=await new Promise((resolve,reject)=>{
    cloudinary.uploader.upload_stream({resource_type:"image",folder:"dev_events"},(error,result)=>{
        if (error) return reject(error);

        resolve(result);
    }).end(buffer);     
   });
    event.image=(uploadresult as {secure_url:string}).secure_url;

    const createEvent=await EventModel.create({...event,tags:tags,agenda:agenda});
    return NextResponse.json( { message:"Event created successfully",data:createEvent}, { status: 201 } );

    }catch (e) {
        console.error( e);

        return NextResponse.json( { message:"Failed to create event",error:e instanceof Error?e.message:"UnKnown"}, { status: 500 } );
    }
}

export async function GET(){
    try{
    await connectToDatabase();
    const events=await EventModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json( { message:"Events fetched successfully",data:events}, { status: 200 } );
    }catch(e){
   return NextResponse.json( { message:"Failed to fetch events",error:e }, { status: 500 } );
    }
}