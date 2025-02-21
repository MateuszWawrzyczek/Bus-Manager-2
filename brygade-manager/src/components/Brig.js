import React, { useState, useEffect } from "react";
import axios from "axios";

const BrigadesTable = () => {
  const [workingTime, setWorkingTime] = useState("");
  const [brigades, setBrigades] = useState([]);
  const [trips, setTrips] = useState([]); 
  const [selectedTrip, setSelectedTrip] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await axios.get("http://localhost:5057/api/Trips/GetTrips");
        const tripData = response.data;
        const formattedTrips = tripData.map((trip) => ({
          tripId: trip.tripId,
          startTime: trip.startTime,
          endTime: trip.endTime,
          displayText: `Kurs ${trip.tripId} - linia ${trip.lineNumber} - [${trip.startStop} → ${trip.endStop}] (${trip.startTime} → ${trip.endTime})`,
        }));
        setTrips(formattedTrips);
      } catch (err) {
        setError("Błąd podczas pobierania kursów");
        console.error(err);
      }
    };

    fetchTrips();
  }, []);

  const fetchBrigades = async () => {
    if (!workingTime || workingTime <= 0) {
      alert("Please enter a valid working time.");
      return;
    }

    setLoading(true);
    setError("");
    setBrigades([]);

    try {
        const response = await axios.get(
            `http://localhost:5057/api/Brigade/GetBrigadesAccordingToTime`,
            { params: { time: workingTime } }
          );
          

      setBrigades(response.data);
    } catch (err) {
      setError("Błąd podczas pobierania brygad");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showTripDetails = (tripId) => {
    const trip = trips.find((t) => t.tripId === tripId); 
    setSelectedTrip(trip || null); 
  };

  return (
    <div>
      <h1>Brigades Table</h1>


      <div>
        <label htmlFor="workingTime">Working Time:</label>
        <input
          type="number"
          id="workingTime"
          value={workingTime}
          onChange={(e) => setWorkingTime(e.target.value)}
        />
        <button onClick={fetchBrigades} disabled={loading}>
          {loading ? "Loading..." : "Fetch Brigades"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {brigades.length > 0 && (
        <table border="1" style={{ marginTop: "20px", width: "100%" }}>
          <thead>
            <tr>
              <th>Brigade Name</th>
              <th>Working Time</th>
              <th>Trips</th>
            </tr>
          </thead>
          <tbody>
            {brigades.map((brigade) => (
              <tr key={brigade.brigadeId}>
                <td>{brigade.name}</td>
                <td>{brigade.workingTime}</td>
                <td>
                  {brigade.trips.length > 0 ? (
                    <ul>
                      {brigade.trips.map((trip) => (
                        <li key={trip.brigade_trip_id}>
                          <button
                            onClick={() => showTripDetails(trip.trip_id)}
                            style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
                          >
                            Trip ID: {trip.trip_id}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "No trips"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedTrip && (
        <div style={{ marginTop: "20px", border: "1px solid black", padding: "10px" }}>
          <h2>Trip Details</h2>
          <p>
            <strong>Trip ID:</strong> {selectedTrip.tripId}
          </p>
          <p>
            <strong>Route:</strong> {selectedTrip.displayText}
          </p>
          <p>
            <strong>Start Time:</strong> {selectedTrip.startTime}
          </p>
          <p>
            <strong>End Time:</strong> {selectedTrip.endTime}
          </p>
        </div>
      )}
    </div>
  );
};

export default BrigadesTable;
