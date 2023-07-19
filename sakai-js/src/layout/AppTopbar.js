import {Link} from 'react-router-dom';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef, useState } from 'react';
import { LayoutContext } from './context/layoutcontext';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import ProfilePanel from '../components/ProfilePanel'; 
import ImageContext from '../layout/context/imagecontext';
import CustomImage from '../components/CustomImage';
import UserContext from './context/usercontext';
import useClearCredentials from '../components/api/useClearCredentials';
const AppTopbar = forwardRef((props, ref) => {
    const { contextValue, updateContextValue, companyName } = useContext(ImageContext);
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const {appUser, abortRefreshTokens} = useContext(UserContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);
    const op = useRef(null);
    const [activateFlag, setActivateFlag] = useState(false);
    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));
    const handleProfileClick = (e) => {
        op.current.toggle(e);
        setActivateFlag(prev => !prev)
    };
    const ClearCredentials = useClearCredentials();
    const handleLogout = (e) => {
        abortRefreshTokens();
        ClearCredentials();
    }
    return (
        <div className="layout-topbar">
                <div className="layout-topbar-logo">
                    <CustomImage width={2.5} height={3}></CustomImage>
                    <span style={{marginLeft:"1rem"}}>{companyName}</span>
                </div>

            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                <i className="pi pi-bars" />
            </button>

            <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
                <i className="pi pi-ellipsis-v" />
            </button>

            <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
                {appUser.authorities.has("ADMIN") && 
                    <>
                    <button type="button" className="p-link layout-topbar-button" onClick={handleProfileClick}>
                        <i className="pi pi-cog"></i>
                        <span>Settings</span>
                    </button>
                    <ProfilePanel op={op} activateFlag={activateFlag}>
                    </ProfilePanel>
                    </>
                }
                {/*
                    <button type="button" className="p-link layout-topbar-button">
                        <i className="pi pi-user"></i>
                        <span>Profile</span>
                    </button>
                */}
                
                    <button type="button" className="p-link layout-topbar-button" onClick={handleLogout}>
                        <i className="pi pi-sign-out"></i>
                        <span>Logout</span>
                    </button>
            </div>
        </div>
    );
});

export default AppTopbar;
