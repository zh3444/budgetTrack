import { useEffect } from "react";
import { checkGmailTokenStatus } from "./api";

import { Button } from "@/components/ui/button";

const Dashboard = () => {
  // Check if the user has a valid Gmail token on component mount
  useEffect(() => {
    async function checkTokenStatus() {
      const status = await checkGmailTokenStatus(localStorage.getItem('token'));
      if (status.needsReauth) {
        const originalEmail = localStorage.getItem('email');
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        const nonce = array[0].toString(16);
        const state = encodeURIComponent(JSON.stringify({
          email: originalEmail,
          nonce: nonce
        }));
        console.log('Token needs re-authentication ', status);
        window.location.href = `${import.meta.env.VITE_API_URL}/gmail/google?state=${state}`;
      } else {
        console.log('Token is valid, no re-authentication needed ', status);
      }
    }
    checkTokenStatus();
  }, []);

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">
        Dashboard
      </h2>
      <p> Your recent transactions will appear here </p>
    </>
  );
}

export default Dashboard;