import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async'; // NEW IMPORT
import { Navigation } from "@/components/Navigation";
import { Home } from "@/pages/Home";
import { Games } from "@/pages/Games";
import { Reservations } from "@/pages/Reservations";
import { Contact } from "@/pages/Contact";
import NotFound from "./pages/NotFound";
import "@/i18n/config";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Ensure dark mode is applied
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <HelmetProvider> {/* NEW WRAPPER */}
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
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider> // NEW WRAPPER CLOSING
  );
};

export default App;