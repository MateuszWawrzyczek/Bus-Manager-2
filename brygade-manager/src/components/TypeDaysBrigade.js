import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; 

const TypeDaysBrigades = () => {
    const [typesOfDays, setTypesOfDays] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTypesOfDays = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:5057/api/TypeOfDays'); 
                setTypesOfDays(response.data);
            } catch (err) {
                setError('Błąd przy pobieraniu typów dni.');
            } finally {
                setLoading(false);
            }
        };
        fetchTypesOfDays();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>Typy dni</h1>
            <h3>Kliknij w typ dnia, aby stworzyć/zedytować brygadę</h3>
            <ul>
                {typesOfDays.map((typeOfDay) => (
                    <li key={typeOfDay.id}>
                        <Link
                            to={`/manage-brigade/${typeOfDay.id}/days`} 
                            style={{ 
                                color: 'black', 
                                fontWeight: 'bold', 
                                textDecoration: 'none' 
                            }}
                        >
                            {typeOfDay.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TypeDaysBrigades;
