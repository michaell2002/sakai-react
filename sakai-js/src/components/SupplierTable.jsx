
import React, { useState, useEffect, useRef, useContext} from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import {fetchSuppliers, createSupplier, updateSupplier, deleteSuppliers} from './api/SupplierAPI';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import {countries} from './constants/Countries';
import { TabView, TabPanel } from 'primereact/tabview';
import {ToggleButton} from 'primereact/togglebutton';
import UserContext from '../layout/context/usercontext';
import { ProgressSpinner } from 'primereact/progressspinner';

export default function SupplierTable() {
  const emptyContactPerson = {
    id : null,
    name : "",
    email : "",
    telephoneNumber : "",
    mobilePhoneNumber :"",
    status : true,
    client : null,
    tempId : null
  }
  const emptyBrand = {
    id : null,
    name : "",
    deletable : true,
    tempId : null
  }
  const counterSupplier = useRef(0);
  const {appUser} = useContext(UserContext);
  const [selectedCountry, setSelectedCountry] = useState( { name: 'Singapore', code: 'Singapore' });
  const [selectedFilter, setFilter] = useState({ name: 'All (complete words only)', code: 'all' });
  const filters = [
    { name: 'All (complete words only)', code: 'all' },
    { name: 'Name', code: 'name ' },
    { name: 'Email', code: 'email' },
    { name: 'Telephone', code: 'telephone' },
    { name: 'Origin Country', code: 'originCountry' }
];
/*
  const [tempBrand, setTempBrand] = useState({...emptyBrand});
  const [brandSubmitted, setBrandSubmitted] = useState(false);
*/
  const [submitted, setSubmitted] = useState(false);
  const [searching, setSearching] = useState(false);
  const saveSupplierController = useRef(new AbortController())
  const deleteSuppliersController = useRef(new AbortController());
  const emptySupplier = {
    id : null,
    name: "",
    email: "",
    telephone: "",
    originCountry: selectedCountry.name,
    description: "",
    contactPersons : [],
    //brands : []
};
  const toast = useRef({});
  const dialogToast = useRef({});
  const [deleteProgress, setDeleteProgress] = useState(false);
  const [editOrCreateProgress, setEditOrCreateProgress] = useState(false);
  const [supplier, setSupplier] = useState({...emptySupplier});
  const [searchValueToPass, setSearchValueToPass] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [suppliers, setSuppliers] = useState([]);
  const [addContactPerson, setAddContactPerson] = useState(false); 
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
        const [lazyState, setlazyState] = useState({
            first: 0,
            rows: 10,
            page: 1,
            sortField: null,
            sortOrder: null,
            filters: {
                name: { value: '', matchMode: 'contains' },
            } 
        });
    const [supplierDialog, setSupplierDialog] = useState(false);
    const [deleteSupplierDialog, setDeleteSupplierDialog] = useState(false);
    const [deleteSuppliersDialog, setDeleteSuppliersDialog] = useState(false);
    const openNew = () => {
        const _emptySupplier = {...emptySupplier};
        setSupplier(prev => _emptySupplier);
        setSubmitted(prev => false);
        setSupplierDialog(prev => true);
    };


    const hideDialog = () => {
      saveSupplierController.current.abort();
      saveSupplierController.current = new AbortController();
      setEditOrCreateProgress(prev => false);
      setSubmitted(prev => false);
      setSupplierDialog(prev => false);
      setSelectedSuppliers(prev => []);
    };

    const hideDeletesupplierDialog = () => { 
        deleteSupplierDialog(prev => false);
    };

    const hideDeletesuppliersDialog = () => {
      deleteSuppliersController.current.abort();
      deleteSuppliersController.current = new AbortController();

      setDeleteProgress(prev => false);
      setDeleteSuppliersDialog(false);
    };
    const predicate = () => {
            if (supplier.name.length < 1 || supplier.name.length > 256) {
              return false;
            } else if ((supplier.email && supplier.email.length > 250) || (supplier.email && !emailPattern.test(supplier.email))) {
              return false;
            } else if ((submitted && supplier.telephone && supplier.telephone.length > 20) || submitted && supplier.telephone && !phonePattern.test(supplier.telephone)) {
              return false;
            } else if ((supplier.contactPersons.filter(cp => cp.name.length < 1).length > 0)) {
              return false;
            }
            return true;
          };
    const handleChangeCountry = (e) => {
      setSelectedCountry(prev => e.target.value);
      const _country = (e.target) ? e.target.value.name : '';
      const _supplier = JSON.parse(JSON.stringify(supplier));
      _supplier.originCountry = _country;
      setSupplier(prev => _supplier);
    }
    const updateSupplierReset = () => {
      setEditOrCreateProgress(prev => false);
      setSupplierDialog(prev => false);
      setSelectedSuppliers(prev => []);
      const _emptySupplier = {...emptySupplier};
      setSupplier(prev => _emptySupplier);
      loadLazyData();
    }
    const saveSupplier = () => {
        setSubmitted(prev => true);
        setEditOrCreateProgress(prev => true);
        if (predicate()) {
            let _suppliers = [...suppliers];
            let _supplier = JSON.parse(JSON.stringify(supplier));
            if (supplier.id) {
                const index = findIndexById(supplier.id);
                updateSupplier(_supplier, saveSupplierController.current, appUser.tokenValue).then(res => {
                    toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Supplier Updated', life: 3000 });
                }).catch(error => {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: "Unable to update supplier: " + error.message, life: 3000 });
                }).finally(() => updateSupplierReset());
            } else {
                createSupplier(_supplier, saveSupplierController.current, appUser.tokenValue).then(obj => {
                  toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Supplier Created', life: 3000 });
                }).catch(error => {
                  toast.current.show({ severity: 'error', summary: 'Error', detail: "Unable to create supplier: " + error.message, life: 3000 });
                }).finally(() => {
                  setEditOrCreateProgress(prev => false);
                  setSupplierDialog(prev => false);
                  loadLazyData();
                });
            }
        } else {
          dialogToast.current?.show({ severity: 'error', summary: 'Error', detail: 'Invalid Details: Recheck Details, Contact Persons, and Brands List', life: 3000 });
          setEditOrCreateProgress(prev => false);
        }
    };

    
    const confirmDeletesupplier = (supplier) => {
        setSupplier(prev => supplier);
        deleteSupplierDialog(prev =>  true);
    };
    const onFilter = (event) => {
        event['first'] = 0;
        setlazyState(event);
    };
    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _supplier = { ...supplier };

        _supplier[`${name}`] = val;

        setSupplier((prev) => _supplier);
    };

    const deletesupplier = () => {
        let _suppliers = suppliers.filter((val) => val.id !== supplier.id);
        setSuppliers(prev => _suppliers);
        setSelectedSuppliers(prev => []);
        deleteSupplierDialog(prev => false);
        toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Supplier Deleted', life: 3000 });
    };
    const findIndexById = (id) => {
        let index = -1;

        for (let i = 0; i < suppliers.length; i++) {
            if (suppliers[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };
    const confirmDeleteSelected = () => {
        setDeleteSuppliersDialog(prev => true);
    };
    const onDeleteContactPerson = (tempId) =>{
      setSupplier(prev => {
                  const _supplier = JSON.parse(JSON.stringify(prev));
                  _supplier.contactPersons = _supplier.contactPersons.filter(cp => {
                    if (cp.tempId != tempId) {
                      return true;
                    }
                    return false;
                  })
                  return _supplier;
                });
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phonePattern = /^[+\-\d]+$/;
    const deleteSelectedSuppliers = () => {
        setDeleteProgress(prev => true);
        deleteSuppliers(selectedSuppliers.map(c => c.id), deleteSuppliersController.current, appUser.tokenValue).then(js => {
          console.log(js)
          let _suppliers = suppliers.filter((val) => !selectedSuppliers.includes(val));
          setSuppliers(prev => _suppliers);
          if (js.deletedAll) {
            toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Suppliers Deleted', life: 3000 });
          } else {
            toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'Supplier(s) with associated documents cannot be deleted', life: 3000 });
          }
        }).catch(error => {
          toast.current.show({ severity: 'error', summary: 'Error', detail: "Failed to delete suppliers " + error.message, life: 3000 });
        }).finally(() => {
          setDeleteProgress(prev => false);
          setDeleteSuppliersDialog(prev => false);
          setSelectedSuppliers(prev => []);
          loadLazyData();
        })
    };
    const supplierDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveSupplier} />
        </React.Fragment>
    );
    const deletesupplierDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeletesupplierDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deletesupplier} />
        </React.Fragment>
    );
    const deletesuppliersDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeletesuppliersDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteSelectedSuppliers} />
        </React.Fragment>
    );
    useEffect(() => {
      if (supplier.contactPersons != undefined && supplier.contactPersons.length > 0) {
        setAddContactPerson(prev => true);
      }
   }, [supplier])

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
      if (appUser.authorities.has("SUPPLIERS_READ") || appUser.authorities.has("ADMIN")) {
          setLoading(prev => true);
          fetchSuppliers(lazyState, searchValueToPass, selectedFilter.code, appUser.tokenValue).then((data) => {
              if (data != undefined && data != null) {  
                  setTotalRecords(prev => data.totalRecords);
                  setSuppliers(prev => data.suppliers);
              } else {
                toast.current != null ? toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to load suppliers', life: 3000 }) : "";
              }
              setLoading(prev => false);
          }).catch(error => {
            toast.current != null ? toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to load suppliers', life: 3000 }) : "";
            setLoading(prev => false);
          });
        } else {
            toast.current != null ? toast.current.show({ severity: 'error', summary: 'Error', detail: 'Unauthorized to READ suppliers', life: 3000 }) : "";       
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
        setSelectedSuppliers(old => value);
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
                {(appUser.authorities.has("SUPPLIERS_CREATE") || appUser.authorities.has("ADMIN"))&& <Button icon="pi pi-plus" severity="success" rounded onClick={openNew}/> }
                {(appUser.authorities.has("SUPPLIERS_DELETE") || appUser.authorities.has("ADMIN")) && <Button icon="pi pi-trash" severity="danger" rounded onClick={confirmDeleteSelected} /> }
            </div>
        );
    };
      const handleAddPerson = (e) => {
        setSupplier(prev =>  {
          const _supplier = JSON.parse(JSON.stringify(prev));
          _supplier.contactPersons = _supplier.contactPersons.concat({...emptyContactPerson, tempId : counterSupplier.current});
          counterSupplier.current = counterSupplier.current + 1;;
          console.log(_supplier);
          return _supplier;
        });
        //WORK ON THIS, the async behavior
      }
      /*
      const handleRemoveBrand = (rowData) => {
        const _supplier = JSON.parse(JSON.stringify(supplier));
        setSupplier(prev => {
            _supplier.brands = _supplier.brands.filter(b => b.name.toLowerCase() != rowData.name.toLowerCase());
            return _supplier;
        });
    };
    */
    const renderHeader = () => {

        return ( <>
        {(appUser.authorities.has("SUPPLIERS_READ") || appUser.authorities.has("ADMIN")) &&
            <span className="p-input-icon-left">
                <div className="flex flex-row gap-2">
                    <InputText type="search" value={searchValue} onKeyPress={handleKeyPress} onChange={(e) => setSearchValue(oldS => e.target.value)}  placeholder="Search for Suppliers" style={{width:"30vw"}} />
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
         }
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
      return (
          <React.Fragment>
              {rowData.deletable && <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={(e) => handleRemoveBrand(rowData)} /> } 
          </React.Fragment>
      );
  };
  const onBrandChange = (e) => {
    const val = (e.target && e.target.value) || '';
    const _tempBrand = {...tempBrand};
    _tempBrand.name = val;
    setTempBrand((prev) => _tempBrand);
};
const handleToggleButton = (e, tId) => {
  setSupplier((prev) => {
    const _supplier =  JSON.parse(JSON.stringify(prev));
    console.log("B4")
    _supplier.contactPersons = _supplier.contactPersons.map(cp => {
                                                                if (cp.tempId == tId) {
                                                                  cp['status'] = !cp['status'];
                                                                }
                                                                return cp;   
                                                            });
    return _supplier;
  });
  console.log("After")
}
    const onInputCPChange = (tempId, property, value) => {
      setSupplier((prev) => {
        const _supplier = JSON.parse(JSON.stringify(prev));
        _supplier.contactPersons = _supplier.contactPersons.map(cp => {
                                        if (cp.tempId == tempId) {
                                          cp[`${property}`] = value;
                                        }
                                        return cp;   
                                    });
        return _supplier;
      });
    };
    const handleEdit = (rd) => {
      const _rd = JSON.parse(JSON.stringify(rd));

      const mappedArrayCP = [];
      for (const r of _rd.contactPersons) {
        mappedArrayCP.push({...r, tempId : counterSupplier.current});
        counterSupplier.current = counterSupplier.current + 1;
      }
      _rd.contactPersons = mappedArrayCP;

      /*
      const mappedArrayBrands = [];
      for (const r of _rd.brands) {
        mappedArrayBrands.push({...r, tempId : counterBrand});
        counterBrand++;
      }
      _rd.brands = mappedArrayBrands;
      */
      setSupplier(prev => _rd);
      setSelectedSuppliers(prev => []);
      for (const country of countries) {
        if (country.name == _rd.originCountry) {
          setSelectedCountry(prev => country);
        }
      }
      
      setSubmitted(prev => false);
      setAddContactPerson(prev => rd.contactPersons.length > 0 ? true : false);
      setSupplierDialog(prev => true);
    };
    /*
    const handleAddBrand = (e) => {
      setBrandSubmitted(prev => true);
      if (tempBrand.name.trim().length > 0 && tempBrand.name.trim().length < 256 && supplier.brands.filter(b => b.name.toLowerCase() == tempBrand.name.trim().toLowerCase()).length == 0) {
          let _supplier = JSON.parse(JSON.stringify(supplier));
          let _tempBrand = {...tempBrand};
          
          _tempBrand.name = _tempBrand.name.trim();
          _tempBrand.tempId = counterBrand;
          counterBrand++;
          _supplier.brands.push(_tempBrand);
          setSupplier(prev => _supplier);

          const _emptyBrand = {...emptyBrand};
          setTempBrand(prev => _emptyBrand);
          setBrandSubmitted(prev => false);
      } else {
          dialogToast.current.show({ severity: 'error', summary: 'Error', detail: 'Invalid Brand Name (Valid: 0 - 256 char. and unique)', life: 3000 });
      }
  }; */
    return (
        <div>
                  <Toast ref={toast} />
                  <Toolbar start={renderHeader} end={rightToolbarTemplate}></Toolbar>
                  <DataTable value={suppliers} lazy dataKey="id" paginator /*filters={lazyState.filters}  onFilter={onFilter} filterDisplay="row"*/
                          first={lazyState.first} rows={lazyState.rows} totalRecords={totalRecords} onPage={onPage} removableSort
                          onSort={onSort} sortField={lazyState.sortField} sortOrder={lazyState.sortOrder} rowClassName="" metaKeySelection={false}
                          loading={loading} tableStyle={{ maxWidth: '100vw' }} selectionMode="multiple"  showSelectAll={false}
                          selection={selectedSuppliers} onSelectionChange={onSelectionChange} rowsPerPageOptions={[10, 25, 50]}>
                            {(appUser.authorities.has("SUPPLIERS_UPDATE") || appUser.authorities.has("ADMIN")) && 
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
                          <Column field="email" header="Email" sortable/>
                          <Column field="telephone" header="Telephone" sortable/>
                          <Column field="originCountry" header="Origin Country" sortable/>

                  </DataTable>
  <Dialog visible={supplierDialog} style={{ width: '75vw' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Supplier" modal className="p-fluid" footer={supplierDialogFooter} onHide={hideDialog}>
  <Toast ref={dialogToast} />
  {editOrCreateProgress &&  
    <div className='flex align-content-center justify-content-center'>
            <ProgressSpinner />
    </div>
  }
  {!editOrCreateProgress &&
      <TabView>
        <TabPanel header="Details">
        <div className="field ml-4 mr-4">
            <label htmlFor="name" className="font-bold">
              Name*
            </label>
            <InputText
              id="name"
              value={supplier.name}
              onChange={(e) => onInputChange(e, 'name')}
              required
              autoFocus
              className={{ 'p-invalid': (submitted && !supplier.name) || (submitted && supplier.name && supplier.name.length > 256 ) }}
            />
            {submitted && !supplier.name && <small className="p-error">Name is required.</small>}
            {submitted && supplier.name && supplier.name.length > 256 && (
              <small className="p-error">Name is too long : max 256 char.</small>
            )}
          </div>
        
          <div className="field ml-4 mr-4">
            <label htmlFor="email" className="font-bold">
              Email
            </label>
            <InputText
              id="email"
              value={supplier.email}
              onChange={(e) => onInputChange(e, 'email')}
              className={{ 'p-invalid': (submitted && supplier.email && supplier.email.length > 250) || (submitted && supplier.email && !emailPattern.test(supplier.email))}}
            />
            {submitted && supplier.email && supplier.email.length > 250 && (
              <small className="p-error">Email is too long : max 250 char.</small>
            )}
          {submitted && supplier.email && !emailPattern.test(supplier.email) && <small className="p-error">Email is invalid.</small>}
          </div>

          <div className="field ml-4 mr-4">
            <label htmlFor="telephone" className="font-bold">
              Phone
            </label>
            <InputText
              id="telephone"
              value={supplier.telephone}
              onChange={(e) => onInputChange(e, 'telephone')}
              className={{ 'p-invalid':(submitted && supplier.telephone && supplier.telephone.length > 20) || submitted && supplier.telephone && !phonePattern.test(supplier.telephone)}}
            />
            {submitted && supplier.telephone && supplier.telephone.length > 20 && (
              <small className="p-error">Phone is too long : max 20 char.</small>
            )}
            {submitted && supplier.telephone && !phonePattern.test(supplier.telephone) && <small className="p-error">Phone is invalid.</small>}
          </div>

          <div className="field ml-4 mr-4">
            <label htmlFor="country" className="font-bold">
              Origin Country
            </label>
            <Dropdown value={selectedCountry} onChange={handleChangeCountry} options={countries} optionLabel="name" 
                    placeholder="Choose Origin" className="w-full md:w-14rem" />
          </div>

          <div className="field ml-4 mr-4">
            <label htmlFor="description" className="font-bold">
              Description
            </label>
            <InputTextarea
              id="description"
              value={supplier.description}
              onChange={(e) => onInputChange(e, 'description')}
              className={{ 'p-invalid': (submitted && supplier.description && supplier.description.length > 1000 )}}
              rows={5} cols={30}
            />
            {submitted && supplier.description && supplier.description.length > 1000 && (
              <small className="p-error">Description is too long : max 1000 char.</small>
            )}
          </div>
        </TabPanel>
        <TabPanel header="Contact Persons">
            {addContactPerson && 
                supplier.contactPersons.map((cp, index) => {
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
        {/*
        <TabPanel header="Brands List">
              <DataTable value={supplier.brands} dataKey="tempId" tableStyle={{ width: '35vw' }}>
                  <Column field="name" header="Brand Name"> </Column>
                  <Column body={actionBodyTemplate} style={{width:"5rem"}}> </Column>
              </DataTable> 
              <div className="col-6">
                        <div className="p-inputgroup">
                            <InputText
                            id="brand"
                            value={tempBrand.name}
                            placeholder="Enter Brand (max.256)"
                            onChange={(e) => onBrandChange(e)}
                            className={{ 'p-invalid': (brandSubmitted && tempBrand.name.length <= 0) || (brandSubmitted && tempBrand.name.length > 256 ) }}
                            />
                            <Button label="Add Brand" icon="pi pi-plus" onClick={handleAddBrand}/>
                        </div>
                    </div>
      </TabPanel> */}
    </TabView>
    }
</Dialog>


            <Dialog visible={deleteSuppliersDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deletesuppliersDialogFooter} onHide={hideDeletesuppliersDialog}>
                <div className="confirmation-content flex align-content-center justify-content-center">
                  {deleteProgress && <ProgressSpinner/>}
                  {!deleteProgress && 
                    <>
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {supplier && <span>Are you sure you want to delete the selected suppliers?</span>}
                    </>
                  }
                </div>
            </Dialog>
            </div>
    );
}
        