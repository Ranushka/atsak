import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Overview from "./pages/Overview";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import AllTasks from "./pages/AllTasks";
import Specifications from "./pages/Specifications";
import ScheduledJobs from "./pages/ScheduledJobs";
import AiSessions from "./pages/AiSessions";
import Activity from "./pages/Activity";
import SettingsPage from "./pages/Settings";
import { useActiveProject } from "./lib/activeProject";

function Home() {
  const { activeProjectId } = useActiveProject();
  if (activeProjectId) {
    return <Navigate to={`/projects/${activeProjectId}`} replace />;
  }
  return <Overview />;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/projects/:id/:tab" element={<ProjectDetail />} />
        <Route path="/tasks" element={<AllTasks />} />
        <Route path="/specifications" element={<Specifications />} />
        <Route path="/jobs" element={<ScheduledJobs />} />
        <Route path="/sessions" element={<AiSessions />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Layout>
  );
}
