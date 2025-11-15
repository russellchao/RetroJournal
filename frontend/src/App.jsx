import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from "./pages/Landing.jsx";
import Entries from "./pages/Entries.jsx";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route 
            path="/" 
            element={
              <>
                <SignedOut>
                  <Landing />
                </SignedOut>
                <SignedIn>
                  <Navigate to="/entries" replace />
                </SignedIn>
              </>
            } 
          />
          <Route 
            path="/entries" 
            element={
              <>
                <SignedOut>
                  <Navigate to="/" replace />
                </SignedOut>
                <SignedIn>
                  <Entries />
                </SignedIn>
              </>
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App;
