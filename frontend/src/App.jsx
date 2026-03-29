import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"
import Login from "./features/auth/pages/Login.jsx"
import Register from "./features/auth/pages/Register.jsx"
import Protected from "./features/auth/components/Protected.jsx"
import Home from "./features/Home.jsx"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <Protected>
              <Home />
            </Protected>
          }
        />
        {/* Add more protected/game routes here */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}
