import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { EventModel } from '@/database'; // EventDocument type is not needed here

interface RouteParams {
  slug: string;
}

/**
 * GET /api/events/[slug]
 *
 * Returns a single event document by its slug.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { slug } = await params; // <-- MUST AWAIT

    if (!slug || typeof slug !== "string" || slug.trim().length === 0) {
      return NextResponse.json(
        { message: "Invalid or missing slug parameter" },
        { status: 400 }
      );
    }

    const normalizedSlug = slug.trim().toLowerCase();

    await connectToDatabase();

    const event = await EventModel.findOne({ slug: normalizedSlug }).lean();

    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    const { __v, ...safeEvent } = event;

    return NextResponse.json(safeEvent, { status: 200 });

  } catch (error) {
    console.error("Failed to fetch event by slug:", error);

    return NextResponse.json(
      { message: "An unexpected error occurred while fetching the event" },
      { status: 500 }
    );
  }
}
