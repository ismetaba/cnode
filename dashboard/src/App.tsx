import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import Workspaces from './pages/Workspaces';
import ApiKeys from './pages/ApiKeys';
import Chains from './pages/Chains';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/workspaces" element={<Workspaces />} />
          <Route path="/keys" element={<ApiKeys />} />
          <Route path="/chains" element={<Chains />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
