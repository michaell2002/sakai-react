
import React, { useState, useEffect, useRef, useContext} from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import {fetchContactPersons, updateContactPerson} from './api/ContactPersonAPI';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import {Tag} from 'primereact/tag';
import UserContext from '../layout/context/usercontext';
import { useMountEffect } from 'primereact/hooks';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dialog } from 'primereact/dialog';
import { ToggleButton } from 'primereact/togglebutton';
export default function ContactPersonTable() {
  const {appUser} = useContext(UserContext);
  const [selectedFilter, setFilter] = useState({ name: 'All (complete words only)', code: 'all' });
  const filters = [
    { name: 'All (complete words only)', code: 'all' },
    { name: 'Name', code: 'name' },
    { name: 'Email', code: 'email' },
    { name: 'Telephone', code: 'telephoneNumber' },
    { name: 'Mobile Number', code: 'mobilePhoneNumber' },
    { name: 'Status', code: 'status' },
    { name: 'Entity', code: 'entity' }
];
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phonePattern = /^[+\-\d]+$/;
const emptyContactPerson = {
    id : null,
    name : "",
    email : "",
    telephoneNumber : "",
    mobilePhoneNumber :"",
    status : null,
    entity : "",
  }
  const toast = useRef(null);
  const dialogToast = useRef({});
  const saveContactPersonController = useRef(new AbortController());
  const [searchValueToPass, setSearchValueToPass] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [contactPersons, setContactPersons] = useState([]);
  const [selectedContactPersons, setSelectedContactPersons] = useState([]);
  const [contactPersonDialog, setContactPersonDialog] = useState(false);
  const [contactPerson, setContactPerson] = useState({...emptyContactPerson});
  const [editContactPersonProgress, setEditContactPersonProgress] = useState(false);
  const [submitted, setSubmitted] = useState(false);
    const [lazyState, setlazyState] = useState({
        first: 0,
        rows: 10,
        page: 1,
        sortField: null,
        sortOrder: null,
        filters: {
            name: { value: '', matchMode: 'contains' },
            email: { value: '', matchMode: 'contains' },
            telephoneNumber: { value: '', matchMode: 'contains' },
            mobilePhoneNumber: { value: '', matchMode: 'contains' }

        } 
    });

    
    const findIndexById = (id) => {
        let index = -1;

        for (let i = 0; i < contactPersons.length; i++) {
            if (contactPersons[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };



    useEffect(() => {
        if (searchValue == "") {
          setSearchValueToPass(prev => "");
        } 
    }, [searchValue])

    useEffect(() => {
        loadLazyData();
    }, [searchValueToPass, lazyState])

    useEffect(() => {
      if (searchValueToPass != "") {
        loadLazyData();
      }
    }, [selectedFilter])

    const loadLazyData = () => {
        if (appUser.authorities.has("CONTACTPERSONS_READ") || appUser.authorities.has("ADMIN")) {
            setLoading(prev => true);
            fetchContactPersons(lazyState, searchValueToPass, selectedFilter.code, appUser.tokenValue).then((data) => {
                if (data != undefined && data != null) {
                    setTotalRecords(prev => data.totalRecords);
                    setContactPersons(prev => data.contactPersons);
                    console.log(data.contactPersons);
                } else {
                    toast.current != null ? toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to load contact person list', life: 3000 }) : "";
                }
                setLoading(prev => false);
            }).catch(error => {
                toast.current != null ? toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to load contact person list '  + error.message, life: 3000 }) : "";
                setLoading(prev => false);
            });
        } else {
            toast.current != null ? toast.current.show({ severity: 'error', summary: 'Error', detail: "Unauthorized to View All Contact Persons", life: 3000 }) : "";
            setLoading(prev => false);
        }
    };

    const onPage = (event) => {
        setlazyState(e => event);
    };

    const onSort = (event) => {
        setlazyState(e => event);
    };

    const onSelectionChange = (event) => {
        const value = event.value;
        setSelectedContactPersons(old => value);
    };
    const handleEdit = (rd) => {
        const _rd = JSON.parse(JSON.stringify(rd));
        setContactPerson(prev => _rd);
        setSubmitted(prev => false);
        setContactPersonDialog(prev => true);
    };

    const predicate = () => {
        if (contactPerson.name.length < 1 || contactPerson.name.length > 100) {
          return false;
        } else if ((contactPerson.email && contactPerson.email.length > 250) || (contactPerson.email && !emailPattern.test(contactPerson.email))) {
          return false;
        } else if ((contactPerson.mobilePhoneNumber && contactPerson.mobilePhoneNumber.length > 20) || (contactPerson.mobilePhoneNumber && !phonePattern.test(contactPerson.mobilePhoneNumber))) {
          return false;
        } else if ((contactPerson.telephoneNumber && contactPerson.telephoneNumber.length > 20) || (contactPerson.telephoneNumber && !phonePattern.test(contactPerson.telephoneNumber))) {
          return false;
        } 
        return true;
      };

    const saveContactPerson = (e) => {
        setSubmitted(prev => true);
        setEditContactPersonProgress(prev => true);
        if (predicate()) {
            if (contactPerson.id) {
                let _contactPersons = [...contactPersons];
                let _contactPerson = JSON.parse(JSON.stringify(contactPerson));
                updateContactPerson(_contactPerson, saveContactPersonController.current, appUser.tokenValue).then(res => {
                    toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Contact Person Updated', life: 3000 });
                }).catch(error => {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: "Unable to update contact person: " + error.message, life: 3000 });
                }).finally(() =>{
                    resetCP();
                    loadLazyData();
                } );
            } else {
                dialogToast.current?.show({ severity: 'error', summary: 'Error', detail: 'Invalid Details: No Valid Contact Person ID', life: 3000 });
                setEditContactPersonProgress(prev => false);
            }
        } else {
            dialogToast.current?.show({ severity: 'error', summary: 'Error', detail: 'Invalid Details: Recheck Details', life: 3000 });
            setEditContactPersonProgress(prev => false);
        }

    }
    const hideDialog = () => {
        saveContactPersonController.current.abort();
        saveContactPersonController.current = new AbortController();
        resetCP();
      };
    const resetCP = () => {
        setEditContactPersonProgress(prev => false);
        setSubmitted(prev => false);
        setContactPersonDialog(prev => false);
        setContactPerson(prev => ({...emptyContactPerson}));
    }

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _contactPerson = { ...contactPerson };

        _contactPerson[`${name}`] = val;

        setContactPerson((prev) => _contactPerson);
    };
    const contactPersonDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveContactPerson} />
        </React.Fragment>
    );
    const handleToggleButton = (e) => {
        setContactPerson(prev => {
            let _cp = {...prev};
            _cp['status'] = !_cp['status'];
            console.log(_cp);
            return _cp;
        });
    }
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
          // Perform the action you want to execute on Enter key press
          if (searchValue.length < 4 && selectedFilter.code == "all") {
            toast.current.show({ severity: 'warn', summary: 'Info', detail: 'Words <= 3 char. would not activate "All" filter', life: 3000 });
          }
          setSearchValueToPass(prev => searchValue);
        } 

      };
    const renderHeader = () => {

        return ( <>
            {(appUser.authorities.has("CONTACTPERSONS_READ") || appUser.authorities.has("ADMIN")) &&
            <>
            <span className="p-input-icon-left">
                <div className="flex flex-row gap-2">
                    <InputText type="search" value={searchValue} onKeyDown={handleKeyPress} onChange={(e) => setSearchValue(oldS => e.target.value)}  placeholder="Search for Contact Persons" style={{width:"30vw"}} />
                    <Dropdown value={selectedFilter} onChange={(e) => setFilter(prev => e.value)} options={filters} optionLabel="name" 
                        placeholder="Select Filter" className="w-full md:w-14rem" />
                    <Button onClick={e => {
                      setSearchValueToPass(prev => searchValue);
                      if (searchValue.length < 4 && selectedFilter.code == "all") {
                        toast.current.show({ severity: 'warn', summary: 'Info', detail: 'Words <= 3 char. would not activate "All" filter', life: 3000 });
                      }
                    }} icon="pi pi-search" rounded outlined />
                </div>
            </span>
            <span style={{marginLeft:"2rem"}}>*Create Contact Person in Client/Supplier Management</span>
            </>}
            </>
        );
    };
    const statusBodyTemplate = (contactPerson) => {
      return <Tag value={contactPerson.status == true ? "true" : "false"} severity={getSeverity(contactPerson)}></Tag>;
  };
  const getSeverity = (contactPerson) => {
    switch (contactPerson.status) {
        case true:
            return 'success';

        case false:
            return 'danger';

        default:
            return 'info';
    }
};
    return (
        <>
          <div>
                  <Toast ref={toast} />
                  <Toolbar start={renderHeader}></Toolbar>
                  <DataTable value={contactPersons} lazy dataKey="id" paginator /*filters={lazyState.filters}  onFilter={onFilter} filterDisplay="row" selectionMode="multiple" */
                          first={lazyState.first} rows={lazyState.rows} totalRecords={totalRecords} onPage={onPage} removableSort
                          onSort={onSort} sortField={lazyState.sortField} sortOrder={lazyState.sortOrder} rowClassName="" metaKeySelection={false}
                          loading={loading} tableStyle={{ maxWidth: '100vw' }}  showSelectAll={false}
                          selection={selectedContactPersons} onSelectionChange={onSelectionChange} rowsPerPageOptions={[10, 25, 50]}>
                         {(appUser.authorities.has("CONTACTPERSONS_UPDATE") || appUser.authorities.has("ADMIN")) && 
                          <Column
                            field="edit"
                            body={(rowData) => (
                             <div className=" "onClick={() => handleEdit(rowData)}>
                                  <i className="pi pi-id-card" style={{ cursor: 'pointer', fontSize: '1.3rem'}} onClick={() => handleEdit(rowData)} /> 
                             </div>
                            )}
                          />
                          }
                          <Column field="name" header="Name" sortable/>
                          <Column field="entity" header="Entity" sortable/>
                          <Column field="email" header="Email" sortable/>
                          <Column field="telephoneNumber" header="Telephone" sortable/>
                          <Column field="mobilePhoneNumber" header="Mobile Phone" sortable/>
                          <Column field="status" body={statusBodyTemplate} header="Active" sortable/>
                  </DataTable>
            </div>
            <Dialog visible={contactPersonDialog} style={{ width: '40vw' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Edit Contact Person" modal className="p-fluid" footer={contactPersonDialogFooter} onHide={hideDialog}>
                        <Toast ref={dialogToast} />
                        {editContactPersonProgress &&                               
                            <div className='flex align-content-center justify-content-center'>
                                    <ProgressSpinner/>
                            </div>
                        }
                        {!editContactPersonProgress && 
                        <>
                        <div className="field ml-4 mr-4">
                            <label htmlFor="name" className="font-bold">
                            Name*
                            </label>
                            <InputText
                            id="name"
                            value={contactPerson.name}
                            onChange={(e) => onInputChange(e, 'name')}
                            required
                            className={{ 'p-invalid': (submitted && !contactPerson.name) || (submitted && contactPerson.name && contactPerson.name.length > 100 ) }}
                            />
                            {submitted && !contactPerson.name && <small className="p-error">Name is required.</small>}
                            {submitted && contactPerson.name && contactPerson.name.length > 100 && (
                            <small className="p-error">Name is too long: max. 100 char.</small>
                            )}
                        </div>
                        <div className="field ml-4 mr-4">
                            <label htmlFor="telephoneNumber" className="font-bold">
                            Telephone Number
                            </label>
                            <InputText
                            id="telephoneNumber"
                            value={contactPerson.telephoneNumber}
                            onChange={(e) => onInputChange(e, 'telephoneNumber')}
                            required
                            className={{ 'p-invalid': (submitted && contactPerson.telephoneNumber && contactPerson.telephoneNumber.length > 20 ) }}
                            />
                            {submitted && contactPerson.telephoneNumber && contactPerson.telephoneNumber.length > 20 && (
                            <small className="p-error">Telephone Number is too long: max 20 char.</small>
                            )}
                        </div>

                        <div className="field ml-4 mr-4">
                            <label htmlFor="mobilePhoneNumber" className="font-bold">
                            Mobile Phone Number
                            </label>
                            <InputText
                            id="mobilePhoneNumber"
                            value={contactPerson.mobilePhoneNumber}
                            onChange={(e) => onInputChange(e, 'mobilePhoneNumber')}
                            required
                            className={{ 'p-invalid': (submitted && contactPerson.mobilePhoneNumber && contactPerson.mobilePhoneNumber.length > 20 ) }}
                            />
                            {submitted && contactPerson.mobilePhoneNumber && contactPerson.mobilePhoneNumber.length > 20 && (
                            <small className="p-error">Mobile Phone Number is too long: max 20 char.</small>
                            )}
                        </div>
                        
                        <div className="field ml-4 mr-4">
                            <label htmlFor="email" className="font-bold">
                            Email
                            </label>
                            <InputText
                            id="email"
                            value={contactPerson.email}
                            onChange={(e) => onInputChange(e, 'email')}
                            className={{ 'p-invalid': (submitted && contactPerson.email && contactPerson.email.length > 250) || (submitted && contactPerson.email && !emailPattern.test(contactPerson.email))}}
                            />
                            {submitted && contactPerson.email && contactPerson.email.length > 250 && (
                            <small className="p-error">Email is too long: max 250 char.</small>
                            )}
                        {submitted && contactPerson.email && !emailPattern.test(contactPerson.email) && <small className="p-error">Email is invalid.</small>}
                        </div>
                        <div className="field ml-4 mr-4">
                            <label htmlFor="status" className="font-bold">
                                Status
                            </label>        
                            <div className="field align-content-center justify-content-center text-center">                      
                                <ToggleButton onLabel="Active" offLabel="Inactive" checked={contactPerson.status} onChange={(e) => handleToggleButton(e)} className="w-15rem h-3rem" />
                            </div>
                        </div> 
                        <div className="field ml-4 mr-4">
                        <label htmlFor="entity" className="font-bold">
                            Entity Name
                            </label>
                            <InputText
                            id="entity"
                            value={contactPerson.entity}
                            disabled
                            />
                        </div>
                        </>
                        }
                </Dialog>
                </>
    );
}
        