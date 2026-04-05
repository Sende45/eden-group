export const launchNavigation = (address) => {
  if (!address) {
    alert("L'adresse de l'intervention n'est pas renseignée.");
    return;
  }

  const encodedAddress = encodeURIComponent(address);
  
  // Détection du système pour ouvrir la meilleure application
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  // Sur iOS on tente Apple Maps, sur le reste Google Maps
  const url = isIOS 
    ? `maps://maps.apple.com/?daddr=${encodedAddress}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;

  // Utilisation de window.open avec '_system' pour Capacitor (mobile)
  window.open(url, '_system');
};