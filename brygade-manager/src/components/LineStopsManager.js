import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Formik, Form, Field, FieldArray } from "formik";
import axios from "axios";



  const LineStopsManager = () => {
    const [stopsList, setBusStop] = useState([]); 
    const [initialData, setInitialData] = useState(null); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null); 
    const [addError, setAddError] = useState(null); 
    const [lineNumber, setLineNumber] = useState(null);
    const [removedStops, setRemovedStops] = useState([]);  

    const { lineId } = useParams();
  
    useEffect(() => {
      const fetchStops = async () => {
        try {
          const response = await axios.get("http://localhost:5057/api/BusStops");
          setBusStop(response.data);
        } catch (err) {
          setError("Błąd podczas pobierania przystanków");
        }
      };
  
      const fetchLineStops = async () => {
        try {
          const response = await axios.get(`http://localhost:5057/api/LineStops/${lineId}`);
          const data = response.data;
          const transformedData = {
            directions: [],
          };
      
          data.forEach((lineStop) => {
            const directionIndex = lineStop.direction - 1;
            if (typeof lineStop.direction !== "number" || typeof lineStop.order !== "number") {
              console.error("Nieprawidłowe dane lineStop:", lineStop);
              return; 
            }
      
            while (transformedData.directions.length <= directionIndex) {
              transformedData.directions.push({ stops: [] });
            }
      
            if (
              !transformedData.directions[directionIndex] ||
              !Array.isArray(transformedData.directions[directionIndex].stops)
            ) {
              console.error(
                `Problem z kierunkiem ${directionIndex + 1}:`,
                transformedData.directions[directionIndex]
              );
              return; 
            }
      
            transformedData.directions[directionIndex].stops[lineStop.order - 1] = {
              stopId: lineStop.stopId.toString(),
              lineStopId: lineStop.id,  
            };
          });
      
          console.log(transformedData);
          setInitialData(transformedData);
        console.log(transformedData);

        } catch (err) {
          console.error("Błąd", err);
          setError("Błąd podczas pobierania danych linii");
        } finally {
          setLoading(false);
        }
      };
        
      const fetchLineNumber = async () => {
        try {
          const response = await axios.get(`http://localhost:5057/api/Line/${lineId}`);    
          setLineNumber(response.data); 
        } catch (error) {
          console.error("Błąd podczas pobierania numeru linii:", error);
          setError("Nie udało się pobrać numeru linii.");
        }
      }
  
      fetchStops();
      fetchLineStops();
      fetchLineNumber();
    }, [lineId]);
  
  
  
    const transformData = (values) => {
      const result = [];
      values.directions.forEach((direction, directionIndex) => {
        direction.stops.forEach((stop, order) => {
          if (stop) {
            result.push({
              id: parseInt(stop.lineStopId)? parseInt(stop.lineStopId) : null,
              lineId,
              stopId: parseInt(stop.stopId),
              direction: directionIndex + 1,
              order: order + 1,
            });
          }
        });
      });
      return result;
    };
  
    // Walidacja formularza
    const validate = (values) => {
      const errors = {};
      if (!values.directions || values.directions.length === 0) {
        errors.directions = "Musisz dodać przynajmniej jeden kierunek.";
      } else {
        values.directions.forEach((direction, directionIndex) => {
          if (!direction.stops || direction.stops.length === 0) {
            if (!errors.directions) errors.directions = [];
            errors.directions[directionIndex] = "Musisz dodać przynajmniej jeden przystanek.";
          }
        });
      }
      return errors;
    };
  
const handleSubmit = async (values) => {
  const transformedData = transformData(values);
  console.log(transformedData);
  
  try {
    console.log(removedStops);
    
    await axios.delete("http://localhost:5057/api/LineStops/RemoveLineStops", { data: removedStops });
    
    await axios.post("http://localhost:5057/api/LineStops", transformedData);
    
    alert("Dane zapisane pomyślnie!");
    window.location.reload();
  } catch (err) {
    setAddError("Błąd przy zapisywaniu danych.");
    console.error(err);
  }
};

const handleRemoveDirection = (directionIndex, remove) => {
  const directionToRemove = initialData.directions[directionIndex];

  const stopsToRemove = directionToRemove.stops.map((stop) => stop.lineStopId);

  setRemovedStops((prevRemovedStops) => [...prevRemovedStops, ...stopsToRemove]);

  remove(directionIndex);
};

    const handleRemoveStop = (directionIndex, stopIndex, removeStop, values) => {
      const stopToRemove = values.directions[directionIndex].stops[stopIndex];
    
      if (stopToRemove &&stopToRemove.lineStopId) {
        setRemovedStops((prevRemovedStops) => [
          ...prevRemovedStops,
          stopToRemove.lineStopId,
        ]);
      }
      console.log(removedStops);
    
      removeStop(stopIndex);  
    };
    
    
    
  
    if (loading) return <p>Ładowanie...</p>;
    if (error) return <p>Błąd: {error}</p>;
  
    return (
      <Formik
        initialValues={initialData || { directions: [{ stops: [""] }] }}
        validate={validate}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ values }) => (
          <Form>
            
          <div><h2>Linia: {lineNumber || "Ładowanie numeru linii..."}</h2></div>
            <FieldArray name="directions">
              {({ push, remove }) => (
                <div>
                  {values.directions.map((direction, directionIndex) => (
                    <div key={directionIndex} style={{ marginBottom: "20px" }}>
                      <h3>Kierunek {directionIndex + 1}</h3>
                      <button
                        type="button"
                        onClick={() => handleRemoveDirection(directionIndex, remove)}
                        disabled={values.directions.length === 1}
                      >
                        Usuń kierunek
                      </button>
                      <FieldArray name={`directions[${directionIndex}].stops`}>
                        {({ push: pushStop, remove: removeStop }) => (
                          <div>
                            {direction.stops.map((stop, stopIndex) => (
                              <div key={`${directionIndex}-${stopIndex}`} style={{ marginBottom: "10px" }}>
                                <label>
                                  {stopIndex + 1}.
                                  <Field
                                    as="select"
                                    name={`directions[${directionIndex}].stops[${stopIndex}].stopId`}
                                  >
                                    <option value="">Wybierz przystanek</option>
                                    {stopsList.map((stop) => (
                                      <option key={stop.id} value={stop.id}>
                                        {stop.name}
                                      </option>
                                    ))}
                                  </Field>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStop(directionIndex, stopIndex, removeStop, values)}
                                  disabled={direction.stops.length === 1}
                                >
                                  Usuń przystanek
                                </button>
                              </div>
                            ))}
                            <button type="button" onClick={() => pushStop("")}>
                              Dodaj przystanek
                            </button>
                          </div>
                        )}
                      </FieldArray>
                    </div>
                  ))}
                  <button type="button" onClick={() => push({ stops: [""] })}>
                    Dodaj kierunek
                  </button>
                </div>
              )}
            </FieldArray>
            <button type="submit">Zapisz</button>
            {addError && <div className="text-danger mt-2">{addError}</div>}
          </Form>
        )}
      </Formik>  
  );
};

export default LineStopsManager;
