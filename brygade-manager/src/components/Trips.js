import React, { useState } from "react";
import axios from "axios";

const LongTrips = () => {
  const [time, setTime] = useState(""); // czas w minutach
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasClicked, setHasClicked] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Walidacja: czy pole time jest wypełnione
    if (!time) {
      alert("Podaj czas w minutach.");
      return;
    }

    setLoading(true);
    setError(null);

    try {

      const response = await axios.get(`http://localhost:5057/api/Trips/GetTripsLongerThan/${time}`);

      if (response.status === 200) {
        setTrips(response.data);
      } else {
        throw new Error(`Otrzymano status: ${response.status}`);
      }
    } catch (err) {
      console.error("Błąd podczas pobierania kursów", err);
      setError("Błąd przy pobieraniu kursów");
    } finally {
      setLoading(false);
      setHasClicked(true);
    }
  };

  const formatTime = (timeSpan) => {
    if (!timeSpan) return "";
    const parts = timeSpan.split(":"); 
    return `${parts[0]}:${parts[1]}`; 
  };

  return (
    <div className="container">
      <h1>Sprawdź kursy dłuższe niż zadany czas</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="time">Czas (w minutach):</label>
        <input
          type="number"
          id="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="Podaj czas w minutach"
        />
        <button type="submit">Sprawdź kursy</button>
      </form>

      {loading && <p>Ładowanie kursów...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {trips.length > 0 && (
        <table  style={{ borderCollapse: "collapse", marginTop: "20px", textAlign: "center" }}>
          <thead>
            <tr>
              <th>ID Kursu</th>
              <th>Linia</th>
              <th>Przystanek początkowy</th>
              <th>Przystanek końcowy</th>
              <th>Czas startu</th>
              <th>Czas zakończenia</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip, index) => (
              <tr key={index}>
                <td>{trip.tripId}</td>
                <td>{trip.lineNumber}</td>
                <td>{trip.startStop}</td>
                <td>{trip.endStop}</td>
                <td>{formatTime(trip.startTime)}</td>
                <td>{formatTime(trip.endTime)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {trips.length === 0 && hasClicked && !loading && (
        <h4>Brak kursów dłuższych niż {time} minut.</h4>
      )}
    </div>
  );
};

export default LongTrips;
