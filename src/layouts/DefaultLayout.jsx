import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import Navbar from "./Navbar";

export default function DefaultLayout() {
  return (
    <div className="min-h-screen min-w-screen flex flex-col bg-muted">
      <Navbar />
      <main className="flex-1 container px-4 py-4 mx-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
