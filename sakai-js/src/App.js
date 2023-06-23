import React, { useContext, useEffect, useState} from 'react';

// Create a co
import { LayoutProvider } from './layout/context/layoutcontext';
import Layout from './layout/layout';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import './styles/layout/layout.scss';
import './styles/demo/Demos.scss';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import ImageContext from './layout/context/imagecontext';
import { fetchCompany } from './components/ProfilePanelAPI';
function App() {

  const [contextValue, setContextValue] = useState(false);
  const [companyName, setCompanyName] = useState("");
  useEffect(() => {
    fetchCompany().then(c => {
      setCompanyName(prev => c.name);
    });
  }, [])
  const updateContextValue = (newValue) => {
    setContextValue(prev => newValue);
  };

  const updateCompanyName = (newValue) => {
    setCompanyName(prev => newValue);
  };
  return (
    <React.StrictMode>
      <ImageContext.Provider value={{contextValue, updateContextValue, companyName, updateCompanyName}}>
        <LayoutProvider>
          <Layout></Layout>
        </LayoutProvider>
      </ImageContext.Provider>
    </React.StrictMode>
  );
}

export default App;
