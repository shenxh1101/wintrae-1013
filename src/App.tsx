import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { ToastContainer } from "@/components/common";

import DashboardPage from "@/pages/DashboardPage";
import BatchListPage from "@/pages/BatchListPage";
import ImportStepPage from "@/pages/ImportStepPage";
import TemplateStepPage from "@/pages/TemplateStepPage";
import AccountsStepPage from "@/pages/AccountsStepPage";
import TasksStepPage from "@/pages/TasksStepPage";
import ReviewStepPage from "@/pages/ReviewStepPage";
import TemplateManagePage from "@/pages/TemplateManagePage";
import SettingsPage from "@/pages/SettingsPage";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/batches" element={<BatchListPage />} />
          <Route path="/batches/:id/import" element={<ImportStepPage />} />
          <Route path="/batches/:id/templates" element={<TemplateStepPage />} />
          <Route path="/batches/:id/accounts" element={<AccountsStepPage />} />
          <Route path="/batches/:id/tasks" element={<TasksStepPage />} />
          <Route path="/batches/:id/review" element={<ReviewStepPage />} />
          <Route path="/templates" element={<TemplateManagePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <ToastContainer />
    </HashRouter>
  );
}
