import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { RequireAuth } from "./components/RequireAuth";
import Landing from "./pages/Landing";
import Browse from "./pages/Browse";
import ServiceDetail from "./pages/ServiceDetail";
import { Login, Signup } from "./pages/AuthPages";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Invoices from "./pages/Invoices";
import Settings from "./pages/Settings";
import MyServices from "./pages/business/MyServices";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/services" element={<Browse />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route element={<RequireAuth role="business" />}>
          <Route path="/my-services" element={<MyServices />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
