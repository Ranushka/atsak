import * as React from "react";
import { Shell } from "./Shell";
import { CompaniesPage } from "./pages/CompaniesPage";
import { ComponentsPage } from "./pages/ComponentsPage";
import type { CompanyStatus } from "./data/companies";

function useHashRoute() {
  const [hash, setHash] = React.useState(() => window.location.hash || "#/companies-pending-kyb");

  React.useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || "#/companies-pending-kyb");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = React.useCallback((id: string) => {
    window.location.hash = `#/${id}`;
  }, []);

  return { route: hash.replace(/^#\//, ""), navigate };
}

const companiesFilter: Record<string, CompanyStatus | undefined> = {
  "companies-active": "active",
  "companies-pending-kyb": "pending_kyb",
  "companies-signed-up": "signed_up",
};

export function App() {
  const { route, navigate } = useHashRoute();

  let content: React.ReactNode;
  if (route in companiesFilter) {
    content = <CompaniesPage statusFilter={companiesFilter[route]} />;
  } else if (route === "components") {
    content = <ComponentsPage />;
  } else {
    content = (
      <div className="flex h-64 items-center justify-center text-muted-foreground">Not built yet.</div>
    );
  }

  return (
    <Shell activeId={route} onNavigate={navigate}>
      {content}
    </Shell>
  );
}
