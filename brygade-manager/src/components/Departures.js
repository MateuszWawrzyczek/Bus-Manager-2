import React, { useState, useEffect } from "react";
import axios from "axios";

const Departures = () => {
  const [stopsList, setBusStop] = useState([]);
  const [typesOfDays, setTypesOfDays] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [typeOfDayId, setTypeOfDayId] = useState(1);
  const [time, setTime] = useState("");
  const [selectedStopId, setSelectedStopId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasClicked, setHasClicked] = useState(false);

  useEffect(() => {
    const fetchStops = async () => {
      console.log("Ładowanie przystanków...");
      try {
        const response = await axios.get("http://localhost:5057/api/BusStops");
        setBusStop(response.data);
        console.log("Przystanki załadowane", response.data);
      } catch (err) {
        console.error("Błąd podczas pobierania przystanków", err);
        setError("Błąd podczas pobierania przystanków");
      }
    };

    const fetchTypesOfDays = async () => {
      console.log("Ładowanie typów dni...");
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get("http://localhost:5057/api/TypeOfDays");
        if (response.status === 200) {
          setTypesOfDays(response.data);
          console.log("Typy dni załadowane", response.data);
        } else {
          throw new Error(`Received unexpected status code: ${response.status}`);
        }
      } catch (err) {
        console.error("Błąd podczas pobierania typów dni:", err);
        setError("Błąd przy pobieraniu typów dni");
      } finally {
        setLoading(false);
      }
    };

    fetchStops();
    fetchTypesOfDays();
  }, []); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Formularz przesłany", { selectedStopId, time, typeOfDayId });

    if (!selectedStopId || !time || !typeOfDayId) {
      alert("Wszystkie pola muszą być wypełnione.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        "http://localhost:5057/api/Trips/GetDepartures",
        {
          params: {
            stopId: selectedStopId,
            time: time,
            typeOfDayId: typeOfDayId,
          },
        }
      );

      if (response.status === 200) {
        setDepartures(response.data);
        console.log("Otrzymano odjazdy", response.data);

      } else {
        throw new Error(`Otrzymano status: ${response.status}`);
      }
      setHasClicked(true);
    } catch (err) {
      console.error("Błąd podczas pobierania odjazdów", err);
      setError("Błąd przy pobieraniu odjazdów");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":"); 
    return `${hours}:${minutes}`; 
  };

  return (
    <div className="container">
      <h1>Wybierz przystanek i sprawdź odjazdy</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="stopId">Przystanek:</label>
        <select
          id="stopId"
          value={selectedStopId}
          onChange={(e) => setSelectedStopId(e.target.value)}
        >
          <option value="">Wybierz przystanek</option>
          {stopsList.map((stop) => (
            <option key={stop.id} value={stop.id}>
              {stop.name}
            </option>
          ))}
        </select>

        <label htmlFor="time">Czas (w minutach):</label>
        <input
          type="number"
          id="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="Podaj czas w minutach"
        />

        <label htmlFor="typeOfDayId">Typ dnia:</label>
        <select
          id="typeOfDayId"
          value={typeOfDayId}
          onChange={(e) => setTypeOfDayId(e.target.value)}
        >
          <option value="">Wybierz typ dnia</option>
          {typesOfDays.map((typeOfDay) => (
            <option key={typeOfDay.id} value={typeOfDay.id}>
              {typeOfDay.name}
            </option>
          ))}
        </select>

        <button type="submit">Sprawdź odjazdy</button>
      </form>

      {loading && <p>Ładowanie odjazdów...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {departures.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Linia</th>
              <th>Kierunek</th>
              <th>Godzina</th>
            </tr>
          </thead>
          <tbody>
            {departures.map((departure, index) => (
              <tr key={index}>
                <td>{departure.lineNumber}</td>
                <td>{departure.direction}</td>
                <td>{formatTime(departure.departureTime)}</td> 
              </tr>
            ))}
          </tbody>
        </table>
  
      )}

      {departures.length === 0 && hasClicked && <h4>Brak odjazdów, dla wybranych warunków</h4>}
    </div>

  );
};

export default Departures;
