import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import CourseDetail from "./pages/CourseDetail";
import Home from "./pages/Home";

export type Page =
  | { name: "home" }
  | { name: "course"; id: bigint }
  | { name: "admin" };

export default function App() {
  const [page, setPage] = useState<Page>({ name: "home" });

  const navigate = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar page={page} navigate={navigate} />
      <main className="flex-1">
        {page.name === "home" && <Home navigate={navigate} />}
        {page.name === "course" && (
          <CourseDetail courseId={page.id} navigate={navigate} />
        )}
        {page.name === "admin" && <AdminDashboard navigate={navigate} />}
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
