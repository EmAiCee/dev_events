import { Schema, model, models, Document, Model } from 'mongoose';

/**
 * Core shape of an Event document (excluding Mongoose-specific properties).
 */
export interface Event {
  title: string;
  slug?: string; // optional now
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // ISO format
  time: string; // HH:mm 24-hour
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type EventDocument = Event & Document;

/** Slugify helper */
function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Normalize date to YYYY-MM-DD */
function normalizeDate(dateInput: string): string {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid date format for Event.date');
  return date.toISOString().split('T')[0];
}

/** Normalize time to HH:mm */
function normalizeTime(timeInput: string): string {
  const match = timeInput.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) throw new Error('Invalid time format for Event.time');
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59)
    throw new Error('Invalid time value for Event.time');
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/** Event schema */
const eventSchema = new Schema<EventDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: { type: [String], required: true, validate: (v: string[]) => v.length > 0 },
    organizer: { type: String, required: true, trim: true },
    tags: { type: [String], required: true, validate: (v: string[]) => v.length > 0 },
    slug: { type: String, unique: true, trim: true }, // optional, stored in DB
  },
  { timestamps: true }
);

/** Ensure slug uniqueness */
eventSchema.index({ slug: 1 }, { unique: true });

/** Pre-save hook to generate slug & normalize fields */
eventSchema.pre<EventDocument>('save', function (next) {
  try {
    const requiredFields: Array<keyof Event> = [
      'title',
      'description',
      'overview',
      'image',
      'venue',
      'location',
      'mode',
      'audience',
      'organizer',
    ];
    for (const field of requiredFields) {
      const value = this.get(field);
      if (typeof value !== 'string' || value.trim().length === 0)
        throw new Error(`Event.${String(field)} is required and must be non-empty`);
      this.set(field, value.trim());
    }

    this.date = normalizeDate(this.date);
    this.time = normalizeTime(this.time);

    // Generate slug if missing or title changed
    if (!this.slug || this.isNew || this.isModified('title')) {
      this.slug = slugifyTitle(this.title);
    }

    next();
  } catch (err) {
    next(err as Error);
  }
});

export const EventModel: Model<EventDocument> =
  (models.Event as Model<EventDocument>) || model<EventDocument>('Event', eventSchema);

export default EventModel;
