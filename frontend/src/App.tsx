import { useState } from 'react';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './graphql/client';
import { Traductor } from './components/Traductor';
import { Sugerencias } from './components/Sugerencias';
import { HealthCheck } from './components/HealthCheck';
import './App.css';

type Tab = 'traductor' | 'sugerencias' | 'health';

function App() {
  const [tab, setTab] = useState<Tab>('traductor');

  return (
    <ApolloProvider client={apolloClient}>
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <h1>🇨🇱 Traductor Chilensis</h1>
            <p>Traduce modismos chilenos a español neutro</p>
          </div>
        </header>

        <nav className="app-nav">
          <button
            className={`nav-btn ${tab === 'traductor' ? 'active' : ''}`}
            onClick={() => setTab('traductor')}
          >
            🔄 Traductor
          </button>
          <button
            className={`nav-btn ${tab === 'sugerencias' ? 'active' : ''}`}
            onClick={() => setTab('sugerencias')}
          >
            💡 Sugerencias
          </button>
          <button
            className={`nav-btn ${tab === 'health' ? 'active' : ''}`}
            onClick={() => setTab('health')}
          >
            🔍 Estado
          </button>
        </nav>

        <main className="app-main">
          {tab === 'traductor' && <Traductor />}
          {tab === 'sugerencias' && <Sugerencias />}
          {tab === 'health' && <HealthCheck />}
        </main>

        <footer className="app-footer">
          <p>Proyecto Microservicios — TypeScript · Go · Java · Rust</p>
        </footer>
      </div>
    </ApolloProvider>
  );
}

export default App;
