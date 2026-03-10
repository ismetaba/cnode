import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isLoggedIn, getRole, login as doLogin } from './lib/api';
import type { Role } from './lib/api';
import Layout from './components/Layout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Workspaces from './pages/Workspaces';
import ApiKeys from './pages/ApiKeys';
import Chains from './pages/Chains';
import NodeHealth from './pages/NodeHealth';
import ChainManagement from './pages/ChainManagement';
import Logs from './pages/Logs';
import SystemInfo from './pages/SystemInfo';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const role = getRole();

  const handleLogin = (secret: string, role: Role) => {
    doLogin(secret, role);
    setLoggedIn(true);
  };

  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/workspaces" element={<Workspaces />} />
          <Route path="/keys" element={<ApiKeys />} />
          <Route path="/chains" element={<Chains />} />
          {role === 'operator' && (
            <>
              <Route path="/node-health" element={<NodeHealth />} />
              <Route path="/chain-management" element={<ChainManagement />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/system" element={<SystemInfo />} />
            </>
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
