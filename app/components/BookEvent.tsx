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
  const [emailWarning, setEmailWarning] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setMessage(null);
    setEmailWarning(null);

    try {
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

      // Booking is new, attempt to send email
      let emailStatusMessage = '';
      try {
        const response = await fetch('/api/send-mail-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name: bookingResult.name || 'Guest',
            eventId: slug,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          console.error('EMAIL ERROR: API responded with non-OK status', {
            status: response.status,
            statusText: response.statusText,
            body: errorBody,
          });
          emailStatusMessage = ' (Failed to send confirmation email)';
        } else {
          emailStatusMessage = ` A confirmation email has been sent to ${email}.`;
          console.log('📨 Email sent successfully');
        }
      } catch (err) {
        console.error('EMAIL ERROR: Failed to call /api/send-mail-confirmation', err);
        emailStatusMessage = ' (Failed to send confirmation email)';
      }

      // Set combined booking + email message
      setMessage(`Thank you for booking!${emailStatusMessage}`);
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
          {emailWarning && <p className="text-yellow-600">{emailWarning}</p>}
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
          {emailWarning && <p className="text-yellow-600">{emailWarning}</p>}
        </form>
      )}
    </div>
  );
};

export default BookEvent;
