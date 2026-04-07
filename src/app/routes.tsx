import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { TermsList } from "./pages/TermsList";
import { TermDetail } from "./pages/TermDetail";
import { ToolsList } from "./pages/ToolsList";
import { ToolDetail } from "./pages/ToolDetail";
import { LearningPath } from "./pages/LearningPath";
import { Templates } from "./pages/Templates";
import { UserCenter } from "./pages/UserCenter";
import { Membership } from "./pages/Membership";
import { Layout } from "./components/Layout";
import { RequirePro } from "./components/RequirePro";
import { UserAgreement } from "./pages/UserAgreement";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";

function ProTermsList() {
  return (
    <RequirePro>
      <TermsList />
    </RequirePro>
  );
}

function ProTermDetail() {
  return (
    <RequirePro>
      <TermDetail />
    </RequirePro>
  );
}

function ProToolsList() {
  return (
    <RequirePro>
      <ToolsList />
    </RequirePro>
  );
}

function ProToolDetail() {
  return (
    <RequirePro>
      <ToolDetail />
    </RequirePro>
  );
}

function ProLearningPath() {
  return (
    <RequirePro>
      <LearningPath />
    </RequirePro>
  );
}

function ProTemplates() {
  return (
    <RequirePro>
      <Templates />
    </RequirePro>
  );
}

function ProUserCenter() {
  return (
    <RequirePro>
      <UserCenter />
    </RequirePro>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "terms", Component: ProTermsList },
      { path: "terms/:id", Component: ProTermDetail },
      { path: "tools", Component: ProToolsList },
      { path: "tools/:id", Component: ProToolDetail },
      { path: "learning-path", Component: ProLearningPath },
      { path: "templates", Component: ProTemplates },
      { path: "user", Component: ProUserCenter },
      { path: "membership", Component: Membership },
      { path: "legal/user-agreement", Component: UserAgreement },
      { path: "legal/privacy-policy", Component: PrivacyPolicy },
    ],
  },
]);
