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
import { RequireAccess } from "./components/RequireAccess";
import { UserAgreement } from "./pages/UserAgreement";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";

function AuthTermsList() {
  return (
    <RequireAccess minTier="auth">
      <TermsList />
    </RequireAccess>
  );
}

function AuthTermDetail() {
  return (
    <RequireAccess minTier="auth">
      <TermDetail />
    </RequireAccess>
  );
}

function AuthToolsList() {
  return (
    <RequireAccess minTier="auth">
      <ToolsList />
    </RequireAccess>
  );
}

function AuthToolDetail() {
  return (
    <RequireAccess minTier="auth">
      <ToolDetail />
    </RequireAccess>
  );
}

function StandardLearningPath() {
  return (
    <RequireAccess minTier="standard">
      <LearningPath />
    </RequireAccess>
  );
}

function StandardTemplates() {
  return (
    <RequireAccess minTier="standard">
      <Templates />
    </RequireAccess>
  );
}

function StandardUserCenter() {
  return (
    <RequireAccess minTier="standard">
      <UserCenter />
    </RequireAccess>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "terms", Component: AuthTermsList },
      { path: "terms/:id", Component: AuthTermDetail },
      { path: "tools", Component: AuthToolsList },
      { path: "tools/:id", Component: AuthToolDetail },
      { path: "learning-path", Component: StandardLearningPath },
      { path: "templates", Component: StandardTemplates },
      { path: "user", Component: StandardUserCenter },
      { path: "membership", Component: Membership },
      { path: "legal/user-agreement", Component: UserAgreement },
      { path: "legal/privacy-policy", Component: PrivacyPolicy },
    ],
  },
]);
