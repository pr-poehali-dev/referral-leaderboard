import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Index from "./pages/Index";
import ContestEnded from "./pages/ContestEnded";
import Test from "./pages/Test";
import Test2 from "./pages/Test2";
import TestBackend from "./pages/TestBackend";
import PhotoGallery from "./pages/PhotoGallery";
import TelegramCallback from "./pages/TelegramCallback";
import MouseTracker from "./pages/MouseTracker";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/contest-ended" element={<ContestEnded />} />
          <Route path="/test" element={<Test />} />
          <Route path="/test2" element={<Test2 />} />
          <Route path="/test-backend" element={<TestBackend />} />
          <Route path="/photo-gallery" element={<PhotoGallery />} />
          <Route path="/auth/telegram/callback" element={<TelegramCallback />} />
          <Route path="/mouse-tracker" element={<MouseTracker />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;