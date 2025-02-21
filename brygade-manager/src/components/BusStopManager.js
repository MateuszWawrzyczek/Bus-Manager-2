import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
//import { useNavigate } from 'react-router-dom';

const stopSchema = Yup.object().shape({
  name: Yup.string().required("Przystanek musi mieć nazwę"),
});

const StopManager = () => {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addError, setAddError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStops, setEditedStops] = useState({});
  //const navigate = useNavigate();

  useEffect(() => {
    fetchStops();
  }, []);

  const fetchStops = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5057/api/BusStops');
      console.log(response);
      if (response.status === 200) {
        setStops(response.data);
      } else {
        throw new Error(`Received unexpected status code: ${response.status}`);
      }
    } catch (err) {
      console.error('Błąd podczas pobierania przystanków:', err);
      setError('Błąd podczas pobierania przystanków.');
    } finally {
      setLoading(false);
    }
  };

  const addStop = async (newStopName) => {
    if (!newStopName.trim()) return;
    console.log("as", newStopName);
    try {
      await axios.post(
        `http://localhost:5057/api/BusStops`,
        newStopName,
        { headers: { 'Content-Type': 'application/json' } }
      );
      setAddError(null);
      fetchStops(); 
      alert('Przystanek został dodany pomyślnie!');
    } catch (error) {
      const errorMessage = error.response.data;
      if (errorMessage.includes('value too long for type character varying')) {
        alert('Nazwa przystanku jest zbyt długa! Maksymalna długość to 100 znaków.');
      } else {
        alert('Wystąpił wewnętrzny błąd serwera. Spróbuj ponownie później.');
      }
      setAddError('Błąd przy dodawaniu przystanku.');
    }
  };
  
  



  const deleteStop = async (id) => {
    try {
      await axios.delete(`http://localhost:5057/api/BusStops/${id}`);
      fetchStops();
    } catch (error) {
      console.error('Błąd przy usuwaniu przystanku', error);
      setError('Błąd przy usuwaniu przystanku.');
    }
  };

  const saveEditedStops = async () => {
    try {
      const updatePromises = Object.keys(editedStops).map(async (id) => {
        const updatedName = editedStops[id];
        const stop = stops.find((stop) => stop.id === parseInt(id, 10));

        if (!stop) return;

        if (updatedName.trim() && updatedName !== stop.number) {
          await axios.put(
            `http://localhost:5057/api/BusStops/${id}`,
            { id: id,
              name: updatedName }, 
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
          );
        }
      });

      await Promise.all(updatePromises);
      setIsEditing(false);
      setEditedStops({});
      fetchStops();
    } catch (error) {
      console.error('Błąd przy zapisie przystanków:', error);
      setError('Błąd przy zapisie przystanków.');
    }
  };

  const handleEditChange = (id, value) => {
    setEditedStops((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div>
      <h2>Przystanki</h2>
      <h3>Dodaj przystanek:</h3>
      <Formik
        initialValues={{ name: "" }}
        validationSchema={stopSchema}
        validate={(values) => {
          if (!stopSchema.isValidSync(values)) {
            setAddError(null);
          }
        }}
        onSubmit={(values, { resetForm }) => {
          addStop(values.name);
          resetForm();
        }}
      >
        {() => (
          <Form>
            <div>
              <Field
                type="text"
                id="name"
                name="name"
                className="form-control"
                placeholder="Wpisz nazwę przystanku"
              />
              
            </div>
            {addError && <div className="text-danger mt-2">{addError}</div>}
            <button type="submit" className="btn btn-primary mt-2">
              Dodaj przystanek
            </button>
          </Form>
        )}
      </Formik>

      <div>
        <h3>Lista przystanków:</h3>
        {loading ? (
          <p>Ładowanie...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <ul>
            {stops.map((stop) => (
              <li key={stop.id}>
                {!isEditing ? (
                  <span>
                    {stop.name}
                  </span>
                  
                ) : (
                  <>
                    <input
                      type="text"
                      className="form-control"
                      value={editedStops[stop.id] ?? stop.name}
                      onChange={(e) => handleEditChange(stop.id, e.target.value)}
                    />
                    <button
                      onClick={() => deleteStop(stop.id)}
                      className="btn btn-danger ml-2"
                    >
                      Usuń
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        {isEditing ? (
          <>
            <button
              onClick={saveEditedStops}
              className="btn btn-success mt-2"
            >
              Zapisz zmiany
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditedStops({});
              }}
              className="btn btn-secondary mt-2 ml-2"
            >
              Anuluj
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-primary mt-2"
          >
            Edytuj
          </button>
        )}
      </div>
    </div>
  );
};

export default StopManager;
