
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import AddApplication from "./pages/AddApplication";
import ViewApplication from "./pages/ViewApplication";
import EditApplication from "./pages/EditApplication";
import NotFound from "./pages/NotFound";
import { getMongoDBConfig } from "./lib/storage";
import { toast } from "sonner";

const queryClient = new QueryClient();

const App = () => {
  // Check MongoDB integration on startup
  useEffect(() => {
    const mongoConfig = getMongoDBConfig();
    
    if (mongoConfig.enabled) {
      const checkMongoDB = async () => {
        try {
          const response = await fetch(`${mongoConfig.apiUrl}/health`);
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'ok') {
              toast.success('Connected to MongoDB successfully');
            } else {
              throw new Error('MongoDB health check failed');
            }
          } else {
            throw new Error('MongoDB health check failed');
          }
        } catch (error) {
          console.error('MongoDB connection error:', error);
          toast.error('Failed to connect to MongoDB. Using local storage instead.');
        }
      };
      
      checkMongoDB();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/add-application" element={<AddApplication />} />
            <Route path="/application/:id" element={<ViewApplication />} />
            <Route path="/edit-application/:id" element={<EditApplication />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
