import { Schema, model, models, Document, Model, Types } from 'mongoose';
import EventModel, { EventDocument } from './event.model';

/**
 * Core shape of a Booking document (excluding Mongoose-specific properties).
 */
export interface Booking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingDocument = Booking & Document;

/**
 * Basic email format validation using a conservative regular expression.
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase());
}

const bookingSchema = new Schema<BookingDocument>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true, // index to speed up event-based lookups
    },
    email: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value: string) => isValidEmail(value),
        message: 'Invalid email format for Booking.email',
      },
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Pre-save hook for Booking documents:
 * - Ensures the referenced Event exists.
 * - Re-validates email format defensively before persisting.
 */
bookingSchema.pre<BookingDocument>('save', async function preSave(next) {
  try {
    // Verify that the referenced event exists.
    const eventExists = await EventModel.exists({ _id: this.eventId }).lean<EventDocument>().exec();
    if (!eventExists) {
      throw new Error('Cannot create Booking: referenced Event does not exist');
    }

    // Defensive email validation prior to save.
    if (typeof this.email !== 'string' || this.email.trim().length === 0) {
      throw new Error('Booking.email is required and must be a non-empty string');
    }

    const normalizedEmail = this.email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      throw new Error('Invalid email format for Booking.email');
    }

    this.email = normalizedEmail;

    next();
  } catch (error) {
    next(error as Error);
  }
});

export const BookingModel: Model<BookingDocument> =
  (models.Booking as Model<BookingDocument>) || model<BookingDocument>('Booking', bookingSchema);

export default BookingModel;
