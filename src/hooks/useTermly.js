import { useEffect } from 'react';

export const useTermly = () => {
  useEffect(() => {
    // On vérifie si le script n'est pas déjà présent
    const existingScript = document.querySelector('script[src*="termly"]');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = "https://app.termly.io/resource-blocker/e2e770e0-58c1-404f-a952-ecde733679f9?autoBlock=on";
      script.async = true;
      script.id = "termly-loader";
      document.head.appendChild(script);
    }

    // Optionnel : On peut forcer l'affichage de la bannière si Termly est déjà chargé
    if (window.Termly) {
      window.Termly.showPreferenceCenter();
    }
  }, []);
};