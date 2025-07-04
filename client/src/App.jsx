import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs'; // <-- The new public jobs page
import EmployerDashboard from './pages/EmployerDashboard'; // <-- The new protected employer page
import CandidateDashboard from './pages/CandidateDashboard'; // <-- Add a placeholder for this too
import QuizPage from './pages/QuizPage';
import { Toaster } from 'sonner'; 
// Auth Component
import ProtectedRoute from './components/auth/ProtectedRoute';
import ApplicantsPage from './pages/ApplicantsPage';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 container py-8">
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          {/* These routes are accessible to everyone */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<Jobs />} />
          {/* --- PROTECTED CANDIDATE ROUTES --- */}
          {/* These routes can only be accessed by logged-in users with the 'candidate' role */}
          <Route element={<ProtectedRoute requiredRole="candidate" />}>
             <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
             <Route path="/candidate/quiz/:applicationId" element={<QuizPage />} />
             {/* e.g., <Route path="/candidate/applications" element={<MyApplications />} /> */}
          </Route>

                    {/* --- PROTECTED EMPLOYER ROUTES --- */}
          <Route element={<ProtectedRoute requiredRole="employer" />}>
            <Route path="/employer/dashboard" element={<EmployerDashboard />} />
            {/* ADD THIS NEW ROUTE */}
            <Route path="/employer/job/:jobId/applicants" element={<ApplicantsPage />} /> 
          </Route>


        </Routes>
      </main>
      <Toaster richColors position="top-right" /> 
    </div>
  );
}

export default App;