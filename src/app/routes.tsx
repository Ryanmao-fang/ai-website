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
import { SearchPage } from "./pages/Search";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { Help } from "./pages/Help";
import { SiteMap } from "./pages/SiteMap";
import { Feedback } from "./pages/Feedback";
import { NotFound } from "./pages/NotFound";
import { Favorites } from "./pages/Favorites";
import { AccountSettings } from "./pages/AccountSettings";
import { Orders } from "./pages/Orders";
import { TemplateSubmit } from "./pages/TemplateSubmit";
import { Explore } from "./pages/Explore";
import { SupportTickets } from "./pages/SupportTickets";
import { Changelog } from "./pages/Changelog";
import { ProBooking } from "./pages/ProBooking";
import { MembershipBenefits } from "./pages/MembershipBenefits";
import { Referral } from "./pages/Referral";
import { ToolsCompare } from "./pages/ToolsCompare";
import { TermBySlug } from "./pages/TermBySlug";
import { ToolBySlug } from "./pages/ToolBySlug";

function StandardLearningPath() {
  return <LearningPath />;
}

function StandardTemplates() {
  return (
    <RequireAccess minTier="standard">
      <Templates />
    </RequireAccess>
  );
}

function AuthUserCenter() {
  return (
    <RequireAccess minTier="auth">
      <UserCenter />
    </RequireAccess>
  );
}

function AuthFavoritesPage() {
  return (
    <RequireAccess minTier="auth">
      <Favorites />
    </RequireAccess>
  );
}

function AuthAccountSettings() {
  return (
    <RequireAccess minTier="auth">
      <AccountSettings />
    </RequireAccess>
  );
}

function AuthOrders() {
  return (
    <RequireAccess minTier="auth">
      <Orders />
    </RequireAccess>
  );
}

function AuthTemplateSubmit() {
  return (
    <RequireAccess minTier="auth">
      <TemplateSubmit />
    </RequireAccess>
  );
}

function AuthSupportTickets() {
  return (
    <RequireAccess minTier="auth">
      <SupportTickets />
    </RequireAccess>
  );
}

function AuthProBooking() {
  return (
    <RequireAccess minTier="auth">
      <ProBooking />
    </RequireAccess>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "search", Component: SearchPage },
      { path: "explore", Component: Explore },
      { path: "changelog", Component: Changelog },
      { path: "referral", Component: Referral },
      { path: "membership/benefits", Component: MembershipBenefits },
      { path: "support/tickets", Component: AuthSupportTickets },
      { path: "pro-booking", Component: AuthProBooking },
      { path: "tools/compare", Component: ToolsCompare },
      { path: "about", Component: About },
      { path: "contact", Component: Contact },
      { path: "help", Component: Help },
      { path: "site-map", Component: SiteMap },
      { path: "feedback", Component: Feedback },
      { path: "terms", Component: TermsList },
      { path: "terms/:id", Component: TermDetail },
      { path: "term/:slug", Component: TermBySlug },
      { path: "tools", Component: ToolsList },
      { path: "tools/:id", Component: ToolDetail },
      { path: "tool/:slug", Component: ToolBySlug },
      { path: "learning-path", Component: StandardLearningPath },
      { path: "templates", Component: StandardTemplates },
      { path: "templates/submit", Component: AuthTemplateSubmit },
      { path: "user", Component: AuthUserCenter },
      { path: "favorites", Component: AuthFavoritesPage },
      { path: "account/settings", Component: AuthAccountSettings },
      { path: "orders", Component: AuthOrders },
      { path: "membership", Component: Membership },
      { path: "legal/user-agreement", Component: UserAgreement },
      { path: "legal/privacy-policy", Component: PrivacyPolicy },
      { path: "not-found", Component: NotFound },
      { path: "*", Component: NotFound },
    ],
  },
]);
