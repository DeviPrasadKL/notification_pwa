const urlBase64ToUint8Array = base64String => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
  
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
  
    return outputArray;
  }
  
  const saveSubscription = async (subscription) => {
    const response = await fetch('https://pushnotify.novelhouston.com/save-subscription', {
        method: 'post',
        headers: { 'Content-type': "application/json" },
        body: JSON.stringify(subscription)
    })
  
    return response.json()
  }
  
  self.addEventListener('activate', async (e) => {
    e.waitUntil(
        self.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array("BCgsXAmj9oVn4oIlr531ZA0ZZwHXLQwlydph5yX6DtM0tHd5R1ONdxPR8gOC04TEWs6k71y7Y5kxoqE9huWI2Ig")
        }).then(async (subscription) => {
            const response = await saveSubscription(subscription);
            console.log('Subscription saved:', response);
        }).catch((err) => {
            console.error('Push subscription failed:', err);
        })
    );
  });
  
  self.addEventListener("push", e => {
    self.registration.showNotification("Wohoo!!", { body: e.data.text() })
  })