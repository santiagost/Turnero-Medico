import { createHashRouter, RouterProvider } from "react-router-dom";
import { useEffect, useState } from "react";
import Spinner from "./components/ui/Spinner";
import { getSystemStatus } from "../services/api.service";

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
import { AuthProvider } from "./context/AuthContext";

const router = createHashRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/", element: <LoginPage />, },
      { path: "/register", element: <RegisterPage />, },
      { path: "/forgot-password", element: <ForgotPassword />, },
    ],
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
          { path: "/patient/history/:consultationId", element: <PatientHistory /> },
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
          { path: "/doctor/home/:shiftId", element: <DoctorHome /> },
          { path: "/doctor/patients", element: <DoctorPatients /> },
          { path: "/doctor/patients/:patientId", element: <DoctorPatients /> },
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
          { path: "/admin/doctors/:doctorId", element: <AdminDoctors /> },
          { path: "/admin/patients", element: <AdminPatients /> },
          { path: "/admin/patients/:patientId", element: <AdminPatients /> },
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
  const [isLoading, setIsLoading] = useState(true);
  const [isServerUp, setIsServerUp] = useState(false);

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        await getSystemStatus();
        setIsServerUp(true);
      } catch (error) {
        console.error("API Down:", error);
        setIsServerUp(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkApiStatus();
  }, []);


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white bg-custom-light-blue p-4">
        <Spinner />
        <p className="mt-4 text-sm animate-pulse">Conectando con el servidor...</p>
      </div>
    );
  }

  if (!isServerUp) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white bg-white p-4">
        <div className="bg-red-900 p-10 flex flex-col items-center justify-center rounded-4xl">
          <h1 className="text-3xl font-bold mb-2">Servicio No Disponible</h1>
          <p>No pudimos conectar con el sistema médico.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-white text-red-900 rounded font-bold hover:bg-gray-200 transition"
          >
            Reintentar conexión
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
