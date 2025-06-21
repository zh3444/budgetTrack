// for mobile screen only
import { Home, PlusCircle, Settings, User } from 'lucide-react';

export default function BottomNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white shadow flex justify-around items-center h-14 border-t">
      <div className="flex flex-col items-center text-sm">
        <Home size={20} />
        <span> Home </span>
      </div>
      <div className="flex flex-col items-center text-sm">
        <PlusCircle size={20} />
        <span> Add </span>
      </div>
      <div className="flex flex-col items-center text-sm">
        <Settings size={20} />
        <span> Settings </span>
      </div>
    </div>
  );
}