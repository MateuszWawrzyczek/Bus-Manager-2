import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const TimetableManager = () => {
    const [directions, setDirections] = useState([]);
    const [lineNumber, setLineNumber] = useState("");
    const [typesOfDays, setTypesOfDays] = useState([]);
    const [timetableData, setTimetableData] = useState([]);
    const [emptyTrips, setEmptyTrips] = useState({});
    const [editingValues, setEditingValues] = useState({});
    const [maxTripId, setMaxTripId] = useState({});
    const [time, setTime] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { lineId } = useParams();

    //const generateUniqueId = () => Date.now() + Math.random().toString(36).substr(2, 9);


    useEffect(() => {
        const fetchLineData = async () => {
            try {
                const lineResponse = await axios.get(`http://localhost:5057/api/Line/${lineId}`);
                setLineNumber(String(lineResponse.data));

                const stopsResponse = await axios.get(`http://localhost:5057/api/LineStops/${lineId}`);


                const data = stopsResponse.data;
                console.log(data);
                const transformedData = [];
                if (data.length > 0) {
                    data.forEach((lineStop) => {
                        const directionIndex = lineStop.direction ;
                        console.log("d",directionIndex);
                        while (transformedData.length <= directionIndex) {
                            transformedData.push({ stops: [] });
                        }
                        if (directionIndex === 0) {
                            return;
                        }
                        console.log("edwjkains",transformedData.length);

                        transformedData[directionIndex].stops[lineStop.order - 1] = {
                            id: lineStop.id,
                            stopName: lineStop.stopName,
                            trips: lineStop.trips || [],
                        };
                    });
                    
                } else {

                    console.log("data",data);
                    transformedData.push({ stops: [] });
                }
                setDirections(transformedData);
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setError("Dodaj przystanki do linii w zakładce Przystanki na linii.");
                    setDirections([]);  
                } else {
                    console.error("Błąd podczas pobierania danych:", err);
                    setError("Błąd podczas pobierania danych linii.");
                }
            } finally {
                setLoading(false);
            }
        };

        const fetchTimetableData = async () => {
            try {
                const response = await axios.get(`http://localhost:5057/api/Timetable/GetTimetable/${lineId}`);
                setTimetableData(response.data);
                console.log(response.data)
            } catch (error) {
                console.error('Błąd podczas pobierania rozkładu jazdy:', error);
            }
        };

        const fetchTypesOfDays = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get('http://localhost:5057/api/TypeOfDays');
                setTypesOfDays(response.data);
            } catch (err) {
                console.error('Błąd podczas pobierania typów dni:', err);
                setError('Błąd przy pobieraniu typów dni');
            } finally {
                setLoading(false);
            }
        };

        const fetchMaxTripID = async () =>{
            setLoading(true);
            setError(null);
            try{
                const response = await axios.get('http://localhost:5057/api/Trips/GetMaxTripId');
                setMaxTripId(response.data);
                console.log(response.Data)
            }
            catch (err){
                console.error('Błąd podczas pobierania maksymalnego id kursu:', err);
                setError('Błąd przy pobieraniu maksymalnego id kursu');
            }
            finally{

            }
        }


        fetchLineData();
        fetchTypesOfDays();
        fetchTimetableData();
        fetchMaxTripID();

    }, [lineId]);

    if (loading) return <p>Ładowanie...</p>;
    if (error) return <p>Błąd: {error}</p>;
    if (directions.length === 0) {
        return <p>Dodaj przystanki do linii.</p>; 
    }


    const getStopTimes = (typeOfDayId, directionId, stopId, tripId) => {
        /*console.log("--- getStopTimes ---");
        console.log("Typ dnia:", typeOfDayId);
        console.log("Kierunek:", directionId);
        console.log("ID przystanku:", stopId);
        console.log("Trip ID:", tripId); // Logowanie tripId
        console.log("Dane:", timetableData);*/
    
        const stopTime = timetableData
            .filter(item => 
                item.stopId === stopId && 
                item.typeOfDayId === typeOfDayId && 
                item.tripId === tripId) 
            .map(item => item.arrivalDepartureTime)[0]; 
        return stopTime; 
    };
    
    
    
    
    

