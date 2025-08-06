import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { Navigation } from "@/components/Navigation";
import { Home } from "@/pages/Home";
import { Games } from "@/pages/Games";
import { Reservations } from "@/pages/Reservations";
import { Contact } from "@/pages/Contact";
import { AboutUs } from "@/pages/AboutUs"; // NEW IMPORT
import NotFound from "./pages/NotFound";
import CookieConsent from "@/components/CookieConsent";
import "@/i18n/config";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Ensure dark mode is applied
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-gradient-dark">
              <Navigation />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/games" element={<Games />} />
                  <Route path="/reservations" element={<Reservations />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/about" element={<AboutUs />} /> {/* NEW ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
            {/* Cookie Consent Banner - Added at the end for proper z-index layering */}
            <CookieConsent />
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;