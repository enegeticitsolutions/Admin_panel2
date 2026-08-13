import React, { useState, useEffect } from "react";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import WaitlistModal from "./components/modals/WaitlistModal";
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import SaathiPage from "./pages/SaathiPage";
import AuthPage from "./pages/AuthPage";
import AccountPage from "./pages/AccountPage";
import CheckoutPage from "./pages/CheckoutPage";
import PlansPage from "./pages/PlansPage";
import SiteGatekeeper from "./components/SiteGatekeeper";
import { fetchSubscriptionPackages } from "./services/api";

import SeoHead from "./components/seo/SeoHead";
import NotFoundPage from "./pages/NotFoundPage";

/**
 * App Component - Root Application Shell & Router
 */
const App = () => {
  const getPageFromHash = () => {
    const rawHash = (window.location.hash || "").replace("#", "").toLowerCase();
    if (!rawHash) return "home";
    const validPages = ["home", "services", "saathi", "plans", "auth", "account", "checkout"];
    return validPages.includes(rawHash) ? rawHash : "not-found";
  };

  const [activePage, setActiveStatePage] = useState(getPageFromHash);

  const setActivePage = (page) => {
    setActiveStatePage(page);
    try {
      if (window.location.hash !== `#${page}`) {
        window.history.pushState(null, "", `#${page}`);
      }
    } catch (e) {}
  };

  useEffect(() => {
    const handleHashChange = () => {
      setActiveStatePage(getPageFromHash());
    };
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("popstate", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("popstate", handleHashChange);
    };
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // User Auth State
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem("mhn_user");
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("mhn_token") || "");

  // Checkout package selection state
  const [selectedPackageForCheckout, setSelectedPackageForCheckout] = useState(null);
  const [pendingPackageForCheckout, setPendingPackageForCheckout] = useState(null);

  // Live Subscription Packages from API
  const [livePackages, setLivePackages] = useState([]);

  useEffect(() => {
    fetchSubscriptionPackages()
      .then((pkgs) => {
        if (Array.isArray(pkgs) && pkgs.length > 0) {
          setLivePackages(pkgs);
        }
      })
      .catch((err) =>
        console.log("Backend offline or packages endpoint unavailable, falling back to static plans.", err)
      );
  }, []);

  const handleAuthSuccess = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    try {
      localStorage.setItem("mhn_user", JSON.stringify(userData));
      localStorage.setItem("mhn_token", tokenData);
    } catch (e) { }

    if (pendingPackageForCheckout) {
      setSelectedPackageForCheckout(pendingPackageForCheckout);
      setPendingPackageForCheckout(null);
      setActivePage("checkout");
    } else {
      setActivePage("account");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken("");
    try {
      localStorage.removeItem("mhn_user");
      localStorage.removeItem("mhn_token");
    } catch (e) { }
    setActivePage("home");
  };

  const handleSelectPackageForBuy = (plan) => {
    if (!token || !user) {
      setPendingPackageForCheckout(plan);
      setActivePage("auth");
    } else {
      setSelectedPackageForCheckout(plan);
      setActivePage("checkout");
    }
  };

  const openForm = () => setIsModalOpen(true);
  const closeForm = () => setIsModalOpen(false);

  const renderAppContent = () => {
    if (activePage === "auth") {
      return <AuthPage onAuthSuccess={handleAuthSuccess} onGoBack={() => setActivePage("home")} />;
    }

    if (activePage === "account") {
      return (
        <AccountPage
          user={user}
          token={token}
          onLogout={handleLogout}
          onNavigateToPlans={() => setActivePage("plans")}
          onGoHome={() => setActivePage("home")}
        />
      );
    }

    if (activePage === "checkout") {
      return (
        <CheckoutPage
          selectedPackage={selectedPackageForCheckout}
          token={token}
          user={user}
          onSuccess={() => setActivePage("account")}
          onGoBack={() => setActivePage("plans")}
        />
      );
    }

    return (
      <div className="site-shell">
        <noscript>
          <div className="noscript">
            MaiHoonNa - India's first connected senior care ecosystem. Please enable JavaScript to use the full site experience.
          </div>
        </noscript>

        <Header
          activePage={activePage}
          setActivePage={setActivePage}
          user={user}
          openForm={openForm}
        />

        {activePage === "home" ? (
          <HomePage openForm={openForm} />
        ) : activePage === "services" ? (
          <ServicesPage setActivePage={setActivePage} openForm={openForm} />
        ) : activePage === "saathi" ? (
          <SaathiPage />
        ) : activePage === "plans" ? (
          <PlansPage
            livePackages={livePackages}
            onSelectPackage={handleSelectPackageForBuy}
            openForm={openForm}
          />
        ) : (
          <NotFoundPage setActivePage={setActivePage} />
        )}

        <Footer setActivePage={setActivePage} />

        <WaitlistModal isOpen={isModalOpen} onClose={closeForm} />
      </div>
    );
  };

  return (
    <SiteGatekeeper>
      <SeoHead activePage={activePage} />
      {renderAppContent()}
    </SiteGatekeeper>
  );
};

export default App;
