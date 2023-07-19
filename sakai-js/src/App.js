import React, { useContext, useEffect, useState, useRef} from 'react';

// Create a co
import { LayoutProvider } from './layout/context/layoutcontext';
import Layout from './layout/layout';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import './styles/layout/layout.scss';
import './styles/demo/Demos.scss';
import 'primeicons/primeicons.css';
//import 'primereact/resources/themes/bootstrap4-light-blue/theme.css';
import 'primereact/resources/themes/tailwind-light/theme.css';
import ImageContext from './layout/context/imagecontext';
import UserContext from './layout/context/usercontext';
import { fetchCompany } from './components/api/ProfilePanelAPI';
import LoginPage from './components/index.js';
import { refreshToken, refreshTokenUpdated} from './components/api/UserAPI';
import { Login } from './components/api/UserAPI';
import ClearCredentials from './components/api/ClearCredentials';
import ForceLogout from './ForceLogout';
function App() {
  const [contextValue, setContextValue] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [forceLogoutVisible, setForceLogoutVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const refresh = useRef(false);
  const appUserRef = useRef(null);
  const controller = useRef(new AbortController());

  const abortRefreshTokens = () => {
    console.log("ABORT")
    controller.current?.abort();
    controller.current = new AbortController();
  }
  const emptyAppUser = {
    username: null,
    authorities : new Set(),
    tokenValue : null,
    expiryDate : null
};
  const initializeUser = () => {
    let user = JSON.parse(localStorage.getItem('appUser'));
    if (user != undefined && user != null && user.username != null && user.expiryDate != null) {
      const user = JSON.parse(localStorage.getItem('appUser'));
      user.authorities = new Set(user.authorities.trim().split(" "));
      const timestamp = Date.parse(user.expiryDate);
      const date = new Date(timestamp);
      if (Date.now() > date.getTime()) {
        console.log("EXPIRED CREDENTIALS")
        return  {...emptyAppUser};
      } else {
        console.log("VALID")
        return user;
      }
    } else {
      console.log("NO CREDENTIALS")
      return {...emptyAppUser};
    }
  }
  const [appUser, setAppUser] = useState(initializeUser());
  const updateAppUser = (user) => {
    if (user == null) {
      setAppUser(prev => ({...emptyAppUser}));
    } else {
      setAppUser(prev => ({...user}));
    }
  }
  const handleSignIn = async (username, password) => {
    setLoading(prev => true);
    await Login(username, password, updateAppUser).catch(error => {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: "Unable to Login: " + error.message, life: 3000 });
    });
    setLoading(prev => false);
  };



  useEffect(() => {
    fetchCompany(appUser.tokenValue).then(c => { 
      setCompanyName(prev => c.name);
    }).catch(error => {
    });
  }, [appUser])


  useEffect(() => {
    const _appUser = {...appUser};
    let toStore = "";
    for (const auth of _appUser.authorities) {
      toStore += toStore + " " + auth;
    }
    _appUser.authorities = toStore;
    localStorage.setItem('appUser', JSON.stringify(_appUser));
  }, [appUser])
  
  useEffect(() => {
    appUserRef.current = appUser;
    if (appUser != undefined && appUser.tokenValue != undefined && appUser.tokenValue != null && refresh.current == false) { //in case of forced refresh in browser
      console.log("useEFFECT refresh")
      refresh.current = true;
      refreshTokenUpdated(appUser.tokenValue, updateAppUser, controller.current).catch(error => {
        console.log(error.message)
      })
    }
  }, [appUser]);  

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (appUserRef.current != null && appUserRef.current != undefined && appUserRef.current?.tokenValue != null && appUserRef.current?.tokenValue != undefined) {
            console.log("REFRESH TOKEN")
            refreshTokenUpdated(appUserRef.current?.tokenValue, updateAppUser, controller.current).catch(error => {
              console.log(error.message)
              setTimeout(() => {
                if (appUserRef.current != null && appUserRef.current != undefined && appUserRef.current?.tokenValue != null && appUserRef.current?.tokenValue != undefined) {
                   console.log("RETRY")
                   refreshTokenUpdated(appUserRef.current?.tokenValue, updateAppUser, controller.current).catch(error => {
                      console.log(error.message)
                      if (appUserRef.current?.username != null) {
                        setTimeout(() => setForceLogoutVisible(prev => false), 3000);
                        setForceLogoutVisible(prev => true);
                      }
                        localStorage.clear();
                        updateAppUser({...emptyAppUser});
                    })
                  }
              }, 10000);    
            })
      }
    }, 40000);
    return () => {
      clearInterval(intervalId); // Clear the interval when the component unmounts
    };
  }, []); 

  const updateContextValue = (newValue) => {
    setContextValue(prev => newValue);
  };

  const updateCompanyName = (newValue) => {
    setCompanyName(prev => newValue);
  };
  const updateForceLogoutVisible = (visible) => {
    setForceLogoutVisible(prev => visible);
  }
  return (
    <React.StrictMode>
      <UserContext.Provider value={{appUser, updateAppUser, abortRefreshTokens}}>
      <ImageContext.Provider value={{contextValue, updateContextValue, companyName, updateCompanyName}}>
        <LayoutProvider>
          <ForceLogout visible={forceLogoutVisible}></ForceLogout>
          {appUser.username && <Layout></Layout> }
          {!appUser.username && <LoginPage updateAppUser={updateAppUser} updateForceLogoutVisible={updateForceLogoutVisible} appUser={appUser} handleSignIn={handleSignIn}></LoginPage> }
        </LayoutProvider>
      </ImageContext.Provider>
      </UserContext.Provider>
    </React.StrictMode>
  );
}

export default App;