const handleAddColumn = (key) => {
    console.log("Dodaj kurs, klucz:", key);

    setMaxTripId((prevMaxTripId) => {
        const newTripId = prevMaxTripId + 1; 
        
        setEmptyTrips((prev) => {
            const updatedTrips = { ...prev };

            if (!updatedTrips[key]) {
                updatedTrips[key] = [];
            }

            updatedTrips[key].push(newTripId);  
            console.log("Zaktualizowane puste kursy:", updatedTrips);

            return updatedTrips;
        });

        return newTripId; 
    });
};

    
    
    
    
    
    

    const formatTime = (time) => {
        if (!time) return "";
        const [hours, minutes] = time.split(":");
        return `${hours}:${minutes}`;
    };

        const isValidTimeFormat = (time) => {
            console.log("wkmdles",time);
            const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/; 
            console.log("jqwkdnas",timeRegex.test(time))
            return timeRegex.test(time);
        };

    const handleTimeChange = async (typeOfDayId, directionId, stopId, newTime, tripId) => {
        const key = `${typeOfDayId}-${directionId}-${stopId}-${tripId}`;
        console.log("weikfjhcds",newTime);
        if (editingValues[key] === newTime) {
            console.log("aaaaaa")
            return;
        }
        console.log("new",newTime);
        setEditingValues((prev) => ({
            ...prev,
            [`${typeOfDayId}-${directionId}-${stopId}-${tripId}`]: newTime,
        }));
    
    };
 
    

    const handleTimeBlur = async (typeOfDayId, directionId, stopId, tripId) => {
        const key = `${typeOfDayId}-${directionId}-${stopId}-${tripId}`;
        const newTime = editingValues[key];
        setTime(newTime);
        console.log("=== handleTimeBlur ===");
        console.log("Typ dnia ID:", typeOfDayId);
        console.log("Kierunek ID:", directionId);
        console.log("ID przystanku:", stopId);
        console.log("Indeks kolumny:", maxTripId);
        console.log("Key:", key);
        console.log("Nowy czas wprowadzony:", newTime);
        

        if (!newTime || newTime.trim() === "") {
            console.log("Brak nowego czasu lub czas pusty, operacja zakończona.");
            return;
        }

        setTimetableData((prev) => {
            console.log("Poprzednie dane timetableData:", prev, newTime);

            
            const entryIndex = prev.findIndex(
                (entry) =>
                    entry.stopId === stopId &&
                    entry.direction === directionId &&
                    entry.typeOfDayId === typeOfDayId &&
                    entry.tripId === tripId  
            );
    
            const updatedData = [...prev];
    
            if (entryIndex !== -1) {
                updatedData[entryIndex] = {
                    ...updatedData[entryIndex],
                    arrivalDepartureTime: newTime,
                };
                console.log("Zaktualizowano istniejący wpis:", updatedData[entryIndex]);
            } else {
                
                const newEntry = {
                    stopId,
                    lineId: parseInt(lineId, 10), 
                    direction: directionId,
                    order: tripId + 1, 
                    tripId: tripId, 
                    typeOfDayId,
                    tripTimeId: null,
                    arrivalDepartureTime: newTime,
                };
                updatedData.push(newEntry);
                console.log("Dodano nowy wpis:", newEntry);
                
            }
    
            console.log("Zaktualizowane dane timetableData:", updatedData);
            
            return updatedData;
        } );

    
        console.log("=== Koniec handleTimeBlur ===");
    };

        const updateDatabase = async (typeOfDayId, directionId, stopId, tripId) => {
            const key = `${typeOfDayId}-${directionId}-${stopId}-${tripId}`;
            
            let newTime = editingValues[key];
            if ( newTime === null) {
                newTime = "";
                
            }
            console.log("time",time);


            if (!newTime ||newTime.trim() === ""){
                console.log("czas pusty.",tripId,stopId);

                try {
                    const url = `http://localhost:5057/api/TripsTimes/DeleteTripTime?tripId=${tripId}&lineStopId=${stopId}`;
                    const response = await axios.delete(url);
            
                    console.log("Usunięto czas przejazdu:", response.data);
                } catch (error) {
                    console.error("Błąd podczas usuwania:", error.response ? error.response.data : error.message);
                }
        
                return;
            }
            if (!newTime || newTime.trim() === "") {
                console.log("Brak nowego czasu lub czas pusty, operacja zakończona.");
                return;
            }
            try {
                const emptyTripKey = `${typeOfDayId}-${directionId}`;
                if (Array.isArray(emptyTrips[emptyTripKey]) && emptyTrips[emptyTripKey].includes(tripId)) {
                    await axios.post("http://localhost:5057/api/Trips/PostTrip", {
                        id: tripId,
                        typeOfDayId,
                    });
        
                    setEmptyTrips((prev) => {
                        const updatedTrips = { ...prev };
                        updatedTrips[emptyTripKey] = updatedTrips[emptyTripKey].filter(id => id !== tripId);
                        return updatedTrips;
                    });
                }
                console.log("kulaaa",tripId,newTime,stopId)
                console.log(JSON.stringify({
                    TripId: tripId,
                    ArrivalDepartureTime: newTime,
                    LineStopId: stopId
                  }));
                try {
                    const response = await axios.post(
                        "http://localhost:5057/api/TripsTimes/AddTripTime",
                        {
                          TripId: tripId,
                          ArrivalDepartureTime: newTime + ":00",
                          LineStopId: stopId
                        },
                        {
                          headers: {
                            "Content-Type": "application/json"
                          }
                        }
                      );
                    console.log("Sukces:", response.data);
                  } catch (error) {
                    if (error.response) {
                      console.error("Błąd odpowiedzi serwera:", error.response.data.error);
                      alert( error.response.data.error, "Obecna godzina nie jest zapisana w bazie. Wpisz poprawną godzinę.");
                    } else if (error.request) {
                      console.error("Brak odpowiedzi od serwera:", error.request);
                    } else {
                      console.error("Błąd w zapytaniu:", error.message);
                    }
                  }
        
                setEditingValues((prev) => {
                    const { [key]: _, ...rest } = prev;
                    return rest;
                });
        
                console.log("Dane zaktualizowane w bazie i edytowane wartości usunięte:", key);
        
            } catch (error) {
                console.error("Błąd podczas aktualizacji bazy danych:", error);
            }
        };
        
    
        


    return (
        <div>
            {console.log("weijknfdas")}
            <h1>Rozkład Jazdy - Linia {lineNumber}</h1>
            {typesOfDays.map((typeOfDay, typeIndex) => (
                <div key={typeIndex} style={{ marginBottom: "40px" }}>
                    <h2>Rodzaj dnia: {typeOfDay.name}</h2>
                    {directions.map((direction, directionIndex) => {
                        if (!direction || direction.stops.length === 0) {
                            return null; 
                        }
                        console.log("direc",directionIndex);

                        const key = `${typeOfDay.id}-${directionIndex}`;
                        const uniqueTripIds = Array.from(
                            new Set([
                                ...timetableData
                                    .filter((item) => item.typeOfDayId === typeOfDay.id && item.direction === directionIndex)
                                    .map((item) => item.tripId),
                                ...(emptyTrips[key] || []), 
                            ])
                        ).sort((a, b) => a - b);

                        return (
                            <div key={directionIndex} style={{ marginBottom: "20px" }}>

                                <h2>Kierunek {directionIndex  }</h2>
                                <button onClick={() => handleAddColumn(key)}>Dodaj kurs</button>
                                <table border="1" style={{ borderCollapse: "collapse", width: "auto" }}>
                                    <thead>
                                        <tr>
                                            <th>Nr.</th>
                                            <th>Przystanek</th>
                                            {uniqueTripIds.map((tripId) => (
                                                <th key={`header-${tripId}`}>Kurs {tripId}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {direction.stops.map((stop, stopIndex) => {
                                            return (
                                                <tr key={`row-${directionIndex}-${stopIndex}`}>
                                                    <td style={{ textAlign: "center" }}>{stopIndex }</td>
                                                    <td>{stop.stopName}</td>
                                                    {uniqueTripIds.map((tripId) => {
                                                        console.log("stopid",stop.id);
                                                        const stopTime = getStopTimes(typeOfDay.id, directionIndex, stop.id, tripId);

                                                        return (
                                                            <td key={`cell-${stopIndex}-${tripId}`}>
                                                                <input
                                                                /*type="time"
                                                                value={editingValues[`${typeOfDay.id}-${directionIndex}-${stop.id}-${tripId}`] ?? formatTime(stopTime)}
                                                                onChange={(e) => handleTimeChange(typeOfDay.id, directionIndex, stop.id, e.target.value, tripId)}
                                                                */
                                                                type="time"
                                                                value={editingValues[`${typeOfDay.id}-${directionIndex}-${stop.id}-${tripId}`] ??
                                                                    (stopTime ? formatTime(stopTime) : "")
                                                                }
                                                                onChange={(e) =>
                                                                    handleTimeChange(
                                                                        typeOfDay.id,
                                                                        directionIndex,
                                                                        stop.id,
                                                                        e.target.value,
                                                                        tripId
                                                                    )
                                                                }
                                                                onBlur={() =>{
                                                                    handleTimeBlur(typeOfDay.id, directionIndex, stop.id, tripId);
                                                                    updateDatabase(typeOfDay.id, directionIndex, stop.id, tripId);
                                                                }
                                                                }


                                                                />
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </tbody>

                                </table>
                            </div>
                        );
                    })}
                </div>
            ))}
           
        </div>
    );
};export default TimetableManager;
