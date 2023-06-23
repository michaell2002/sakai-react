
import React, { useState, useEffect, useRef} from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import {fetchClients, createClient, updateClient, deleteClients} from './CustomerAPI';
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
export default function CustomerTable() {
  const emptyContactPerson = {
    id : null,
    name : "",
    email : "",
    telephoneNumber : "",
    mobilePhoneNumber : "",
    status : true,
    client : null,
    tempId : null
  }
  const [clientType, setClientType] = useState({name : 'CONTRACTOR', code: 'CONTRACTOR'});
  const [selectedProvince, setSelectedProvince] = useState({name : 'Jakarta', code :  'Jakarta'});
  let counterCP = 0;
  const [submitted, setSubmitted] = useState(false);
  const [searching, setSearching] = useState(false);
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
  const toast = useRef(null);
  const [searchValueToPass, setSearchValueToPass] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [addContactPerson, setAddContactPerson] = useState(false); 
  const [selectedCustomers, setSelectedCustomers] = useState([]);
    const provinces = [
      { name: 'Aceh', code: 'Aceh' },
      { name: 'Bali', code: 'Bali' },
      { name: 'Bangka Belitung', code: 'Bangka Belitung' },
      { name: 'Banten', code: 'Banten' },
      { name: 'Bengkulu', code: 'Bengkulu' },
      { name: 'Gorontalo', code: 'Gorontalo' },
      { name: 'Jakarta', code: 'Jakarta' },
      { name: 'Jambi', code: 'Jambi' },
      { name: 'Jawa Barat', code: 'Jawa Barat' },
      { name: 'Jawa Tengah', code: 'Jawa Tengah' },
      { name: 'Jawa Timur', code: 'Jawa Timur' },
      { name: 'Kalimantan Barat', code: 'Kalimantan Barat' },
      { name: 'Kalimantan Selatan', code: 'Kalimantan Selatan' },
      { name: 'Kalimantan Tengah', code: 'Kalimantan Tengah' },
      { name: 'Kalimantan Timur', code: 'Kalimantan Timur' },
      { name: 'Kalimantan Utara', code: 'Kalimantan Utara' },
      { name: 'Kepulauan Riau', code: 'Kepulauan Riau' },
      { name: 'Lampung', code: 'Lampung' },
      { name: 'Maluku', code: 'Maluku' },
      { name: 'Maluku Utara', code: 'Maluku Utara' },
      { name: 'Nusa Tenggara Barat', code: 'Nusa Tenggara Barat' },
      { name: 'Nusa Tenggara Timur', code: 'Nusa Tenggara Timur' },
      { name: 'Papua', code: 'Papua' },
      { name: 'Papua Barat', code: 'Papua Barat' },
      { name: 'Riau', code: 'Riau' },
      { name: 'Sulawesi Barat', code: 'Sulawesi Barat' },
      { name: 'Sulawesi Selatan', code: 'Sulawesi Selatan' },
      { name: 'Sulawesi Tengah', code: 'Sulawesi Tengah' },
      { name: 'Sulawesi Tenggara', code: 'Sulawesi Tenggara' },
      { name: 'Sulawesi Utara', code: 'Sulawesi Utara' },
      { name: 'Sumatera Barat', code: 'Sumatera Barat' },
      { name: 'Sumatera Selatan', code: 'Sumatera Selatan' },
      { name: 'Sumatera Utara', code: 'Sumatera Utara' }
    ];

    const types = [
      {name : 'CONTRACTOR', code: 'CONTRACTOR'},
      {name : 'PLANTATION', code: 'PLANTATION'},
      {name : 'OTHERS', code: 'OTHERS'}
    ]
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
        setSubmitted(prev => false);
        setCustomerDialog(prev => false);
        setSelectedCustomers(prev => []);
    };

    const hideDeletecustomerDialog = () => {
        deleteCustomerDialog(prev => false);
    };

    const hideDeletecustomersDialog = () => {
        setDeleteCustomersDialog(false);
    };
    const predicate = () => {
            if (customer.name.length < 1 || customer.name.length > 256) {
              return false;
            } else if ((customer.email && customer.email.length > 250) || (customer.email && !emailPattern.test(customer.email))) {
              return false;
            } else if ((customer.phone && customer.phone.length > 20) || (customer.phone && !phonePattern.test(customer.phone))) {
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
  
    const savecustomer = () => {
        setSubmitted(prev => true);
        //console.log("PREDICATE" + predicate());
        if (predicate()) {
            let _customers = [...customers];
            let _customer = { ...customer};
            if (customer.id) {
                const index = findIndexById(customer.id);
                updateClient(_customer).then(res => {
                    _customers[index] = _customer;
                    setCustomers(prev => _customers);
                    toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Customer Updated', life: 3000 });
                }).catch(error => {
                  toast.current.show({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
                })
                setSelectedCustomers(prev => []);
                const _emptyCustomer = {...emptyCustomer};
                setCustomer(prev => _emptyCustomer);
            } else {
                 createClient(_customer).then(obj => {
                    _customer.id = obj.id;
                    _customers.push(_customer);
                    setCustomers(prev => _customers);
                  toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Customer Created', life: 3000 });
                 }).catch(error => {
                  toast.current.show({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
                 });
            }
            setCustomerDialog(prev => false);
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
    const onDeleteContactPerson = (idx) =>{
      setCustomer(prev => {
        const _customer = JSON.parse(JSON.stringify(prev));
        _customer.contactPersons.splice(idx, 1);
        return _customer;
      })
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phonePattern = /^[+\-\d]+$/;
    const deleteSelectedCustomers = () => {
        deleteClients(selectedCustomers.map(c => c.id)).then(js => {
          let _customers = customers.filter((val) => !selectedCustomers.includes(val));
          setCustomers(prev => _customers);
          setDeleteCustomersDialog(prev => false);
          setSelectedCustomers(prev => []);
          toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Customers Deleted', life: 3000 });
          loadLazyData();
        }).catch(error => {
          toast.current.show({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
          loadLazyData();
        })
    };
    const customerDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" onClick={savecustomer} />
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
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeletecustomersDialog} />
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
        setLoading(prev => true);
        //console.log(JSON.stringify(lazyState));
        fetchClients(lazyState, searchValueToPass, selectedFilter.code).then((data) => {
            if (data != undefined && data != null) {
                setTotalRecords(prev => data.totalRecords);
                setCustomers(prev => data.customers);
            } else {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
            }
            setLoading(prev => false);
        }).catch(error => {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
        });
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
            toast.current.show({ severity: 'warn', summary: 'Info', detail: 'Words with 3 or less characters would not activate filter', life: 3000 });
          }
          setSearchValueToPass(prev => searchValue);
        } 

      };
      const rightToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-5">
                <Button icon="pi pi-plus" severity="success" rounded onClick={openNew}/>
                <Button icon="pi pi-trash" severity="danger" rounded onClick={confirmDeleteSelected} />
            </div>
        );
    };
      const handleAddPerson = (e) => {
        setCustomer(prev =>  {
          const _customer =  JSON.parse(JSON.stringify(prev));
          const _emptyContactPerson = {...emptyContactPerson};
          _emptyContactPerson.tempId = counterCP;
          counterCP++;
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
    const onInputCPChange = (index, property, value) => {
      setCustomer((prev) => {
        const _customer =  JSON.parse(JSON.stringify(prev));
        _customer.contactPersons[index][property] = value;
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
        mappedArray.push({...c, tempId : counterCP});
        counterCP++;
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

    const handleToggleButton = (e, index, property) => {
      setCustomer((prev) => {
        const _customer =  JSON.parse(JSON.stringify(prev));
        _customer.contactPersons[index]['status'] = e.value;
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
                          <Column
                            field="edit"
                            body={(rowData) => (
                             <div className=" "onClick={() => handleEdit(rowData)}>
                                  <i className="pi pi-id-card" style={{ cursor: 'pointer', fontSize: '1.3rem'}} onClick={() => handleEdit(rowData)} /> 
                             </div>
                            )}
                          />
                          <Column field="clientType" header="Client Type" sortable/>
                          <Column field="groupName" header="Group" sortable />
                          <Column field="name" header="Name" sortable/>
                          <Column field="email" header="Email" sortable/>
                          <Column field="phone" header="Phone" sortable/>
                          <Column field="building" header="Building" sortable/>
                          <Column field="address1" header="Address 1" style={{ minWidth: '20rem' }} sortable/>
                          <Column field="address2" header="Address 2" style={{ minWidth: '20rem' }}sortable />
                          <Column field="neighborhood" header="Kecamatan" sortable/>
                          <Column field="district" header="Kelurahan" sortable />
                          <Column field="regencyCity" header="Kabupaten/Kota" sortable  />
                          <Column field="province" header="Province" sortable  />
                          <Column field="postalCode" header ="Postal Code" sortable/>
                  </DataTable>
      <Dialog visible={customerDialog} style={{ width: '75vw' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Customer" modal className="p-fluid" footer={customerDialogFooter} onHide={hideDialog}>
      
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
          <small className="p-error">Name is too long.</small>
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
          <small className="p-error">Email is too long.</small>
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
          <small className="p-error">Phone is too long.</small>
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
          <small className="p-error">Building is too long.</small>
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
          <small className="p-error">Address 1 is too long.</small>
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
          <small className="p-error">Address 2 is too long.</small>
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
          <small className="p-error">Neighborhood is too long.</small>
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
          <small className="p-error">District is too long.</small>
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
          <small className="p-error">Regency/City is too long.</small>
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
          <small className="p-error">Postal Code is too long.</small>
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
          <small className="p-error">Description is too long.</small>
        )}
      </div>
    </TabPanel>

    <TabPanel header = "Contact Persons">
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
                    <Button icon="pi pi-times" rounded outlined severity="danger" aria-label="Cancel" onClick={(e) => onDeleteContactPerson(index)} />
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
                                onChange={(e) => onInputCPChange(index, 'name', e.target.value)}
                                required
                                className={{ 'p-invalid': (submitted && !cp.name ) || (submitted && cp.name && cp.name.length > 250 )}}
                              />
                              {submitted && !cp.name && <small className="p-error">Name is required.</small>}
                              {submitted && cp.name && cp.name.length > 250 && (
                                <small className="p-error">Name is too long.</small>
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
                            onChange={(e) => onInputCPChange(index, 'email', e.target.value)}
                            className={{ 'p-invalid': (submitted && cp.email && cp.email.length > 250 )}}
                          />
                          {submitted && cp.email && cp.email.length > 250 && (
                            <small className="p-error">Email is too long.</small>
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
                            onChange={(e) => onInputCPChange(index, 'telephoneNumber', e.target.value)}
                            className={{ 'p-invalid': (submitted && cp.telephoneNumber && cp.telephoneNumber.length > 250 )}}
                          />
                          {submitted && cp.telephoneNumber && cp.telephoneNumber.length > 250 && (
                            <small className="p-error">Phone Number is too long.</small>
                          )}
                        </div>
                      </div> 
                      <div className="col-3"></div>
                      <div className="col-3"></div>
                      <div className="col-6">
                        <div className="field">
                          <label htmlFor="mobilePhoneNumber" className="font-bold">
                            Mobile Phone
                          </label>
                          <InputText
                            id="mobilePhoneNumber"
                            value={cp.mobilePhoneNumber}
                            onChange={(e) => onInputCPChange(index, 'mobilePhoneNumber', e.target.value)}
                            className={{ 'p-invalid': (submitted && cp.mobilePhoneNumber && cp.mobilePhoneNumber.length > 250 )}}
                          />
                          {submitted && cp.mobilePhoneNumber && cp.mobilePhoneNumber.length > 250 && (
                            <small className="p-error">Phone Number is too long.</small>
                          )}
                        </div>
                      </div> 
                      <div className="col-3"></div>
                      <div className="col-3"></div>
                      <div className="col-6">
                        <span className="font-bold">Status: </span>
                        <div className="field align-content-center justify-content-center text-center">
                          <ToggleButton onLabel="Active" offLabel="Inactive" checked={cp.status} onChange={(e) => handleToggleButton(e, index)} className="w-15rem h-3rem" />
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

            <Dialog visible={deleteCustomersDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deletecustomersDialogFooter} onHide={hideDeletecustomersDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {customer && <span>Are you sure you want to delete the selected customers?</span>}
                </div>
            </Dialog>
            </div>
    );
}
        