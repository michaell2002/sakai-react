import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import UserContext from './context/usercontext';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const {appUser} = useContext(UserContext);
    const model = [
        /*
        {
            label: 'Home',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
        },
        */
        {
            label: 'External Functions',
            items: [
                { label: 'Customer Management', icon: 'pi pi-fw pi-id-card', to: '/customers' },
                { label: 'Supplier Management', icon: 'pi pi-fw pi-check-square', to: '/suppliers' },
               // { label: 'Sales Administration', icon: 'pi pi-fw pi-list', to: '/uikit/invalidstate' },
               // { label: 'Finance', icon: 'pi pi-fw pi-chart-bar', to: '/uikit/invalidstate' },
                { label: 'Contact Person View', icon: 'pi pi-fw pi-bookmark', to: '/contactpersons' }
            ]
        },
                {
            label: 'Internal Functions',
            items: [
                { label: 'Brand Portfolio', icon: 'pi pi-fw pi-bookmark', to: '/brand' },
                { label: 'Inventory Management', icon: 'pi pi-fw pi-table', to: '/inventory' },
               // { label: 'Sales Administration', icon: 'pi pi-fw pi-list', to: '/uikit/invalidstate' },
               // { label: 'Finance', icon: 'pi pi-fw pi-chart-bar', to: '/uikit/invalidstate' },
            ]
        },
        appUser.authorities.has("ADMIN") && {
            label: 'Admin',
            items: [{ label: 'User Management', icon: 'pi pi-fw pi-users', to: '/users' }]
        } 
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}

            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
