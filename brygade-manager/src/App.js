import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import TypeOfDaysManager from './components/TypeOfDaysManager'; 
import BusStopManager from './components/BusStopManager';
import LineManager from './components/LineManager'
import LineStopsManager from './components/LineStopsManager'
import TimetableManager from './components/TimetableManager'
import BrigadeManager from './components/BrigadeManager'
import HomePage from './components/HomePage'; 
import LineTimetable from './components/LineTimetable';
import './App.css';
import Departures from './components/Departures';
import BrigadesTable from './components/Brigade';
import TypeDaysBrigades from './components/TypeDaysBrigade';
import Timetable from './components/Timetable';
import Companies from './components/CompaniesManager';
import LongTrips from './components/Trips';
function App() {
  return (
    <Router>
      <header>
        <nav className="menu">
          <Link to = "/">Strona główna</Link>
          <Link to = "/manage-types">Typy dni</Link>
          <Link to = "/manage-bus-stops">Przystanki</Link>
          <Link to = "/manage-lines">Przystanki na linii / linie</Link>
          <Link to = "/manage-brigade">Zarządzaj brygadami</Link>
          <Link to ="/manage-timetable">Zarządzaj rozkładem</Link>
          <Link to = "/get-departures">Najbliższe odjazdy</Link>
          <Link to = "/get-brigades">Brygady - czas pracy</Link>
          <Link to = "/trips">Kursy - czas trwania</Link>
        </nav>
      </header> 
  
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/manage-types" element={<TypeOfDaysManager />} />
          <Route path="/manage-bus-stops" element={<BusStopManager />} />
          <Route path="/manage-lines" element={<LineManager/>}/>
          <Route path="/manage-lines/:lineId/stops" element={<LineStopsManager />} /> 
          <Route path="/manage-timetable/:lineId/stops" element={<TimetableManager/>} /> 
          <Route path="/manage-brigade" element={<TypeDaysBrigades/>}/>
          <Route path="/manage-brigade/:typeOfDayId/days" element={<BrigadeManager/>}/>
          <Route path="/manage-timetable" element={<LineTimetable/>}/>
          <Route path="/get-departures" element={<Departures/>}/>
          <Route path="/get-brigades" element={<BrigadesTable/>}/>
          <Route path="/manage-timetable" element={<Timetable/>}/>
          <Route path="/manage-companies" element={<Companies/>}/>
          <Route path="/trips" element={<LongTrips/>}/>

          </Routes>
      </main>
    </Router>
  );
  
}  

export default App;
