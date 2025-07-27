import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center pt-24">
      <div className="text-center space-y-6">
        <div className="text-8xl">🎮</div>
        <h1 className="text-6xl font-orbitron font-bold text-neon">404</h1>
        <p className="text-xl text-muted-foreground mb-4">Quest not found in this dimension</p>
        <a href="/" className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors btn-glow">
          Return to Base
        </a>
      </div>
    </div>
  );
};

export default NotFound;
