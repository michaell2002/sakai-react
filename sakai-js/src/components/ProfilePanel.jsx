



    import React, {useContext, useRef, useState, useEffect} from 'react';
    import { InputText } from 'primereact/inputtext';
    import { OverlayPanel } from 'primereact/overlaypanel';
    import { Button } from 'primereact/button';
    import { Dialog } from 'primereact/dialog';
    import { DataTable } from 'primereact/datatable';
    import { Column } from 'primereact/column';
    import { fetchCompany, updateWarehouses, updateCompany, fetchWarehouses } from './api/ProfilePanelAPI';
    import SERVER_PREFIX from './Domain';
    import { FileUpload } from 'primereact/fileupload';
    import { Toast } from 'primereact/toast';
    import CustomImage from './CustomImage';
    import ImageContext from '../layout/context/imagecontext';
    import { ProgressSpinner } from 'primereact/progressspinner';
    import UserContext from '../layout/context/usercontext';
    export default function ProfilePanel({op, activateFlag}) {
        const {appUser} = useContext(UserContext);
        const emptyCompany = {
            id : null,
            name: "",
            email: "",
            phone: "",
            address: "",
        };
        const counterWarehouse = useRef(0);
        const phonePattern = /^[+\-\d]+$/;
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const toast = useRef(null);
        const [saveProfileProgress, setSaveProfileProgress] = useState(false);
        const [company, setCompany] = useState({...emptyCompany});
        const [formCompany, setFormCompany] = useState({...emptyCompany});
        const [mappedCompany, setMappedCompany] = useState([
            { field: 'Name', value: '' },
            { field: 'Email', value: '' },
            { field: 'Phone', value: '' },
            { field: 'Address', value: '' },
            { field: 'Warehouses', value: '' }
        ]);
        const saveProfileController = useRef(new AbortController())
        const [warehouses, setWarehouses] = useState([]);
        const [formWarehouses, setFormWarehouses] = useState([]);
        const [submitted, setSubmitted] = useState(false);
        const [warehouseSubmitted, setWarehouseSubmitted] = useState(false);
        const [profilePanel, setProfilePanel] = useState(false);
        const [tempWarehouse, setTempWarehouse] = useState({
            id : null,
            name : "",
            deletable : true
        });
        const emptyWarehouse = {
            id : null,
            name : "",
            deletable : true,
            tempId : null
        };
        const { contextValue, updateContextValue, companyName, updateCompanyName} = useContext(ImageContext);
        const dialogToast = useRef({});
        const hideDialog = () => {
            saveProfileController.current.abort();
            saveProfileController.current = new AbortController();
            setSaveProfileProgress(prev => false);
            setSubmitted(prev => false);
            setProfilePanel(prev => false);
            setWarehouseSubmitted(prev => false);
        };  
        useEffect(() => {
            setFormCompany(prev => company);
            setFormWarehouses(prev => warehouses);
        }, [activateFlag])
        const predicate = () => {
            if ( !formCompany.name || formCompany.name && formCompany.name.length > 256 ) {
                return false;
            } else if (formCompany.email && formCompany.email.length > 256 || !emailPattern.test(formCompany.email)) {
                return false;
            } else if (formCompany.phone && formCompany.phone.length > 30 || !phonePattern.test(formCompany.phone)) {
                return false;
            } else if (formCompany.address && formCompany.address.length > 1000) {
                return false;
            } 
            for (const warehouse of formWarehouses) {
                if (!warehouse.name) {
                    return false;
                } else if (warehouse.name && warehouse.name.length > 256) {
                    return false;
                } else if (warehouse.name && warehouse.name.length == 0) {
                    return false;
                }
            }
            return true;
        };
        const resetProfilePanel = () => {
            setProfilePanel(prev => false);
            setTempWarehouse(prev => ({...emptyWarehouse}));
            setSaveProfileProgress(prev => false);
        }
        const saveProfilePanel = () =>  {
            setSubmitted(prev => true);
            setSaveProfileProgress(prev => true);
            if (predicate()) {
                let _formCompany = JSON.parse(JSON.stringify(formCompany));
                let _formWarehouses = JSON.parse(JSON.stringify(formWarehouses));
                console.log(_formWarehouses);
                const _emptyWarehouse = {...emptyWarehouse};
                if (formCompany.id) {
                    const update1 = updateCompany(_formCompany, saveProfileController.current, appUser.tokenValue).then(res => {
                        setCompany(prev => _formCompany);
                        updateCompanyName(_formCompany.name);
                        toast.current != null ? toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Company Updated', life: 3000 }) :"";
                    }).catch(error => {
                        toast.current != null ?  toast.current.show({ severity: 'error', summary: 'Error', detail: "Unable to update company: " + error.message, life: 3000 }) :"";
                    })
                    const update2 = updateWarehouses(_formWarehouses, saveProfileController.current, appUser.tokenValue).then(res => {
                        setWarehouses(prev => _formWarehouses);
                        toast.current != null ?  toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Warehouses Updated', life: 3000 }) :"";
                    }).catch(error => {
                        toast.current != null ?  toast.current.show({ severity: 'error', summary: 'Error', detail:  "Unable to update warehouses: " + error.message, life: 3000 }) :"";
                    })
                    Promise.all([update1, update2]).then(([r1, r2]) => {
                    }).catch(error => {
                    }).finally(() => resetProfilePanel());
                }
            } else {
                setSaveProfileProgress(prev => false);
            } 
        };
        const onInputChange = (e, name) => {
            const val = (e.target && e.target.value) || '';
            let _formCompany = { ...formCompany };

            _formCompany[`${name}`] = val;

            setFormCompany((prev) => _formCompany);
        };
        const onWarehouseChange = (e) => {
            const val = (e.target && e.target.value) || '';
            const _tempWarehouse = {...tempWarehouse};
            _tempWarehouse.name = val;
            setTempWarehouse((prev) => _tempWarehouse);
        };
        const handleUpload = (e) => {
            updateContextValue(!contextValue);
        };
        const handleAddWarehouse = (e) => {
            setWarehouseSubmitted(prev => true);
            if (tempWarehouse.name.trim().length > 0 &&  tempWarehouse.name.trim().length < 256 && formWarehouses.filter(w => w.name == tempWarehouse.name.trim()).length == 0) {
                let _formWarehouses = [...formWarehouses];
                let _tempWarehouse = {...tempWarehouse};
                _tempWarehouse.name = _tempWarehouse.name.trim();
                _tempWarehouse.tempId = counterWarehouse.current;
                counterWarehouse.current = counterWarehouse.current + 1;
                _formWarehouses.push(_tempWarehouse);
                const _emptyWarehouse = {...emptyWarehouse};
                setTempWarehouse(prev => _emptyWarehouse);
                setFormWarehouses(prev => _formWarehouses);
                setWarehouseSubmitted(prev => false);
            } else {
                    dialogToast.current != null ? dialogToast.current.show({ severity: 'error', summary: 'Error', detail: 'Invalid Warehouse Name (unique & 0-256 char.)', life: 3000 }) : "";
            }
        };
        useEffect(() => {
            fetchCompany(appUser.tokenValue).then(c => {
                if (c != undefined && c != null) {
                    setCompany(prev => c);
                } else {
                    toast.current != null ? toast.current.show({ severity: 'error', summary: 'Error', detail: "Company Fetch Error", life: 3000 }) : "";
                }
            }).catch(error => {
                toast.current != null ? toast.current.show({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 }) : "";
            });
            fetchWarehouses(appUser.tokenValue).then(c => {
                if (c != undefined && c != null) {
                    const mappedArray = [];
                    for (const w of c) {
                        mappedArray.push({...w, tempId : counterWarehouse.current});
                        counterWarehouse.current = counterWarehouse.current + 1;
                    }
                    setWarehouses(prev => mappedArray);
                } else {
                    toast.current != null ? toast.current.show({ severity: 'error', summary: 'Error', detail: "Warehouses Fetch Error", life: 3000 }) : "";  
                }
            }).catch(error => {
                toast.current != null ? toast.current.show({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 }) : "";
            });
        }, [])
        useEffect(() => {
            setMappedCompany(prev =>  {
                return [
                    {field : "Name", value : company.name},
                    {field : "Email", value : company.email},
                    {field : "Phone", value : company.phone},
                    {field : "Address", value : company.address},
                    {field : "Warehouses", value : warehouses.length > 0 ? warehouses.map(x => x.name).reduce((x,y) => x + " , " + y) : ""}
                ]
            });
        }, [company, warehouses]);
        /*
        useEffect(() => {
            setMappedWarehouses(prev => {
                return formWarehouses.map(x => ({name: x.name, id: x.id, deletable: x.deletable, tempId : x.tempId}));
            });
        }, [formWarehouses]);
        */
        const handleRemoveWarehouse = (rowData) => {
            setFormWarehouses(prev => {
                let _formWarehouses = [...formWarehouses];
                _formWarehouses = _formWarehouses.filter(w => w.name != rowData.name);
                return _formWarehouses;
            });
        };
        const companyDialogFooter = (
            <React.Fragment>
                <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
                <Button label="Save" icon="pi pi-check" onClick={saveProfilePanel} />
            </React.Fragment>
        );
        const actionBodyTemplate = (rowData) => {
            return (
                <React.Fragment>
                    {rowData.deletable && <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={(e) => handleRemoveWarehouse(rowData)} /> } 
                </React.Fragment>
            );
        };
        const addAuthorizationHeader = (filebeforesend) => {
            filebeforesend.xhr.setRequestHeader('Authorization', 'Bearer ' + appUser.tokenValue);
        };

        const handleUploadError = (e) => {
            toast.current != null ? toast.current.show({ severity: 'error', summary: 'Error', detail: 'File Upload Error', life: 3000 }) :"";
        }

        return (
            <>
            {
            appUser.authorities.has("ADMIN") && 
            <>
            <OverlayPanel ref={op} showCloseIcon>
                    <Toast ref={toast} />
                    <>
                    <DataTable  value={mappedCompany} tableStyle={{ width: '40vw', marginBottom:"3vh" }}>
                        <Column field="field" header="Company Profile"> </Column>
                        <Column field="value"> </Column>
                    </DataTable> 
                    <div className='grid' >
                        <div className='col-3'> </div>
                        <div className='col-6 align-content-center text-center justify-content-center'>
                            <Button label="Manage Company" icon="pi pi-pencil" style={{marginBottom:"1rem"}} onClick={(e) => setProfilePanel(prev => true)} />
                        </div>
                        <div className='col-3'> </div>
                        <div className='col-3 mb-1'> </div>
                        <div className='col-6 text-center align-content-center justify-content-center mb-1'>
                            <CustomImage width={6.5} height={8}></CustomImage>
                        </div>
                        <div className='col-3 mb-1'></div>
                        <div className='col-3'> </div>
                        <div className='col-6 text-center align-content-center justify-content-center'>
                            <FileUpload mode="basic" chooseLabel="Replace Logo (< 1 MB)" onBeforeSend={addAuthorizationHeader} 
                                invalidFileSizeMessageSummary={"Invalid File Size"} invalidFileSizeMessageDetail={"Maximum File Size is 1 MB"} onError={handleUploadError}
                                auto name="file" url={SERVER_PREFIX + "/company/upload"} accept="image/*" maxFileSize={1000000} onUpload={handleUpload}/>
                        </div>
                        <div className='col-3'></div>
                    </div>
                    </>
            
            </OverlayPanel>
            
            <Dialog visible={profilePanel} style={{ width: '75vw' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Company Profile" modal className="p-fluid" footer={companyDialogFooter} onHide={hideDialog}>
            <Toast ref={dialogToast} />
            {saveProfileProgress && <div className='flex align-content-center justify-content-center'><ProgressSpinner></ProgressSpinner></div>}
            {!saveProfileProgress &&
            <div className='card'>
                <div className="field ml-4 mr-4">
                    <label htmlFor="name" className="font-bold">
                    Name*
                    </label>
                    <InputText
                    id="name"
                    value={formCompany.name}
                    onChange={(e) => onInputChange(e, 'name')}
                    required
                    autoFocus
                    className={{ 'p-invalid': (submitted && !formCompany.name) || (submitted && formCompany.name && formCompany.name.length > 256 ) }}
                    />
                    {submitted && !formCompany.name && <small className="p-error">Name is required.</small>}
                    {submitted && formCompany.name && formCompany.name.length > 256 && (
                    <small className="p-error">Name is too long : max 256 char.</small>
                    )}
                </div>
                <div className="field ml-4 mr-4">
                    <label htmlFor="email" className="font-bold">
                    Email
                    </label>
                    <InputText
                    id="email"
                    value={formCompany.email}
                    onChange={(e) => onInputChange(e, 'email')}
                    className={{ 'p-invalid': (submitted && formCompany.email && formCompany.email.length > 256 ) || (submitted && formCompany.email && !emailPattern.test(formCompany.email)) }}
                    />
                    {submitted && formCompany.email && formCompany.email.length > 256 && (
                    <small className="p-error">Email is too long : max 256 char.</small>
                    )}
                    {submitted && formCompany.email && !emailPattern.test(formCompany.email) && (
                    <small className="p-error">Email is invalid.</small>
                    )}
                </div>

                <div className="field ml-4 mr-4">
                    <label htmlFor="phone" className="font-bold">
                    Phone
                    </label>
                    <InputText
                    id="phone"
                    value={formCompany.phone}
                    onChange={(e) => onInputChange(e, 'phone')}
                    className={{ 'p-invalid': (submitted && formCompany.phone && formCompany.phone.length > 30 ) || (submitted && formCompany.phone && !phonePattern.test(formCompany.phone))}}
                    />
                    {submitted && formCompany.phone && formCompany.phone.length > 256 && (
                    <small className="p-error">Phone is too long : max 256 char.</small>
                    )}
                    {submitted && formCompany.phone && !phonePattern.test(formCompany.phone) && (
                    <small className="p-error">Phone is invalid.</small>
                    )}
                </div>
                <div className="field ml-4 mr-4">
                    <label htmlFor="address" className="font-bold">
                    Alamat
                    </label>
                    <InputText
                    id="address"
                    value={formCompany.address}
                    onChange={(e) => onInputChange(e, 'address')}
                    className={{ 'p-invalid': (submitted && formCompany.address && formCompany.address.length > 1000 ) }}
                    />
                    {submitted && formCompany.address && formCompany.address.length > 1000 && (
                    <small className="p-error">Phone is too long : max 1000 char.</small>
                    )}
                </div>
                <div className="field ml-4 mr-4">
                    <DataTable value={formWarehouses} dataKey="tempId" tableStyle={{ width: '35vw' }} >
                        <Column field="name" header="Warehouse Name" > </Column>
                        <Column body={actionBodyTemplate} style={{width:"5rem"}}> </Column>
                    </DataTable> 
                </div>
                <div className="field ml-4 mr-4 col-6">
                    <div className="p-inputgroup">
                        <InputText
                        id="warehouse"
                        value={tempWarehouse.name}
                        placeholder="Enter Warehouse (max.256)"
                        onChange={(e) => onWarehouseChange(e)}
                        className={{ 'p-invalid': (warehouseSubmitted && tempWarehouse.name.length <= 0) || (warehouseSubmitted && tempWarehouse.name.length > 256 ) }}
                        />
                        <Button label="Add Warehouse" icon="pi pi-plus" onClick={handleAddWarehouse}/>
                    </div>
                </div>
                <div className="field ml-4 mr-4 col-6">
                    <span>* Warehouse name should be unique</span>
                </div>



            </div>
            }
            </Dialog>
            </>
            }
            </>
        )
    }