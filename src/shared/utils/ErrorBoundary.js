import React from 'react';
import { Redirect } from 'react-router';


//Les périmètres d’erreurs n’interceptent pas les erreurs qui surviennent dans :
// - Les gestionnaires d’événements (en savoir plus).
// - Le code asynchrone (par exemple les fonctions de rappel de setTimeout ou requestAnimationFrame).=> data fetching error will set props.error
// - Le rendu côté serveur. => ssr middleware will redirect to error page
// - Les erreurs levées dans le composant du périmètre d’erreur lui-même (plutôt qu’au sein de ses enfants).

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // console.log('[getDerivedStateFromError]', error);
    // Mettez à jour l'état, de façon à montrer l'UI de repli au prochain rendu.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {

    // Vous pouvez aussi enregistrer l'erreur au sein d'un service de rapport.
    // console.log('componentDidCatch', error, errorInfo);
    // logErrorToMyService(error, errorInfo);
  }

  render(props) {

    if (this.state.hasError) {
      // Vous pouvez afficher n'importe quelle UI de repli.
      return (
        <Redirect to="/error" />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
