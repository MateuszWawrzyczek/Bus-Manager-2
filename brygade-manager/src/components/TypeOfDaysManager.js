import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const typeDaySchema = Yup.object().shape({
  typDnia: Yup.string().required("Typ dnia musi mieć nazwę"),
});

const TypeOfDaysManager = () => {
  const [typesOfDays, setTypesOfDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTypes, setEditedTypes] = useState({});

  useEffect(() => {
    fetchTypesOfDays();
  }, []);

  const fetchTypesOfDays = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:5057/api/TypeOfDays');
      if (response.status === 200) {
        setTypesOfDays(response.data);
      } else {
        throw new Error(`Received unexpected status code: ${response.status}`);
      }
    } catch (err) {
      console.error('Błąd podczas pobierania typów dni:', err);
      setError('Błąd przy pobieraniu typów dni');
    } finally {
      setLoading(false);
    }
  };

  const addTypeOfDay = async (newTypeName) => {
    if (!newTypeName.trim()) return;

    try {
      await axios.post(`http://localhost:5057/api/TypeOfDays/${encodeURIComponent(newTypeName)}`);
      fetchTypesOfDays();
    } catch (error) {
      console.error('Błąd przy dodawaniu typów dni:', error);
      setError('Błąd przy dodawaniu typów dni');
    }
  };

  const deleteTypeOfDay = async (id) => {
    try {
      await axios.delete(`http://localhost:5057/api/TypeOfDays/${id}`);
      fetchTypesOfDays();
    } catch (error) {
      console.error('Błąd przy usuwaniu typu dnia', error);
      setError('Błąd przy usuwaniu typu dnia');
    }
  };

  const saveEditedTypes = async () => {
    try {
      const updatePromises = Object.keys(editedTypes).map(async (id) => {
        const updatedName = editedTypes[id];
        const type = typesOfDays.find((type) => type.id === parseInt(id, 10));

        if (!type) return; 

        if (updatedName.trim() && updatedName !== type.name) {
          await axios.put(
            `http://localhost:5057/api/TypeOfDays/${id}?newName=${encodeURIComponent(updatedName)}`
          );
        }
      });

      await Promise.all(updatePromises);
      setIsEditing(false);
      setEditedTypes({});
      fetchTypesOfDays();
    } catch (error) {
      console.error('Błąd przy zapisie danych:', error);
      setError('Błąd przy zapisie danych');
    }
  };

  const handleEditChange = (id, value) => {
    setEditedTypes((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div>
      <h2>Typy dni</h2>
      <h3>Dodaj typ dnia:</h3>
      <Formik
        initialValues={{ typDnia: "" }}
        validationSchema={typeDaySchema}
        onSubmit={(values, { resetForm }) => {
          addTypeOfDay(values.typDnia);
          resetForm();
        }}
      >
        {() => (
          <Form>
            <div>
              <Field
                type="text"
                id="typDnia"
                name="typDnia"
                className="form-control"
                placeholder="Wpisz typ dnia"
              />
              <ErrorMessage name="typDnia">
                {(msg) => <div className="text-danger">{msg}</div>}
              </ErrorMessage>
            </div>
            <button type="submit" className="btn btn-primary mt-2">
              Dodaj typ dnia
            </button>
          </Form>
        )}
      </Formik>

      <div>
        <h3>Lista typów dni:</h3>
        {loading ? (
          <p>Ładowanie...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <ul>
            {typesOfDays.map((type) => (
              <li key={type.id}>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      className="form-control"
                      value={editedTypes[type.id] ?? type.name}
                      onChange={(e) => handleEditChange(type.id, e.target.value)}
                    />
                    <button
                      onClick={() => deleteTypeOfDay(type.id)}
                      className="btn btn-danger ml-2"
                    >
                      Usuń
                    </button>
                  </>
                ) : (
                  type.name
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
              onClick={saveEditedTypes}
              className="btn btn-success mt-2"
            >
              Zapisz zmiany
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditedTypes({});
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

export default TypeOfDaysManager;
