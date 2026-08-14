import { Routes, Route } from "react-router-dom";
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

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
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
