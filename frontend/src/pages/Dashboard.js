import React, { useState, useEffect } from "react";
import axios from "axios";

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    startTime: "",
    endTime: "",
  });
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // ✅ 1. Fetch all events
  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ 2. Load events when component mounts
  useEffect(() => {
    fetchEvents();

    // ✅ Auto-refresh if swap was accepted/rejected
    const checkForUpdates = setInterval(() => {
      if (localStorage.getItem("dashboardNeedsRefresh") === "true") {
        fetchEvents();
        localStorage.removeItem("dashboardNeedsRefresh");
      }
    }, 2000); // check every 2 seconds

    return () => clearInterval(checkForUpdates);
  }, []);

  // ✅ 3. Create new event
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/events",
        newEvent,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage(res.data.message);
      setNewEvent({ title: "", startTime: "", endTime: "" });
      fetchEvents(); // 🔄 Auto-refresh after adding new event
    } catch (error) {
      setMessage(error.response?.data?.message || "Event creation failed!");
    }
  };

  // ✅ 4. Make event swappable
  const makeSwappable = async (id) => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/events/${id}/make-swappable`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      fetchEvents(); // 🔄 Refresh list after status change
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Failed to update event!");
    }
  };

  return (
    <div style={{ margin: "30px" }}>
      <h3>📅 My Events</h3>

      {/* Add New Event */}
      <form onSubmit={handleCreateEvent}>
        <input
          type="text"
          placeholder="Event Title"
          value={newEvent.title}
          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          required
        />
        <br />
        <br />
        <input
          type="datetime-local"
          value={newEvent.startTime}
          onChange={(e) =>
            setNewEvent({ ...newEvent, startTime: e.target.value })
          }
          required
        />
        <br />
        <br />
        <input
          type="datetime-local"
          value={newEvent.endTime}
          onChange={(e) =>
            setNewEvent({ ...newEvent, endTime: e.target.value })
          }
          required
        />
        <br />
        <br />
        <button type="submit">Add Event</button>
      </form>

      <p>{message}</p>

      {/* Event List */}
      <ul>
        {events.map((event) => (
          <li key={event._id}>
            <strong>{event.title}</strong> <br />
            {new Date(event.startTime).toLocaleString()} →{" "}
            {new Date(event.endTime).toLocaleString()} <br />
            Status: {event.status} <br />
            {event.status === "BUSY" && (
              <button onClick={() => makeSwappable(event._id)}>
                Make Swappable
              </button>
            )}
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
