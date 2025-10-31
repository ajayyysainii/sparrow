import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CallPage from './pages/CallPage';
import CallListPage from './pages/CallListPage';
import "./App.css";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/call" element={<CallPage />} />
          <Route path="/call/list" element={<CallListPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
