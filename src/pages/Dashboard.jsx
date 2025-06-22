import { useEffect } from "react";

import { Button } from "@/components/ui/button";

const Dashboard = () => {
  // test gmail auth flow after login
  // useEffect(() => {
  //   window.location.href = `${import.meta.env.VITE_API_URL}/gmail/google`;
  // }, []);

  const test = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/gmail/google`;
  }

  useEffect(() => {
    getEmails();
  }, []);

  const getEmails = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/gmail/emails`, {
      credentials: 'include'
    });
    const data = await response.json();
    console.log('getting emails ',data);
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">
        Dashboard
      </h2>
      <Button onClick={test}>
        Test
      </Button>
      <Button onClick={getEmails}>
        Get Emails
      </Button>
      <p> Your recent transactions will appear here </p>
    </>
  );
}

export default Dashboard;