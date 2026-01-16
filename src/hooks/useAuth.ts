import { useState, useEffect } from "react";

export function useAuth() {
  // Initialize the state to null, representing the loading state or undefined status
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    // Retrieve user data from localStorage
    const user = localStorage.getItem("user");
    const userLoggedIn = user !== null; // Check if the user exists in localStorage

    // Asynchronously update the state to avoid synchronous state update issues
    setTimeout(() => {
      setIsLoggedIn(userLoggedIn); // Update the login status after a delay
    }, 0); // 0ms delay to ensure state is updated asynchronously, avoiding synchronous calls
  }, []); // Empty dependency array ensures the effect runs only once when the component mounts

  return isLoggedIn; // Return the login status, `null` means the status is still being determined
}
