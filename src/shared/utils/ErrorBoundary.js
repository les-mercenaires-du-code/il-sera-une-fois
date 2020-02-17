import React from 'react';
import { Redirect } from 'react-router';


//Les périmètres d’erreurs n’interceptent pas les erreurs qui surviennent dans :
// - Les gestionnaires d’événements
// - Le code asynchrone (par exemple les fonctions de rappel de setTimeout ou requestAnimationFrame) => data fetching error will set props.error
// - Le rendu côté serveur => ssr middleware will redirect to error page
// - Les erreurs levées dans le composant du périmètre d’erreur lui-même (plutôt qu’au sein de ses enfants)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // console.log('[getDerivedStateFromError]', error);
    // Prevent mounting children
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {

    // console.log('componentDidCatch', errorInfo);
    // logErrorToMyService(error, errorInfo);
  }

  render() {

    if (this.state.hasError) {
      // Redirect to generic error page (also used by server redirect)
      // this error is NOT related to an async call or event error
      return (
        <Redirect to={{
            pathname: '/error',
            state: {
              from: this.props.location.pathname,
            },
          }}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
