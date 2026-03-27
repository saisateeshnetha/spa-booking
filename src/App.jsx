import { DashboardPage } from "./pages/DashboardPage.jsx";
import { ErrorBoundary } from "./components/ui/ErrorBoundary.jsx";

export default function App() {
  return (
    <ErrorBoundary>
      <DashboardPage />
    </ErrorBoundary>
  );
}
