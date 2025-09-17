import './App.css';
import { FlightForm } from './components/FlightForm';
import { FlightList } from './components/FlightList';
import { HotelForm } from './components/HotelForm';
import { HotelList } from './components/HotelList';
import { RentalCarForm } from './components/RentalCarForm';
import { RentalCarList } from './components/RentalCarList';
import { TrainForm } from './components/TrainForm';
import { TrainList } from './components/TrainList';
import { SelectionSummary } from './components/SelectionSummary';

const App = () => {
  return (
    <div className="app">
      <header className="app__header">
        <h1>Travel Planner</h1>
        <p>
          Plan flights, hotels, and ground transportation in a single dashboard. Add multiple options,
          mark your favourites, and watch the projected trip cost update automatically.
        </p>
      </header>
      <main className="app__layout">
        <div className="app__columns">
          <section className="panel">
            <header className="panel__header">
              <h2>Air travel</h2>
              <p className="muted">Track airfare options across airlines, cash or points.</p>
            </header>
            <FlightForm />
            <FlightList />
          </section>

          <section className="panel">
            <header className="panel__header">
              <h2>Hotels</h2>
              <p className="muted">Document accommodation details, including check-in/out information.</p>
            </header>
            <HotelForm />
            <HotelList />
          </section>

          <section className="panel">
            <header className="panel__header">
              <h2>Rental cars</h2>
              <p className="muted">Capture car hire quotes and keep pickup/drop-off logistics handy.</p>
            </header>
            <RentalCarForm />
            <RentalCarList />
          </section>

          <section className="panel">
            <header className="panel__header">
              <h2>Trains</h2>
              <p className="muted">Track rail segments and station details for multi-city journeys.</p>
            </header>
            <TrainForm />
            <TrainList />
          </section>
        </div>
        <SelectionSummary />
      </main>
    </div>
  );
};

export default App;
