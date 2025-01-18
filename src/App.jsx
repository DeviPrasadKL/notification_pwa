import { Box } from "@mui/material";
import { lazy, useEffect, useState } from "react";
import Loadable from "./Components/Lodable";
const ThemeChanger = Loadable(lazy(() => import('../src/Theme/ThemeChanger')));

function App() {
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Check for required permissions and APIs
  const checkPermissions = () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error("No support for service worker!");
    }

    if (!('Notification' in window)) {
      throw new Error("No support for Notification API");
    }

    if (!('PushManager' in window)) {
      throw new Error("No support for Push API");
    }
  };

  // Register service worker
  const registerServiceWorker = async () => {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    return registration;
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error("Notification permission not granted");
    } else {
      setIsSubscribed(true);
    }
  };

  // Subscribe to push notifications
  const subscribeToPushNotifications = async (registration) => {
    const pushSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'your-public-vapid-key-here'  // Use your VAPID public key
    });
    console.log('Push subscription:', pushSubscription);
    // Optionally, you can send this subscription to your backend to save it
    // For example, using axios:
    // await axios.post('/save-subscription', pushSubscription);
  };

  // Main logic for app initialization
  useEffect(() => {
    const initializeApp = async () => {
      try {
        checkPermissions();  // Check if the browser supports necessary APIs

        await requestNotificationPermission();  // Request notification permission

        const registration = await registerServiceWorker();  // Register service worker
        console.log('Service Worker registered with scope:', registration.scope);

        // Wait for the service worker to be ready and then subscribe to push notifications
        const activeRegistration = await navigator.serviceWorker.ready;
        await subscribeToPushNotifications(activeRegistration);

      } catch (error) {
        console.error(error.message);
      }
    };

    initializeApp();  // Initialize app

  }, []);

  return (
    <>
      <div>
        <h1>Push Notification Demo</h1>
        <p>{isSubscribed ? 'You are subscribed to push notifications!' : 'You are not subscribed.'}</p>
      </div>
      <Box>
        <ThemeChanger />
      </Box>
    </>
  );
}

export default App;
