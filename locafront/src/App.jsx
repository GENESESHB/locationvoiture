import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import WegoHeader from './components/WegoHeader'
import HeroSearch from './components/HeroSearch'
import CarHighlights from './components/CarHighlights'
import CarList from './components/CarList'
import UserLocation from './components/UserLocation'
import Bots from './components/bots'
<<<<<<< HEAD
=======
import Partner from './components/Partner';
>>>>>>> 69ecfe8 (aaaddd)

// Import your new pages
import About from './pages/About'
import Contact from './pages/Contact'
import Support from './pages/Support'
import Experience from './pages/Experience'
import Booking from './pages/Booking'

import './index.css'

const MOCK_CARS = [
  {
    id: 'c1',
    name: 'Dacia Sandero ou similaire',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=80&auto=format&fit=crop',
    rating: 7.8,
    reviewsCount: 132,
    priceMAD: 190,
    tag: 'Populaire',
  },
  {
    id: 'c2',
    name: 'Peugeot 208 automatique',
    imageUrl: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=1200&q=80&auto=format&fit=crop',
    rating: 8.1,
    reviewsCount: 87,
    priceMAD: 240,
  },
  {
    id: 'c3',
    name: 'Mercedes Classe C',
    imageUrl: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200&q=80&auto=format&fit=crop',
    rating: 9.0,
    reviewsCount: 310,
    priceMAD: 650,
    tag: 'Luxe',
  },
  {
    id: 'c4',
    name: 'Range Rover Sport',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjWQGRQbOfYNGyOu5uV-o0K7bkz97qM56QEw&s',
    rating: 8.6,
    reviewsCount: 205,
    priceMAD: 890,
    tag: 'SUV',
  },
]

export default function App() {
  return (
    <Router>
      {/* Navbar visible everywhere */}
      <WegoHeader />

      <Routes>
        {/* 🏠 Home route */}
        <Route
          path="/"
          element={
            <>
              <section className="herohbnb">
                <HeroSearch />
              </section>

              <section className="sec1">
                <CarHighlights />
                <CarList title="Voitures les plus demandées à Béni Mellal" cars={MOCK_CARS} />
                <UserLocation />
                <Bots />
              </section>
            </>
          }
        />

        {/* 📄 Other pages */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/support" element={<Support />} />
        <Route path="/experience" element={<Experience />} />
        <Route path="/booking" element={<Booking />} />
<<<<<<< HEAD
=======
        <Route path="/partner" element={<Partner />} />
>>>>>>> 69ecfe8 (aaaddd)
      </Routes>
    </Router>
  )
}
