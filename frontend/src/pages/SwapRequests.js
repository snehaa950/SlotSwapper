import React, { useState, useEffect } from "react";
import axios from "axios";

function SwapRequests() {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // ✅ Fetch swap requests
  const fetchSwapRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/swap-requests", {
        headers,
      });
      setRequests(res.data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load swap requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwapRequests();
  }, []);

  // ✅ Accept or Reject swap
  const handleAction = async (requestId, action) => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/swap-requests/${requestId}/${action}`,
        {},
        { headers }
      );

      setMessage(res.data.message);
      fetchSwapRequests(); // 🔄 Refresh requests

      // 🔔 Notify dashboard to refresh its events
      localStorage.setItem("dashboardNeedsRefresh", "true");
    } catch (error) {
      console.error(error);
      setMessage("Action failed!");
    }
  };

  if (loading) return <p>Loading swap requests...</p>;

  return (
    <div style={{ margin: "30px" }}>
      <h3>🔄 Swap Requests</h3>
      {message && <p style={{ color: "green" }}>{message}</p>}

      {requests.length === 0 ? (
        <p>No swap requests available.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {requests.map((req) => (
            <li
              key={req._id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "10px",
                marginBottom: "10px",
                width: "400px",
              }}
            >
              <strong>From:</strong> {req.requester?.name || "Unknown"} <br />
              <strong>Your Event:</strong> {req.receiverEvent?.title} <br />
              <strong>Requested Swap With:</strong> {req.requesterEvent?.title}{" "}
              <br />
              <strong>Status:</strong> {req.status}
              <br />
              {req.status === "PENDING" && (
                <>
                  <button onClick={() => handleAction(req._id, "accept")}>
                    ✅ Accept
                  </button>{" "}
                  <button onClick={() => handleAction(req._id, "reject")}>
                    ❌ Reject
                  </button>
                </>
              )}
              <hr />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SwapRequests;
