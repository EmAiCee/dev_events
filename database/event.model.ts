import { Schema, model, models, Document, Model } from 'mongoose';

/**
 * Core shape of an Event document (excluding Mongoose-specific properties).
 */
export interface Event {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // Normalized date string (ISO format)
  time: string; // Normalized time string (HH:mm, 24-hour)
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type EventDocument = Event & Document;

/**
 * Simple slugify helper to generate URL-friendly slugs from titles.
 */
function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric characters
    .replace(/\s+/g, '-') // replace spaces with dashes
    .replace(/-+/g, '-'); // collapse multiple dashes
}

/**
 * Normalize a date string to ISO-8601 (YYYY-MM-DD) format.
 * Throws if the date is invalid.
 */
function normalizeDate(dateInput: string): string {
  const date = new Date(dateInput);

  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date format for Event.date');
  }

  // Keep only the date part in UTC (YYYY-MM-DD)
  const iso = date.toISOString();
  return iso.split('T')[0];
}

/**
 * Normalize time to HH:mm (24-hour) format.
 * Accepts inputs like "9:00", "09:00", "21:30".
 */
function normalizeTime(timeInput: string): string {
  const trimmed = timeInput.trim();

  // Basic HH:mm or H:mm validation
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    throw new Error('Invalid time format for Event.time (expected H:MM or HH:MM)');
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error('Invalid time value for Event.time');
  }

  // Zero-pad to HH:mm
  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

const eventSchema = new Schema<EventDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
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
  },
  {
    timestamps: true,
  },
);

// Ensure slug has a unique index at the database level.
eventSchema.index({ slug: 1 }, { unique: true });

/**
 * Pre-save hook for Event documents:
 * - Generates a slug from the title when creating or when the title changes.
 * - Normalizes `date` to a canonical ISO (YYYY-MM-DD) string.
 * - Normalizes `time` to HH:mm (24-hour) format.
 * - Ensures required string fields are non-empty after trimming.
 */
eventSchema.pre<EventDocument>('save', function preSave(next) {
  try {
    // Validate and normalize basic string fields.
    const requiredStringFields: Array<keyof Event> = [
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

    for (const field of requiredStringFields) {
      const value = this.get(field);
      if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`Event.${String(field)} is required and must be a non-empty string`);
      }
      this.set(field, value.trim());
    }

    // Normalize date and time.
    this.date = normalizeDate(this.date);
    this.time = normalizeTime(this.time);

    // Only regenerate slug when the title is new or has changed.
    if (this.isNew || this.isModified('title')) {
      this.slug = slugifyTitle(this.title);
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

export const EventModel: Model<EventDocument> =
  (models.Event as Model<EventDocument>) || model<EventDocument>('Event', eventSchema);

export default EventModel;
