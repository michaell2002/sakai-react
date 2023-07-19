
import React, { useState, useEffect, useRef, useContext} from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import {fetchClients, createClient, updateClient, deleteClients} from './api/CustomerAPI';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import {Divider} from 'primereact/divider';
import { InputTextarea } from 'primereact/inputtextarea';
import { RadioButton } from 'primereact/radiobutton';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import {ToggleButton} from 'primereact/togglebutton';
import { types, provinces } from './constants/CustomerConstants';
import UserContext from '../layout/context/usercontext';
import { ProgressSpinner } from 'primereact/progressspinner';
export default function CustomerTable() {
  //Customer == Client in the backend
  const {appUser} = useContext(UserContext);
  const emptyContactPerson = {
    id : null,
    name : "",
    email : "",
    telephoneNumber : "",
    mobilePhoneNumber : "",
    status : true,
    tempId : null
  }
  const [clientType, setClientType] = useState({name : 'CONTRACTOR', code: 'CONTRACTOR'});
  const [selectedProvince, setSelectedProvince] = useState({name : 'Jakarta', code :  'Jakarta'});
  const counterCP = useRef(0);
  const [submitted, setSubmitted] = useState(false);
  const [searching, setSearching] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(false);
  const [saveCustomerProgress, setSaveCustomerProgress] = useState(false);
  const saveCustomerController = useRef(new AbortController());
  const deleteCustomersController = useRef(new AbortController());
  const emptyCustomer = {
    id : null,
    name : "",
    clientType: clientType.name,
    groupName: "",
    name: "",
    email: "",
    phone: "",
    building: "",
    address1: "",
    address2: "",
    neighborhood: "",
    district: "",
    regencyCity: "",
    province: "",
    postalCode: "",
    description : "",
    contactPersons : []
};

  const [customer, setCustomer] = useState({...emptyCustomer});
  const toast = useRef({});
  const dialogToast = useRef({});
  const [searchValueToPass, setSearchValueToPass] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [addContactPerson, setAddContactPerson] = useState(false); 
  const [selectedCustomers, setSelectedCustomers] = useState([]);

    const [selectedFilter, setFilter] = useState({ name: 'All (complete words only)', code: 'all' });
    const filters = [
        { name: 'All (complete words only)', code: 'all' },
        { name: 'Client Type', code: 'clientType' },
        { name: 'Group', code: 'groupName' },
        { name: 'Name', code: 'name' },
        { name: 'Email', code: 'email' },
        { name: 'Phone', code: 'phone' },
        { name: 'Building', code: 'building' },
        { name: 'Address 1', code: 'address1' },
        { name: 'Address 2', code: 'address2' },
        { name: 'Kecamatan', code: 'neighborhood' },
        { name: 'Kelurahan', code: 'district' },
        { name: 'Kabupaten/Kota ', code: 'regencyCity' },
        { name: 'Province', code: 'province' },
        { name: 'Postal Code', code: 'postalCode' }
    ];

        const [lazyState, setlazyState] = useState({
            first: 0,
            rows: 10,
            page: 1,
            sortField: null,
            sortOrder: null,
            filters: {
                clientType: { value: '', matchMode: 'contains' },
                groupName: { value: '', matchMode: 'contains' },
                name: { value: '', matchMode: 'contains' },
                email: { value: '', matchMode: 'contains' },
                phone: { value: '', matchMode: 'contains' },
                building: { value: '', matchMode: 'contains' },
                address1: { value: '', matchMode: 'contains' },
                address2: { value: '', matchMode: 'contains' },
                neighborhood: { value: '', matchMode: 'contains' },
                district: { value: '', matchMode: 'contains' },
                regencyCity: { value: '', matchMode: 'contains' },
                province: { value: '', matchMode: 'contains' },
                postalCode: { value: '', matchMode: 'contains' }
            } 
        });
    const [customerDialog, setCustomerDialog] = useState(false);
    const [deleteCustomerDialog, setDeleteCustomerDialog] = useState(false);
    const [deleteCustomersDialog, setDeleteCustomersDialog] = useState(false);
    const openNew = () => {
        const _emptyCustomer = {...emptyCustomer};
        setCustomer(prev => _emptyCustomer);
        setSubmitted(prev => false);
        setCustomerDialog(prev => true);
    };


    const hideDialog = () => {
        saveCustomerController.current.abort();
        saveCustomerController.current = new AbortController();
        setSaveCustomerProgress(prev => false);
        setSubmitted(prev => false);
        setCustomerDialog(prev => false);
        setSelectedCustomers(prev => []);
    };

    const hideDeletecustomerDialog = () => {
        setDeleteProgress(prev => false);
        deleteCustomerDialog(prev => false);
    };

    const hideDeleteCustomersDialog = () => {
        deleteCustomersController.current.abort();
        deleteCustomersController.current = new AbortController();
        setDeleteCustomersDialog(false);
    };
    const predicate = () => {
            if (customer.name.length < 1 || customer.name.length > 256) {
              return false;
            } else if ((customer.email && customer.email.length > 250) || (customer.email && !emailPattern.test(customer.email))) {
              return false;
            } else if ((customer.phone && customer.phone.length > 20) || (customer.phone && !phonePattern.test(customer.phone))) {
              return false;
            }  else if (customer.groupName && customer.groupName.length > 250) {
              return false;
            } else if (customer.building && customer.building.length > 250) {
              return false;
            } else if (customer.address1 && customer.address1.length > 400) {
              return false;
            } else if (customer.address2 && customer.address2.length > 400) {
              return false;
            } else if (customer.neighborhood && customer.neighborhood.length > 250) {
              return false;
            } else if (customer.district && customer.district.length > 250) {
              return false;
            } else if (customer.regencyCity && customer.regencyCity.length > 250) {
              return false;
            } else if (customer.postalCode && customer.postalCode.length > 250) {
              return false;
            } else if (customer.contactPersons.filter(cp => cp.name.length < 1).length > 0) {
              return false;
            }
            return true;
          };
    const resetUpdateCustomer = () => {
      setSaveCustomerProgress(prev => false);
      setCustomerDialog(prev => false);
      setSelectedCustomers(prev => []);
      const _emptyCustomer = {...emptyCustomer};
      setCustomer(prev => _emptyCustomer);
      loadLazyData();
    };
    const saveCustomer = () => {
        setSubmitted(prev => true);
        setSaveCustomerProgress(prev => true);
        if (predicate()) { 
            let _customers = [...customers];
            let _customer = JSON.parse(JSON.stringify(customer));
            if (customer.id) {
                const index = findIndexById(customer.id);
                updateClient(_customer, saveCustomerController.current, appUser.tokenValue).then(res => {
                    toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Customer Updated', life: 3000 });
                }).catch(error => {
                    toast.current.show({ severity: 'error', summary: 'Error', detail:  "Unable to update customer: " + error.message, life: 3000 });
                }).finally(() => resetUpdateCustomer());
            } else {
                createClient(_customer, saveCustomerController.current, appUser.tokenValue).then(obj => {
                  toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Customer Created', life: 3000 });
                }).catch(error => {
                  toast.current.show({ severity: 'error', summary: 'Error', detail:  "Unable to create customer: " + error.message, life: 3000 });
                }).finally(() =>  {
                  setCustomerDialog(prev => false);
                  setSaveCustomerProgress(prev => false);
                  loadLazyData();
                });
            }
        } else {
          dialogToast.current?.show({ severity: 'error', summary: 'Error', detail: 'Invalid Details: Recheck Main Details and Contact Persons', life: 3000 });
          setSaveCustomerProgress(prev => false);
        }
    };

    
    const confirmDeletecustomer = (customer) => {
        setCustomer(prev => customer);
        deleteCustomerDialog(prev =>  true);
    };
    const onFilter = (event) => {
        event['first'] = 0;
        setlazyState(event);
    };
    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _customer = { ...customer };

        _customer[`${name}`] = val;

        setCustomer((prev) => _customer);
    };

    const deletecustomer = () => {
        let _customers = customers.filter((val) => val.id !== customer.id);
        setCustomers(prev => _customers);
        setSelectedCustomers(prev => []);
        deleteCustomerDialog(prev => false);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Customer Deleted', life: 3000 });
    };
    const findIndexById = (id) => {
        let index = -1;

        for (let i = 0; i < customers.length; i++) {
            if (customers[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };
    const confirmDeleteSelected = () => {
        setDeleteCustomersDialog(prev => true);
    };
    const onDeleteContactPerson = (tempId) =>{
      setCustomer(prev => {
                  const _customer = JSON.parse(JSON.stringify(prev));
                  _customer.contactPersons = _customer.contactPersons.filter(cp => {
                    if (cp.tempId != tempId) {
                      return true;
                    }
                    return false;
                  })
                  return _customer;
                });
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phonePattern = /^[+\-\d]+$/;
    const deleteSelectedCustomers = () => {
          setDeleteProgress(prev => true);
          deleteClients(selectedCustomers.map(c => c.id), deleteCustomersController.current, appUser.tokenValue).then(js => {
            let _customers = customers.filter((val) => !selectedCustomers.includes(val));
            setCustomers(prev => _customers);
            if (js.deletedAll) {
              toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Customers Deleted', life: 3000 });
            } else {
              toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'Customer(s) with associated documents cannot be deleted', life: 3000 });
            }
          }).catch(error => {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
          }).finally(() => {
            setDeleteProgress(prev => false);
            setDeleteCustomersDialog(prev => false);
            setSelectedCustomers(prev => []);
            loadLazyData();
          });

    };
    const customerDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveCustomer} />
        </React.Fragment>
    );
    const deletecustomerDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeletecustomerDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deletecustomer} />
        </React.Fragment>
    );
    const deletecustomersDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteCustomersDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteSelectedCustomers} />
        </React.Fragment>
    );
    useEffect(() => {
      if (customer.contactPersons != undefined && customer.contactPersons.length > 0) {
        setAddContactPerson(prev => true);
      }
    }, [customer])

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
    }, [selectedFilter]);
    
    const loadLazyData = () => {
      if ((appUser.authorities.has("CUSTOMERS_READ") || appUser.authorities.has("ADMIN"))) {
          setLoading(prev => true);
          fetchClients(lazyState, searchValueToPass, selectedFilter.code, appUser.tokenValue).then((data) => {
              if (data != undefined && data != null) {
                  setTotalRecords(prev => data.totalRecords);
                  setCustomers(prev => data.customers);
              } else {
                toast.current != null ? toast.current.show({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 }) : "";
              }
              setLoading(prev => false);
          }).catch(error => {
              toast.current != null ? toast.current.show({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 }) : "";
              setLoading(prev => false);
          });
      }  else {
        toast.current != null ? toast.current.show({ severity: 'error', summary: 'Error', detail: "Unauthorized to READ Customers Table", life: 3000 }) : "";
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
        setSelectedCustomers(old => value);
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
          // Perform the action you want to execute on Enter key press
          if (searchValue.length < 4 && selectedFilter.code == "all") {
            toast.current.show({ severity: 'warn', summary: 'Info', detail: 'Words <= 3 char. would not activate "All" filter', life: 3000 });
          }
          setSearchValueToPass(prev => searchValue);
        } 

      };
      const rightToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-5">
                {(appUser.authorities.has("CUSTOMERS_CREATE") || appUser.authorities.has("ADMIN")) && <Button icon="pi pi-plus" severity="success" rounded onClick={openNew}/>}
                {(appUser.authorities.has("CUSTOMERS_DELETE") || appUser.authorities.has("ADMIN")) && <Button icon="pi pi-trash" severity="danger" rounded onClick={confirmDeleteSelected} /> }
            </div>
        );
    };
      const handleAddPerson = (e) => {
        setCustomer(prev =>  {
          const _customer =  JSON.parse(JSON.stringify(prev));
          const _emptyContactPerson = {...emptyContactPerson};
          _emptyContactPerson.tempId = counterCP.current;
          counterCP.current = counterCP.current + 1;
          _customer.contactPersons = _customer.contactPersons.concat({..._emptyContactPerson});
          return _customer;
        });
      }
      const handleFilterChange = (e) => {
        setFilter(prev => e.value);
      };
    const renderHeader = () => {

        return ( <>
            <span className="p-input-icon-left">
                <div className="flex flex-row gap-2">
                    <InputText type="search" value={searchValue} onKeyPress={handleKeyPress} onChange={(e) => setSearchValue(oldS => e.target.value)}  placeholder="Search for Customers" style={{width:"30vw"}} />
                    <Dropdown value={selectedFilter} onChange={handleFilterChange} options={filters} optionLabel="name" 
                        placeholder="Select Filter" className="w-full md:w-14rem" />
                    <Button onClick={e => {
                      setSearchValueToPass(prev => searchValue);
                      if (searchValue.length < 4 && selectedFilter.code == "all") {
                        toast.current.show({ severity: 'warn', summary: 'Info', detail: 'Words with 3 or less characters would not activate filter', life: 3000 });
                      }
                    }} icon="pi pi-search" rounded outlined />
                </div>
            </span>
            </>
        );
    };
    const onInputCPChange = (tId, property, value) => {
      setCustomer((prev) => {
        const _customer = JSON.parse(JSON.stringify(prev));
        _customer.contactPersons = _customer.contactPersons.map(cp => {
                                        if (cp.tempId == tId) {
                                          cp[`${property}`] = value;
                                        }
                                        return cp;   
                                    });
                                    console.log("INPUT CHANGE")
                                    console.log(_customer);
        return _customer;
      });
    };
    const handleClientType = (e) => {
      setClientType(prev => e.target.value);
      const clientType = (e.target) ? e.target.value.name : '';
      const _customer =  JSON.parse(JSON.stringify(prev));
      _customer.clientType = clientType;
      setCustomer(prev => _customer);
    }

    const handleChangeProvince = (e) => {
      setSelectedProvince(prev => e.target.value);
      const _province = (e.target) ? e.target.value.name : '';
      const _customer =  JSON.parse(JSON.stringify(prev));
      _customer.province = _province;
      setCustomer(prev => _customer);
    }
    const handleEdit = (rd) => {
      const _rd = JSON.parse(JSON.stringify(rd));
      const mappedArray = [];
      for (const c of _rd.contactPersons) {
        mappedArray.push({...c, tempId : counterCP.current});
        counterCP.current = counterCP.current + 1;
      }
      _rd.contactPersons = mappedArray;
      setCustomer(prev => _rd);
      setSelectedCustomers(prev => []);
      for (const province of provinces) {
        if (province.name == _rd.province) {
          setSelectedProvince(prev => province);
        }
      }
      setSubmitted(prev => false);
      setAddContactPerson(prev => rd.contactPersons.length > 0 ? true : false);
      setCustomerDialog(prev => true);
    };
    const handleToggleButton = (e, tempId) => {
      setCustomer((prev) => {
        const _customer =  JSON.parse(JSON.stringify(prev));
        _customer.contactPersons = _customer.contactPersons.map(cp => {
                                                                    if (cp.tempId == tempId) {
                                                                      cp['status'] = !cp['status'];
                                                                    }
                                                                    return cp;   
                                                                });
        return _customer;
      });
    }

    /*
    const openUpdate = () => {
      if (selectedCustomers.length == 1) {
        console.log(selectedCustomers[0].contactPersons);
        setCustomer(prev => selectedCustomers[0]);
        setContactPersons(prev => selectedCustomers[0].contactPersons);
        setSubmitted(prev => false);
        setAddContactPerson(prev => selectedCustomers[0].contactPersons.length > 0 ? true : false);
        setCustomerDialog(prev => true);
      } else {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Select One Customer To Update', life: 3000 });
        setSelectedCustomers(prev => []);
      }
  };
  */
    return (
        <div>
              <Toast ref={toast} />
                  <Toolbar start={renderHeader} end={rightToolbarTemplate}></Toolbar>
                  <DataTable value={customers} lazy dataKey="id" paginator /*filters={lazyState.filters}  onFilter={onFilter} filterDisplay="row"*/
                          first={lazyState.first} rows={lazyState.rows} totalRecords={totalRecords} onPage={onPage} removableSort
                          onSort={onSort} sortField={lazyState.sortField} sortOrder={lazyState.sortOrder} rowClassName="" metaKeySelection={false}
                          loading={loading} tableStyle={{ maxWidth: '100vw' }} selectionMode="multiple"  showSelectAll={false}
                          selection={selectedCustomers} onSelectionChange={onSelectionChange} rowsPerPageOptions={[10, 25, 50]}>
                          {(appUser.authorities.has("CUSTOMERS_UPDATE") || appUser.authorities.has("ADMIN")) && 
                          <Column
                            field="edit"
                            body={(rowData) => (
                             <div className=" "onClick={(e) => handleEdit(rowData)}>
                                  <i className="pi pi-id-card" style={{ cursor: 'pointer', fontSize: '1.3rem'}} onClick={(e) => handleEdit(rowData)} /> 
                             </div>
                            )}
                          />
                          }
                          <Column field="clientType" header="Client Type" sortable/>
                          <Column field="groupName" header="Group" sortable />
                          <Column field="name" header="Name" sortable/>
                          <Column field="email" header="Email" sortable/>
                          <Column field="phone" header="Phone" sortable/>
                          <Column field="building" header="Building" sortable/>
                          <Column field="address1" header="Address 1" style={{ minWidth: '20rem' }} sortable/>
                          <Column field="address2" header="Address 2" style={{ minWidth: '20rem' }} sortable />
                          <Column field="neighborhood" header="Kecamatan" sortable/>
                          <Column field="district" header="Kelurahan" sortable />
                          <Column field="regencyCity" header="Kabupaten/Kota" sortable  />
                          <Column field="province" header="Province" sortable  />
                          <Column field="postalCode" header ="Postal Code" sortable/>
                  </DataTable>
<Dialog visible={customerDialog} style={{ width: '75vw' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Customer" modal className="p-fluid" footer={customerDialogFooter} onHide={hideDialog}>
    <Toast ref={dialogToast}></Toast>
    {saveCustomerProgress && 
      <div className='flex align-content-center justify-content-center'>
          <ProgressSpinner></ProgressSpinner>
      </div>
    }
    {!saveCustomerProgress && 
    <TabView>
      <TabPanel header="Main">
      <div className="field ml-4 mr-4">
        <label htmlFor="name" className="font-bold">
          Name*
        </label>
        <InputText
          id="name"
          value={customer.name}
          onChange={(e) => onInputChange(e, 'name')}
          required
          className={{ 'p-invalid': (submitted && !customer.name) || (submitted && customer.name && customer.name.length > 256 ) }}
        />
        {submitted && !customer.name && <small className="p-error">Name is required.</small>}
        {submitted && customer.name && customer.name.length > 256 && (
          <small className="p-error">Name is too long: max 256 char.</small>
        )}
      </div>
      <div className="field ml-4 mr-4">
        <label htmlFor="clientType" className="font-bold">
          Tipe Customer/Client
        </label>
        <Dropdown value={clientType} onChange={handleClientType} options={types} optionLabel="name" 
                placeholder="Pilih Tipe" className="w-full md:w-14rem" />
      </div>
      <div className="field ml-4 mr-4">
        <label htmlFor="groupName" className="font-bold">
          Group Name
        </label>
        <InputText
          id="groupName"
          value={customer.groupName}
          onChange={(e) => onInputChange(e, 'groupName')}
          className={{ 'p-invalid': (submitted && customer.groupName && customer.groupName.length > 250) }}
        />
        {submitted && customer.groupName && customer.groupName.length > 250 && (
          <small className="p-error">Group Name is too long : max 250 char.</small>
        )}
      </div>
      <div className="field ml-4 mr-4">
        <label htmlFor="email" className="font-bold">
          Email
        </label>
        <InputText
          id="email"
          value={customer.email}
          onChange={(e) => onInputChange(e, 'email')}
          className={{ 'p-invalid': (submitted && customer.email && customer.email.length > 250) || (submitted && customer.email && !emailPattern.test(customer.email))}}
        />
        {submitted && customer.email && customer.email.length > 250 && (
          <small className="p-error">Email is too long : max 250 char.</small>
        )}
      {submitted && customer.email && !emailPattern.test(customer.email) && <small className="p-error">Email is invalid.</small>}
      </div>

      <div className="field ml-4 mr-4">
        <label htmlFor="phone" className="font-bold">
          Phone
        </label>
        <InputText
          id="phone"
          value={customer.phone}
          onChange={(e) => onInputChange(e, 'phone')}
          className={{ 'p-invalid':(submitted && customer.phone && customer.phone.length > 20) || submitted && customer.phone && !phonePattern.test(customer.phone)}}
        />
        {submitted && customer.phone && customer.phone.length > 20 && (
          <small className="p-error">Phone is too long : max 20 char.</small>
        )}
        {submitted && customer.phone && !phonePattern.test(customer.phone) && <small className="p-error">Phone is invalid.</small>}

      </div>

      <div className="field ml-4 mr-4">
        <label htmlFor="building" className="font-bold">
          Building
        </label>
        <InputText
          id="building"
          value={customer.building}
          onChange={(e) => onInputChange(e, 'building')}
          className={{ 'p-invalid': (submitted && customer.building && customer.building.length > 250) }}
        />
        {submitted && customer.building && customer.building.length > 250 && (
          <small className="p-error">Building is too long : max 250 char.</small>
        )}
      </div>

      <div className="field ml-4 mr-4">
        <label htmlFor="address1" className="font-bold">
          Address 1
        </label>
        <InputText
          id="address1"
          value={customer.address1}
          onChange={(e) => onInputChange(e, 'address1')}
          className={{ 'p-invalid':(submitted && customer.address1 && customer.address1.length > 400) }}
        />
        {submitted && customer.address1 && customer.address1.length > 400 && (
          <small className="p-error">Address 1 is too long  : max 400 char.</small>
        )}
      </div>

      <div className="field ml-4 mr-4">
        <label htmlFor="address2" className="font-bold">
          Address 2
        </label>
        <InputText
          id="address2"
          value={customer.address2}
          onChange={(e) => onInputChange(e, 'address2')}
          className={{ 'p-invalid': (submitted && customer.address2 && customer.address2.length > 400)}}
        />
        {submitted && customer.address2 && customer.address2.length > 400 && (
          <small className="p-error">Address 2 is too long : max 250 char.</small>
        )}
      </div>

      <div className="field ml-4 mr-4">
        <label htmlFor="neighborhood" className="font-bold">
          Kelurahan
        </label>
        <InputText
          id="neighborhood"
          value={customer.neighborhood}
          onChange={(e) => onInputChange(e, 'neighborhood')}
          className={{ 'p-invalid': (submitted && customer.neighborhood && customer.neighborhood.length > 250) }}
        />
        {submitted && customer.neighborhood && customer.neighborhood.length > 250 && (
          <small className="p-error">Neighborhood is too long : max 250 char.</small>
        )}
      </div>

      <div className="field ml-4 mr-4">
        <label htmlFor="district" className="font-bold">
          Kecamatan
        </label>
        <InputText
          id="district"
          value={customer.district}
          onChange={(e) => onInputChange(e, 'district')}
          className={{ 'p-invalid': ( submitted && customer.district && customer.district.length > 250 ) }}
        />
        {submitted && customer.district && customer.district.length > 250 && (
          <small className="p-error">District is too long : max 250 char. </small>
        )}
      </div>

      <div className="field ml-4 mr-4">
        <label htmlFor="regencyCity" className="font-bold">
          Kota/Kabupaten
        </label>
        <InputText
          id="regencyCity"
          value={customer.regencyCity}
          onChange={(e) => onInputChange(e, 'regencyCity')}
          className={{ 'p-invalid': (submitted && customer.regencyCity && customer.regencyCity.length > 250 )}}
        />
        {submitted && customer.regencyCity && customer.regencyCity.length > 250 && (
          <small className="p-error">Regency/City is too long : max 250 char.</small>
        )}
      </div>

      <div className="field ml-4 mr-4">
        <label htmlFor="province" className="font-bold">
          Province
        </label>
        <Dropdown value={selectedProvince} onChange={handleChangeProvince} options={provinces} optionLabel="name" 
                placeholder="Pilih Provinsi" className="w-full md:w-14rem" />
      </div>

      <div className="field ml-4 mr-4">
        <label htmlFor="postalCode" className="font-bold">
          Postal Code
        </label>
        <InputText
          id="postalCode"
          value={customer.postalCode}
          onChange={(e) => onInputChange(e, 'postalCode')}
          className={{ 'p-invalid': (submitted && customer.postalCode && customer.postalCode.length > 250 )}}
        />
        {submitted && customer.postalCode && customer.postalCode.length > 250 && (
          <small className="p-error">Postal Code is too long : max 250 char.</small>
        )}
      </div>

      <div className="field ml-4 mr-4">
        <label htmlFor="description" className="font-bold">
          Description
        </label>
        <InputTextarea
          id="description"
          value={customer.description}
          onChange={(e) => onInputChange(e, 'description')}
          className={{ 'p-invalid': (submitted && customer.description && customer.description.length > 1000 )}}
          rows={5} cols={30}
        />
        {submitted && customer.description && customer.description.length > 1000 && (
          <small className="p-error">Description is too long : max 1000 char.</small>
        )}
      </div>
    </TabPanel>

    <TabPanel header="Contact Persons">
            {addContactPerson && 
                customer.contactPersons.map((cp, index) => {
                  return  (
                  <div className='card' key={cp.tempId}> 
                    <div className="field grid align-items-center justify-content-center">
                        <div className="col-11 mb-5">
                            <i className="pi pi-user mr-4"></i>
                            <b>Contact Person {index + 1} Data</b>
                        </div>
                        <div className="col-1 mb-5">
                          <Button icon="pi pi-times" rounded outlined severity="danger" aria-label="Cancel" onClick={(e) => onDeleteContactPerson(cp.tempId)} />
                        </div>
                              <div className="col-3"></div>
                              <div className="col-6">
                                    <div className="field">
                                    <label htmlFor="name" className="font-bold">
                                      Name*
                                    </label>
                                    <InputText
                                      id="name"
                                      value={cp.name}
                                      onChange={(e) => onInputCPChange(cp.tempId, 'name', e.target.value)}
                                      required
                                      className={{ 'p-invalid': (submitted && !cp.name ) || (submitted && cp.name && cp.name.length > 250 )}}
                                    />
                                    {submitted && !cp.name && <small className="p-error">Name is required.</small>}
                                    {submitted && cp.name && cp.name.length > 250 && (
                                      <small className="p-error">Name is too long : max 250 char.</small>
                                    )}
                                  </div>
                            </div> 
                            <div className="col-3"></div>
                            <div className="col-3"></div>
                            <div className="col-6">
                              <div className="field">
                                <label htmlFor="email" className="font-bold">
                                  Email
                                </label>
                                <InputText
                                  id="email"
                                  value={cp.email}
                                  onChange={(e) => onInputCPChange(cp.tempId, 'email', e.target.value)}
                                  className={{ 'p-invalid': (submitted && cp.email && cp.email.length > 250 )}}
                                />
                                {submitted && cp.email && cp.email.length > 250 && (
                                  <small className="p-error">Email is too long : max 250 char.</small>
                                )}
                              </div>
                            </div> 
                            <div className="col-3"></div>
                            <div className="col-3"></div>
                            <div className="col-6">
                              <div className="field">
                                <label htmlFor="telephoneNumber" className="font-bold">
                                  Telephone
                                </label>
                                <InputText
                                  id="telephoneNumber"
                                  value={cp.telephoneNumber}
                                  onChange={(e) => onInputCPChange(cp.tempId, 'telephoneNumber', e.target.value)}
                                  className={{ 'p-invalid': (submitted && cp.telephoneNumber && cp.telephoneNumber.length > 250 )}}
                                />
                                {submitted && cp.telephoneNumber && cp.telephoneNumber.length > 250 && (
                                  <small className="p-error">Phone Number is too long : max 250 char.</small>
                                )}
                              </div>
                            </div> 
                            <div className="col-3"></div>
                            <div className="col-3"></div>
                            <div className="col-6">
                              <div className="field">
                                <label htmlFor="mobilePhoneNumber" className="font-bold">
                                  Mobile Number
                                </label>
                                <InputText
                                  id="mobilePhoneNumber"
                                  value={cp.mobilePhoneNumber}
                                  onChange={(e) => onInputCPChange(cp.tempId, 'mobilePhoneNumber', e.target.value)}
                                  className={{ 'p-invalid': (submitted && cp.mobilePhoneNumber && cp.mobilePhoneNumber.length > 250 )}}
                                />
                                {submitted && cp.mobilePhoneNumber && cp.mobilePhoneNumber.length > 250 && (
                                  <small className="p-error">Phone Number is too long : max 250 char.</small>
                                )}
                              </div>
                            </div> 
                            <div className="col-3"></div>
                            <div className="col-3"></div>
                            <div className="col-6">
                              <span className="font-bold">Status: </span>
                              <div className="field align-content-center justify-content-center text-center">
                                <ToggleButton onLabel="Active" offLabel="Inactive" checked={cp.status} onChange={(e) => handleToggleButton(e, cp.tempId)} className="w-15rem h-3rem" />
                              </div>
                            </div> 
                            <div className="col-3"></div>
                    </div>
                  </div>);
                })
        }
        <div className='card'> 
                  <div className="field grid align-items-center justify-content-center">
                      <div className="col-6">
                          <i className="pi pi-user mr-4"></i>
                          <b>Contact Person</b>
                      </div>
                      <div className="col-3">
                          <Button label="Add Contact Person" icon="pi pi-plus" outlined onClick={handleAddPerson} />
                      </div>
                  </div>
          </div> 
        </TabPanel>
    
      </TabView>
}

</Dialog>



            <Dialog visible={deleteCustomerDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deletecustomerDialogFooter} onHide={hideDeletecustomerDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {customer && (
                        <span>
                            Are you sure you want to delete <b>{customer.name}</b>?
                        </span>
                    )}
                </div>
            </Dialog>

            <Dialog visible={deleteCustomersDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deletecustomersDialogFooter} onHide={hideDeleteCustomersDialog}>
                <div className="confirmation-content flex align-content-center justify-content-center">
                  {deleteProgress && <ProgressSpinner></ProgressSpinner>}
                  {!deleteProgress &&
                    <>
                      <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                      {customer && <span>Are you sure you want to delete the selected customers?</span>}
                    </>
                  }
                </div>
            </Dialog>
            </div>
    );
}
        