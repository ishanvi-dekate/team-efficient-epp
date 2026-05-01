import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const CalendarManager = () => {
  const [events, setEvents] = useState([]);

  // This handles the user login and permission request
  const login = useGoogleLogin({
    onSuccess: tokenResponse => fetchCalendarData(tokenResponse.access_token),
    scope: 'https://www.googleapis.com/auth/calendar', // Permission to view/edit
  });

  const fetchCalendarData = async (accessToken) => {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      setEvents(response.data.items);
    } catch (error) {
      console.error("Error fetching calendar:", error);
    }
  };

  return (
    <div>
      <h1>My Google Calendar</h1>
      <button onClick={() => login()}>Login with Google</button>
      <ul>
        {events.map(event => (
          <li key={event.id}>{event.summary}</li>
        ))}
      </ul>
    </div>
  );
};

export default CalendarManager;
