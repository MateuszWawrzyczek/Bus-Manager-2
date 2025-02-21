import React, { useState, useEffect } from "react";
import axios from "axios";

const BrigadesTable = () => {
  const [workingTime, setWorkingTime] = useState("");
  const [brigades, setBrigades] = useState([]);
  const [trips, setTrips] = useState([]); // Lista wszystkich kursów
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pobieranie wszystkich kursów przy załadowaniu komponentu
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

  // Funkcja do pobierania brygad na podstawie czasu pracy
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



  return (
    <div>
      <h1>Brygady</h1>
      <div>
        <label htmlFor="workingTime">Czas pracy: </label>
        <input
          type="number"
          id="workingTime"
          value={workingTime}
          onChange={(e) => setWorkingTime(e.target.value)}
        />
        <button onClick={fetchBrigades} disabled={loading}>
          {loading ? "Ładowanie..." : "Pokaż brygady"}
        </button>
      </div>


      {error && <p style={{ color: "red" }}>{error}</p>}
      {brigades.length > 0 && (
        <table style={{ marginTop: "20px", width: "100%", border: "1px solid black", borderCollapse: "collapse" }}>
        <thead>
            <tr>
              <th>Nazwa</th>
              <th>Czas pracy</th>
              <th>Kursy</th>
            </tr>
          </thead>
          <tbody>
            {brigades.map((brigade) => (
              <tr key={brigade.brigadeId}>
                <td>{brigade.name}</td>
                <td>
                  {Math.floor(brigade.workingTime / 60)} godz. {brigade.workingTime % 60} min
                </td>
                <td>
                  {brigade.trips.length > 0 ? (
                    <ul>
                    {brigade.trips.map((trip) => {
                      const tripDetails = trips.find((t) => t.tripId === trip.trip_id);
                      return (
                        <li key={trip.brigade_trip_id}>
                          {tripDetails?.displayText || "Brak danych o kursie"}
                        </li>
                      );
                    })}
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
    </div>
  );
};

export default BrigadesTable;
