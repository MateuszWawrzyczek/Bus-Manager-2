import React, { useState, useEffect, useCallback } from "react";
import { Formik, Form, Field, FieldArray } from "formik";
import axios from "axios";
import { useParams } from "react-router-dom";

const BrigadeManager = () => {
  const [tripsList, setTrips] = useState([]);
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shortageName, setShortageName] = useState(null);
  const { typeOfDayId } = useParams();

  const parseTimeToMinutes = (timeString) => {
    if (!timeString || !/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
      console.warn("Niepoprawny format godziny:", timeString);
      return null;
    }
  
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours * 60 + minutes + (seconds / 60); 
  };

  const calculateWorkingTime = useCallback((trips, tripsList) => {
    if (!trips || trips.length === 0) return 0;
  
    const sortedTrips = trips
      .map((trip) => {
        const foundTrip = tripsList.find((item) => item.tripId.toString() === trip.trip_id.toString());
        return foundTrip;
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
      );
  
    const firstStart = parseTimeToMinutes(sortedTrips[0].startTime);
    const lastEnd = parseTimeToMinutes(sortedTrips[sortedTrips.length - 1].endTime);
  
    if (firstStart === null || lastEnd === null) {
      return 0;
    }
  
    const workingTime = lastEnd - firstStart; 
    return workingTime;
}, []);

 
  const generateBrigadeName = (index) => {
    return `${shortageName} ${index + 1}`;
  };

  useEffect(() => {
    const fetchTypeOfDay = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5057/api/TypeOfDays/${typeOfDayId}/shortage-name`);
        setShortageName(response.data);
      } catch (err) {
        setError("Błąd podczas pobierania danych brygad");
      } finally {
        setLoading(false);
      }
    };
  
    const fetchTrips = async () => {
      try {
        const response = await axios.get(`http://localhost:5057/api/Trips/GetTrips/${typeOfDayId}`);
        
        const brigadeData = response.data;
        const formattedBrigadeData = brigadeData.map((trip) => ({
          tripId: trip.tripId,
          startTime: trip.startTime,
          endTime: trip.endTime,
          displayText: `Kurs ${trip.tripId} - linia ${trip.lineNumber} - [${trip.startStop} → ${trip.endStop}] (${trip.startTime} → ${trip.endTime})`,
        }));
        setTrips(formattedBrigadeData);
      } catch (err) {
        if (err.response?.status === 404) {
          setError("Brak kursów dla wybranego typu dnia. Dodaj kursy, aby móc tworzyć brygady.");
          setTrips([]); 
        } else {
          setError("Błąd podczas pobierania przystanków");
        }
      }
    };
  
    fetchTypeOfDay();
    fetchTrips();
  }, [typeOfDayId]); 
  

  useEffect(() => {
    const fetchBrigades = async () => {
      try {
        const response = await axios.get(`http://localhost:5057/api/Brigade/GetBrigades/${typeOfDayId}`);
        const data = response.data;

        const transformedData = Array.isArray(data)
          ? data.map((brigade, index) => ({
              brigadeId: brigade.brigadeId,
              name: brigade.name, 
              typeOfDayId: brigade.typeOfDayId,
              workingTime: calculateWorkingTime(brigade.trips, tripsList),
              shortageName: brigade.shortageName,
              trips: brigade.trips.map((trip) => ({
                brigade_trip_id: trip.brigade_trip_id,
                trip_id: trip.trip_id.toString(),
              })),
            }))
          : [];
        //console.log(data[0])
        
        setInitialData(transformedData);
      } catch (err) {
        setError("Błąd podczas pobierania danych brygad");
      } finally {
        setLoading(false);
      }
    };


    if (tripsList.length > 0) {
      fetchBrigades();
    }
  }, [tripsList, calculateWorkingTime,typeOfDayId]);

  const handleSubmit = async (values) => {

    const filteredBrigades = values.brigades.filter(
      (brigade) => brigade.trips && brigade.trips.length > 0
    );

    const transformedData = filteredBrigades.map((brigade) => ({
      brigadeId: brigade.brigadeId || null,
      name: brigade.name,
      typeOfDayId: typeOfDayId,
      workingTime: brigade.workingTime, 
      trips: brigade.trips.map((trip) => ({
        trip_id: parseInt(trip.trip_id, 10),
      })),
    }));

    try {
      await axios.post("http://localhost:5057/api/Brigade/UpdateBrigades", transformedData);
      alert("Dane zapisane pomyślnie!");
      window.location.reload();
    } catch (err) {
      if (err.response && err.response.status === 409){
        alert(err.response.data.message);
      }
      console.error("Błąd podczas zapisu", err);
    }
  };

  if (loading) return <p>Ładowanie...</p>;
  if (error) return <p>Błąd: {error}</p>;

  return (
    <Formik
      initialValues={{
        brigades: initialData && initialData.length > 0 ? initialData : [{ name: generateBrigadeName(0), trips: [] }],
      }}
      enableReinitialize
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue }) => (
        <Form>
          <FieldArray name="brigades">
            {({ push, remove }) => (
              <div>
                {console.log(typeOfDayId)}
                {values.brigades.map((brigade, brigadeIndex) => (
                  <div key={brigadeIndex} style={{ marginBottom: "20px" }}>
                    <h3>Brygada: {brigade.name}</h3>
                    <p>Czas pracy: {brigade.workingTime} minut</p>
                    <FieldArray name={`brigades[${brigadeIndex}].trips`}>
                      {({ push: pushTrip, remove: removeTrip }) => (
                        <div>
                          {brigade.trips.map((trip, tripIndex) => (
                            <div key={tripIndex} style={{ marginBottom: "10px" }}>
                              <label>
                                Kurs:
                                <Field
                                  as="select"
                                  name={`brigades[${brigadeIndex}].trips[${tripIndex}].trip_id`}
                                  onChange={(e) => {
                                    const updatedTrips = [
                                      ...values.brigades[brigadeIndex].trips.slice(0, tripIndex),
                                      { ...values.brigades[brigadeIndex].trips[tripIndex], trip_id: e.target.value },
                                      ...values.brigades[brigadeIndex].trips.slice(tripIndex + 1),
                                    ];

                                    const updatedWorkingTime = calculateWorkingTime(updatedTrips, tripsList);
                                    setFieldValue(`brigades[${brigadeIndex}].trips[${tripIndex}].trip_id`, e.target.value);
                                    setFieldValue(`brigades[${brigadeIndex}].workingTime`, updatedWorkingTime);
                                  }}
                                >
                                  <option value="">Wybierz kurs</option>
                                  {tripsList.map((tripOption) => (
                                    <option key={tripOption.tripId} value={tripOption.tripId}>
                                      {tripOption.displayText}
                                    </option>
                                  ))}
                                </Field>
                              </label>
                              <button type="button" onClick={() => removeTrip(tripIndex)}>
                                Usuń kurs
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              pushTrip({ brigade_trip_id: Date.now(), trip_id: "" })
                            }
                          >
                            Dodaj kurs
                          </button>
                        </div>
                      )}
                    </FieldArray>
                    <button type="button" onClick={() => remove(brigadeIndex)} >
                      Usuń brygadę
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    if (!shortageName) {
                      alert("Nazwa skrócona nie została jeszcze pobrana. Spróbuj ponownie.");
                      return;
                    }
                    push({
                      name: generateBrigadeName(values.brigades.length), 
                      typeOfDayId: parseInt(typeOfDayId, 10),
                      workingTime: 0,
                      trips: [],
                    });
                  }}
                >
                  Dodaj brygadę
                </button>

              </div>
            )}
          </FieldArray>
          <button type="submit">Zapisz</button>
        </Form>
      )}
    </Formik>
  );
};

export default BrigadeManager;
