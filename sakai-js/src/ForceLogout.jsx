import React from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { Dialog } from 'primereact/dialog';

export default function ForceLogout({visible}) {
    return (
    <Dialog header="Logging Out" visible={visible} style={{ width: '50vw' }} closable={false}>
        <div className='flex align-content-center justify-content-center text-center'>
            <ProgressSpinner/>
        </div>
    </Dialog>
    )
}