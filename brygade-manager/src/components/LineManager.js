import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from 'react-router-dom';

const lineSchema = Yup.object().shape({
  linia: Yup.string().required("Linia musi mieć numer (oznaczenie)"),
});

const LineManager = () => {
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addError, setAddError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLines, setEditedLines] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchLines();
  }, []);

  const fetchLines = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5057/api/Line');
      if (response.status === 200) {
        setLines(response.data);
      } else {
        throw new Error(`Received unexpected status code: ${response.status}`);
      }
    } catch (err) {
      console.error('Błąd podczas pobierania linii:', err);
      setError('Błąd podczas pobierania linii.');
    } finally {
      setLoading(false);
    }
  };

  const addLine = async (newLineNumber) => {
    if (!newLineNumber.trim()) return;

    try {
      await axios.post(`http://localhost:5057/api/Line?numberOfLine=${encodeURIComponent(newLineNumber)}`);
      setAddError(null);
      fetchLines();
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setAddError(`Linia '${newLineNumber}' już istnieje. Dwie linie nie mogą mieć tej samej nazwy.`);
      } else {
        console.error('Błąd przy dodawaniu numeru linii', error);
        setAddError('Błąd przy dodawaniu numeru linii.');
      }
    }
  };

  const goToStopsManager = (lineId) => {
    navigate(`${lineId}/stops/`);
  };

  const deleteLine = async (id) => {
    try {
      await axios.delete(`http://localhost:5057/api/Line/${id}`);
      fetchLines();
    } catch (error) {
      console.error('Błąd przy usuwaniu linii', error);
      setError('Błąd przy usuwaniu linii.');
    }
  };

  const saveEditedLines = async () => {
    try {
      const updatePromises = Object.keys(editedLines).map(async (id) => {
        const updatedName = editedLines[id];
        const line = lines.find((line) => line.id === parseInt(id, 10));

        if (!line) return;

        if (updatedName.trim() && updatedName !== line.number) {
          await axios.put(
            `http://localhost:5057/api/Line/${id}?newNumber=${encodeURIComponent(updatedName)}`
          );
        }
      });

      await Promise.all(updatePromises);
      setIsEditing(false);
      setEditedLines({});
      fetchLines();
    } catch (error) {
      console.error('Błąd przy zapisie linii:', error);
      setError('Błąd przy zapisie linii.');
    }
  };

  const handleEditChange = (id, value) => {
    setEditedLines((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div>
      <h2>Linie</h2>
      <h3>Dodaj linię:</h3>
      <Formik
        initialValues={{ linia: "" }}
        validationSchema={lineSchema}
        validate={(values) => {
          if (!lineSchema.isValidSync(values)) {
            setAddError(null);
          }
        }}
        onSubmit={(values, { resetForm }) => {
          addLine(values.linia);
          resetForm();
        }}
      >
        {() => (
          <Form>
            <div>
              <Field
                type="text"
                id="linia"
                name="linia"
                className="form-control"
                placeholder="Wpisz numer linii"
              />
              <ErrorMessage name="linia">
                {(msg) => <div className="text-danger">{msg}</div>}
              </ErrorMessage>
            </div>
            {addError && <div className="text-danger mt-2">{addError}</div>}
            <button type="submit" className="btn btn-primary mt-2">
              Dodaj linię
            </button>
          </Form>
        )}
      </Formik>

      <div>
        <h3>Lista linii:</h3>
        {loading ? (
          <p>Ładowanie...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <ul>
            {lines.map((line) => (
              <li key={line.id}>
                {!isEditing ? (
                  <span
                    onClick={() => goToStopsManager(line.id)}
                    style={{
                      //color: 'blue',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    {line.number}
                  </span>
                ) : (
                  <>
                    <input
                      type="text"
                      className="form-control"
                      value={editedLines[line.id] ?? line.number}
                      onChange={(e) => handleEditChange(line.id, e.target.value)}
                    />
                    <button
                      onClick={() => deleteLine(line.id)}
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
              onClick={saveEditedLines}
              className="btn btn-success mt-2"
            >
              Zapisz zmiany
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditedLines({});
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

export default LineManager;
