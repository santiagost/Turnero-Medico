import { createHashRouter, RouterProvider } from "react-router-dom";

// --- Importar Componentes ---
import ProtectedRoute from "./routes/ProtectedRoute";
import Layout from "./components/layout/Layout";

// --- Importar Páginas (Placeholders) ---
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import UnauthorizedPage from "./pages/Common/UnauthorizedPage";
import NotFoundPage from "./pages/Common/NotFoundPage";
import ForgotPassword from "./pages/Auth/ForgotPassword";

import PatientHome from "./pages/Patient/PatientHome";
import PatientSchedule from "./pages/Patient/PatientSchedule";
import PatientHistory from "./pages/Patient/PatientHistory";

import DoctorHome from "./pages/Doctor/DoctorHome";
import DoctorPatients from "./pages/Doctor/DoctorPatients";
import DoctorSchedule from "./pages/Doctor/DoctorSchedule";

import AdminHome from "./pages/Admin/AdminHome";
import AdminSchedule from "./pages/Admin/AdminSchedule";
import AdminDoctors from "./pages/Admin/AdminDoctors";
import AdminPatients from "./pages/Admin/AdminPatients";
import AdminReports from "./pages/Admin/AdminReports";
import AdminOthers from "./pages/Admin/AdminOthers";
import SettingsPage from "./pages/Common/SettingsPage";
import { AuthLayout } from "./components/layout/AuthLayout";

const router = createHashRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/", element: <LoginPage />, },
      { path: "/register", element: <RegisterPage />, },
    ],
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },

  // =============================================
  {
    element: <ProtectedRoute allowedRoles={['Patient']} />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/patient/home", element: <PatientHome /> },
          { path: "/patient/schedule", element: <PatientSchedule /> },
          { path: "/patient/history", element: <PatientHistory /> },
          { path: "/patient/settings", element: <SettingsPage /> },
        ],
      },
    ],
  },

  // =============================================
  {
    element: <ProtectedRoute allowedRoles={['Doctor']} />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/doctor/home", element: <DoctorHome /> },
          { path: "/doctor/patients", element: <DoctorPatients /> },
          { path: "/doctor/schedule", element: <DoctorSchedule /> },
          { path: "/doctor/settings", element: <SettingsPage /> },
        ],
      },
    ],
  },

  // =============================================
  {
    element: <ProtectedRoute allowedRoles={['Admin']} />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/admin/home", element: <AdminHome /> },
          { path: "/admin/schedule", element: <AdminSchedule /> },
          { path: "/admin/doctors", element: <AdminDoctors /> },
          { path: "/admin/patients", element: <AdminPatients /> },
          { path: "/admin/reports", element: <AdminReports /> },
          { path: "/admin/others", element: <AdminOthers /> },
          { path: "/admin/settings", element: <SettingsPage /> },
        ],
      },
    ],
  },

  {
    path: "*",
    element: <NotFoundPage />,
  },
]);


const App = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
