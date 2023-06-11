import React from 'react';
import { LayoutProvider } from './layout/context/layoutcontext';
import Layout from './layout/layout';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import './styles/layout/layout.scss';
import './styles/demo/Demos.scss';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-blue/theme.css';
function App() {
  return (
    <React.StrictMode>
      <LayoutProvider>
        <Layout></Layout>
      </LayoutProvider>
  </React.StrictMode>
  );
}

export default App;
