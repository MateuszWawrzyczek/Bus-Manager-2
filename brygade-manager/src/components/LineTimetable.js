import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LineTimetable = () => {
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  const goToStopsManager = (lineId) => {
    navigate(`${lineId}/stops/`);
  };

  return (
    <div>
      <h2>Linie</h2>
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
                <span
                  onClick={() => goToStopsManager(line.id)}
                  style={{
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  {line.number}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LineTimetable;
