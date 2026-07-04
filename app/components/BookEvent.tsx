'use client';

import React, { useState } from 'react';
import { createBooking } from '@/lib/actions/booking.action';

interface BookEventProps {
  slug: string;
}

const BookEvent: React.FC<BookEventProps> = ({ slug }) => {
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      // 1️⃣ Create booking
      console.log('🔹 Creating booking for:', email);
      const bookingResult = await createBooking(slug, email);

      if (!bookingResult.success) {
        console.error('BOOKING ERROR:', bookingResult);
        setMessage(bookingResult.error ?? 'Failed to create booking.');
        return;
      }

      if (bookingResult.alreadyBooked) {
        setMessage('You have already booked this event.');
        setSubmitted(true);
        return; // Do not send email if already booked
      }

      // 2️⃣ Booking is new, send email
      console.log('🌐 Calling /api/send-mail-confirmation...', { email, slug });
      const response = await fetch(`${window.location.origin}/api/send-mail-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          eventId: slug,
        }),
      });

      console.log('🌐 Email API response status:', response.status);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        console.error('EMAIL ERROR: API responded with non-OK status', {
          status: response.status,
          statusText: response.statusText,
          body: errorBody,
        });
        setMessage('Thank you for booking! (Failed to send confirmation email)');
      } else {
        console.log('📨 Email sent successfully');
        setMessage(`Thank you for booking! A confirmation email has been sent to ${email}.`);
      }

      setSubmitted(true);
    } catch (err) {
      console.error('BOOKING ERROR: Unexpected error', err);
      setMessage('An unexpected error occurred while processing your booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="book-event">
      {submitted ? (
        <div>
          <h2>Thank you for booking!</h2>
          {message && <p>{message}</p>}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex-col-gap-4">
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Your Email Address"
              required
              disabled={isSubmitting}
            />
          </div>
          <button type="submit" className="button-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          {message && <p>{message}</p>}
        </form>
      )}
    </div>
  );
};

export default BookEvent;