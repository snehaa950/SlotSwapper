import React, { useEffect, useState } from "react";
import axios from "axios";

function SwappableSlots() {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [mySlots, setMySlots] = useState([]);
  const [selectedMySlot, setSelectedMySlot] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // ✅ Fetch available + my slots
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const [othersRes, myRes] = await Promise.all([
          axios.get("http://localhost:5000/api/swappable-slots", { headers }),
          axios.get("http://localhost:5000/api/my-slots", { headers }),
        ]);
        setAvailableSlots(othersRes.data.slots || []);
        setMySlots(myRes.data.slots || []);
      } catch (error) {
        console.error("Error fetching slots:", error);
        setMessage("Failed to load slots.");
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, []);

  // ✅ Send swap request
  const handleSwapRequest = async (targetSlotId) => {
    if (!selectedMySlot) {
      alert("Please select one of your slots first!");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/slot-requests",
        { mySlotId: selectedMySlot, targetSlotId },
        { headers }
      );
      setMessage(res.data.message || "Swap request sent!");
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message || "Failed to send swap request!"
      );
    }
  };

  if (loading) return <p>Loading slots...</p>;

  return (
    <div style={{ margin: "40px" }}>
      <h2>🔁 Swappable Slots</h2>

      {/* Choose your slot to offer */}
      <div style={{ marginBottom: "20px" }}>
        <h4>Pick one of your slots to swap:</h4>
        <select
          value={selectedMySlot}
          onChange={(e) => setSelectedMySlot(e.target.value)}
        >
          <option value="">-- Select My Slot --</option>
          {mySlots.map((slot) => (
            <option key={slot._id} value={slot._id}>
              {slot.title} ({new Date(slot.startTime).toLocaleString()})
            </option>
          ))}
        </select>
      </div>

      {/* List of available slots */}
      <h4>Available Slots from Other Users:</h4>
      {availableSlots.length === 0 ? (
        <p>No available slots to swap.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {availableSlots.map((slot) => (
            <li
              key={slot._id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "10px",
                marginBottom: "10px",
                width: "350px",
              }}
            >
              <strong>{slot.title}</strong> <br />
              {new Date(slot.startTime).toLocaleString()} →{" "}
              {new Date(slot.endTime).toLocaleString()}
              <br />
              <button
                style={{ marginTop: "5px" }}
                onClick={() => handleSwapRequest(slot._id)}
              >
                Request Swap
              </button>
            </li>
          ))}
        </ul>
      )}

      {message && <p style={{ color: "green" }}>{message}</p>}
    </div>
  );
}

export default SwappableSlots;
