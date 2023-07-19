import React, { useContext, useState, useRef, useEffect} from 'react';
import AppConfig from '../layout/AppConfig';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import UserContext from '../layout/context/usercontext';
import SERVER_PREFIX from './Domain.jsx';
import { Login, refreshToken } from './api/UserAPI';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
const LoginPage = ({updateAppUser, updateForceLogoutVisible, appUser}) => {
    
    const toast = useRef(null);
    const [password, setPassword] = useState('password');
    const [username, setUsername] = useState('root');
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });
      const handleSignIn = async (username, password) => {
        console.log("SIGN IN");
        setLoading(prev => true);
        await Login(username, password, updateAppUser).catch(error => {
          toast.current?.show({ severity: 'error', summary: 'Error', detail: "Unable to Login: " + error.message, life: 3000 });
        });
        setLoading(prev => false);
      };
    return (
        <div className={containerClassName}>
            <Toast ref={toast}></Toast>
            <div className="flex flex-column align-items-center justify-content-center">
                <div style={{ borderRadius: '56px', padding: '0.3rem', background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)' }}>
                    {!loading && <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">
                            <div className="text-900 text-3xl font-medium mb-3">Welcome</div>
                            <span className="text-600 font-medium">Sign in to continue</span>
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-900 text-xl font-medium mb-2">
                                Username
                            </label>
                            <InputText inputid="username" value={username} onChange={(e) => setUsername(e.target.value)} type="text" placeholder="Username" className="w-full md:w-30rem mb-5" style={{ padding: '1rem' }} />

                            <label htmlFor="password1" className="block text-900 font-medium text-xl mb-2">
                                Password
                            </label>
                            <Password inputid="password1" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" toggleMask className="w-full mb-5" inputClassName="w-full p-3 md:w-30rem"></Password>

                            <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                {/*
                                <div className="flex align-items-center">
                                    <Checkbox inputid="rememberme1" checked={checked} onChange={(e) => setChecked(e.checked)} className="mr-2"></Checkbox>
                                    <label htmlFor="rememberme1">Remember me</label>
                                </div>
                                <a className="font-medium no-underline ml-2 text-right cursor-pointer" style={{ color: 'var(--primary-color)' }}>
                                    Forgot password?
                                </a>
                                */}
                            </div>
                            <Button label="Sign In" className="w-full p-3 text-xl" onClick={(e) => handleSignIn(username, password)}></Button>
                        </div>
                    </div>}
                    {loading && 
                    <div className='flex align-content-center justify-content-center text-center'> 
                        <ProgressSpinner></ProgressSpinner>
                    </div>
                    }
                </div>
            </div>
        </div>
    );
};

LoginPage.getLayout = function getLayout(page) {
    return (
        <React.Fragment>
            {page}
            <AppConfig simple />
        </React.Fragment>
    );
};
export default LoginPage;
