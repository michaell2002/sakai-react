
import React, { useState, useEffect, useRef, useContext} from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import {fetchProducts, createProduct, updateProduct, deleteProducts} from './api/ProductAPI';
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
export default function ProductTable() {
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
    let counterProduct = 0;
    let counterBrand = 0;
    const {appUser} = useContext(UserContext);
    const [selectedCountry, setSelectedCountry] = useState( { name: 'Singapore', code: 'Singapore' });
    const [selectedFilter, setFilter] = useState({ name: 'All (complete words only)', code: 'all' });
    const [expandedRows, setExpandedRows] = useState([]);
    const filters = [
      { name: 'All (complete words only)', code: 'all' },
      { name: 'Name', code: 'name ' },
      { name: 'Email', code: 'email' },
      { name: 'Telephone', code: 'telephone' },
      { name: 'Origin Country', code: 'originCountry' }
  ];
    const [tempBrand, setTempBrand] = useState({...emptyBrand});
    const [brandSubmitted, setBrandSubmitted] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [searching, setSearching] = useState(false);
    const saveProductController = useRef(new AbortController())
    const deleteProductsController = useRef(new AbortController());
    const emptyProduct = {
      id : null,
      name: "",
      email: "",
      telephone: "",
      originCountry: selectedCountry.name,
      description: "",
      contactPersons : [],
      brands : []
  };
    const toast = useRef({});
    const dialogToast = useRef({});
    const [deleteProgress, setDeleteProgress] = useState(false);
    const [editOrCreateProgress, setEditOrCreateProgress] = useState(false);
    const [product, setProduct] = useState({...emptyProduct});
    const [searchValueToPass, setSearchValueToPass] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [products, setProducts] = useState([]);
    const [addContactPerson, setAddContactPerson] = useState(false); 
    const [selectedProducts, setSelectedProducts] = useState([]);
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
      const [productDialog, setProductDialog] = useState(false);
      const [deleteProductDialog, setDeleteProductDialog] = useState(false);
      const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
      const openNew = () => {
          const _emptyProduct = {...emptyProduct};
          setProduct(prev => _emptyProduct);
          setSubmitted(prev => false);
          setProductDialog(prev => true);
      };
  
  
      const hideDialog = () => {
        saveProductController.current.abort();
        saveProductController.current = new AbortController();
        setEditOrCreateProgress(prev => false);
        setSubmitted(prev => false);
        setProductDialog(prev => false);
        setSelectedProducts(prev => []);
      };
  
      const hideDeleteproductDialog = () => { 
          deleteProductDialog(prev => false);
      };
  
      const hideDeleteproductsDialog = () => {
        deleteProductsController.current.abort();
        deleteProductsController.current = new AbortController();
  
        setDeleteProgress(prev => false);
        setDeleteProductsDialog(false);
      };
      const predicate = () => {
              if (product.name.length < 1 || product.name.length > 256) {
                return false;
              } else if ((product.email && product.email.length > 250) || (product.email && !emailPattern.test(product.email))) {
                return false;
              } else if ((submitted && product.telephone && product.telephone.length > 20) || submitted && product.telephone && !phonePattern.test(product.telephone)) {
                return false;
              } else if ((product.contactPersons.filter(cp => cp.name.length < 1).length > 0)) {
                return false;
              }
              return true;
            };
      const handleChangeCountry = (e) => {
        setSelectedCountry(prev => e.target.value);
        const _country = (e.target) ? e.target.value.name : '';
        const _product = JSON.parse(JSON.stringify(product));
        _product.originCountry = _country;
        setProduct(prev => _product);
      }
      const updateProductReset = () => {
        setEditOrCreateProgress(prev => false);
        setProductDialog(prev => false);
        setSelectedProducts(prev => []);
        const _emptyProduct = {...emptyProduct};
        setProduct(prev => _emptyProduct);
        loadLazyData();
      }
      const saveProduct = () => {
          setSubmitted(prev => true);
          setEditOrCreateProgress(prev => true);
          if (predicate()) {
              let _products = [...products];
              let _product = JSON.parse(JSON.stringify(product));
              if (product.id) {
                  const index = findIndexById(product.id);
                  updateProduct(_product, saveProductController.current, appUser.tokenValue).then(res => {
                      toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
                  }).catch(error => {
                      toast.current.show({ severity: 'error', summary: 'Error', detail: "Unable to update product: " + error.message, life: 3000 });
                  }).finally(() => updateProductReset());
              } else {
                  createProduct(_product, saveProductController.current, appUser.tokenValue).then(obj => {
                    toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
                  }).catch(error => {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: "Unable to create product: " + error.message, life: 3000 });
                  }).finally(() => {
                    setEditOrCreateProgress(prev => false);
                    setProductDialog(prev => false);
                    loadLazyData();
                  });
              }
          } else {
            setEditOrCreateProgress(prev => false);
          }
      };
  
      
      const confirmDeleteproduct = (product) => {
          setProduct(prev => product);
          deleteProductDialog(prev =>  true);
      };
      const onFilter = (event) => {
          event['first'] = 0;
          setlazyState(event);
      };
      const onInputChange = (e, name) => {
          const val = (e.target && e.target.value) || '';
          let _product = { ...product };
  
          _product[`${name}`] = val;
  
          setProduct((prev) => _product);
      };
  
      const deleteproduct = () => {
          let _products = products.filter((val) => val.id !== product.id);
          setProducts(prev => _products);
          setSelectedProducts(prev => []);
          deleteProductDialog(prev => false);
          toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
      };
      const findIndexById = (id) => {
          let index = -1;
  
          for (let i = 0; i < products.length; i++) {
              if (products[i].id === id) {
                  index = i;
                  break;
              }
          }
  
          return index;
      };
      const confirmDeleteSelected = () => {
          setDeleteProductsDialog(prev => true);
      };
      const onDeleteContactPerson = (idx) =>{
        setProduct(prev => {
          const _product = JSON.parse(JSON.stringify(prev));
          _product.contactPersons.splice(idx, 1);
          return _product;
        })
      }
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const phonePattern = /^[+\-\d]+$/;
      const deleteSelectedProducts = () => {
          setDeleteProgress(prev => true);
          deleteProducts(selectedProducts.map(c => c.id), deleteProductsController.current, appUser.tokenValue).then(js => {
            let _products = products.filter((val) => !selectedProducts.includes(val));
            setProducts(prev => _products);
            toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
          }).catch(error => {
            toast.current.show({ severity: 'error', summary: 'Error', detail: "Failed to delete products", life: 3000 });
          }).finally(() => {
            setDeleteProgress(prev => false);
            setDeleteProductsDialog(prev => false);
            setSelectedProducts(prev => []);
            loadLazyData();
          })
      };
      const productDialogFooter = (
          <React.Fragment>
              <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
              <Button label="Save" icon="pi pi-check" onClick={saveProduct} />
          </React.Fragment>
      );
      const deleteproductDialogFooter = (
          <React.Fragment>
              <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteproductDialog} />
              <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteproduct} />
          </React.Fragment>
      );
      const deleteproductsDialogFooter = (
          <React.Fragment>
              <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteproductsDialog} />
              <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteSelectedProducts} />
          </React.Fragment>
      );
      useEffect(() => {
        if (product.contactPersons != undefined && product.contactPersons.length > 0) {
          setAddContactPerson(prev => true);
        }
     }, [product])
  
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
        if (appUser.authorities.has("PRODUCTS_READ") || appUser.authorities.has("ADMIN")) {
            setLoading(prev => true);
            fetchProducts(lazyState, searchValueToPass, selectedFilter.code, appUser.tokenValue).then((data) => {
                if (data != undefined && data != null) {
                    setTotalRecords(prev => data.totalRecords);
                    setProducts(prev => data.products);
                } else {
                  toast.current != null ? toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to load products', life: 3000 }) : "";
                }
                setLoading(prev => false);
            }).catch(error => {
              toast.current != null ? toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to load products', life: 3000 }) : "";
              setLoading(prev => false);
            });
          } else {
              toast.current != null ? toast.current.show({ severity: 'error', summary: 'Error', detail: 'Unauthorized to READ products', life: 3000 }) : "";       
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
          setSelectedProducts(old => value);
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
                  {(appUser.authorities.has("PRODUCTS_CREATE") || appUser.authorities.has("ADMIN"))&& <Button icon="pi pi-plus" severity="success" rounded onClick={openNew}/> }
                  {(appUser.authorities.has("PRODUCTS_DELETE") || appUser.authorities.has("ADMIN")) && <Button icon="pi pi-trash" severity="danger" rounded onClick={confirmDeleteSelected} /> }
              </div>
          );
      };
        const handleAddPerson = (e) => {
          setProduct(prev =>  {
            const _product = JSON.parse(JSON.stringify(prev));
            _product.contactPersons = _product.contactPersons.concat({...emptyContactPerson, tempId : counterProduct});
            counterProduct++;
            return _product;
          });
        }
        const handleRemoveBrand = (rowData) => {
          const _product = JSON.parse(JSON.stringify(product));
          setProduct(prev => {
              _product.brands = _product.brands.filter(b => b.name.toLowerCase() != rowData.name.toLowerCase());
              return _product;
          });
      };
      const renderHeader = () => {
  
          return ( <>
          {(appUser.authorities.has("PRODUCTS_READ") || appUser.authorities.has("ADMIN")) &&
              <span className="p-input-icon-left">
                  <div className="flex flex-row gap-2">
                      <InputText type="search" value={searchValue} onKeyPress={handleKeyPress} onChange={(e) => setSearchValue(oldS => e.target.value)}  placeholder="Search for Products" style={{width:"30vw"}} />
                      <Dropdown value={selectedFilter} onChange={(e) => setFilter(prev => e.value)} options={filters} optionLabel="name" 
                          placeholder="Select Filter" className="w-full md:w-14rem" />
                      <Button onClick={e => {
                        setSearchValueToPass(prev => searchValue);
                        if (searchValue.length < 4 && selectedFilter.code == "all") {
                          toast.current.show({ severity: 'warn', summary: 'Info', detail: 'Words with 3 or less characters would not activate filter', life: 3000 });
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
  const handleToggleButton = (e, index) => {
    setProduct((prev) => {
      const _product =  JSON.parse(JSON.stringify(prev));
      _product.contactPersons[index]['status'] = e.value;
      return _product;
    });
  }
      const onInputCPChange = (index, property, value) => {
        setProduct((prev) => {
          const _product = JSON.parse(JSON.stringify(prev));
          _product.contactPersons[index][property] = value;
          return _product;
        });
      };
      const handleEdit = (rd) => {
        const _rd = JSON.parse(JSON.stringify(rd));
  
        const mappedArrayCP = [];
        for (const r of _rd.contactPersons) {
          mappedArrayCP.push({...r, tempId : counterProduct});
          counterProduct++;
        }
        _rd.contactPersons = mappedArrayCP;
  
        const mappedArrayBrands = [];
        for (const r of _rd.brands) {
          mappedArrayBrands.push({...r, tempId : counterBrand});
          counterBrand++;
        }
        _rd.brands = mappedArrayBrands;
  
        setProduct(prev => _rd);
        setSelectedProducts(prev => []);
        for (const country of countries) {
          if (country.name == _rd.originCountry) {
            setSelectedCountry(prev => country);
          }
        }
        
        setSubmitted(prev => false);
        setAddContactPerson(prev => rd.contactPersons.length > 0 ? true : false);
        setProductDialog(prev => true);
      };
      const handleAddBrand = (e) => {
        setBrandSubmitted(prev => true);
        if (tempBrand.name.trim().length > 0 && tempBrand.name.trim().length < 256 && product.brands.filter(b => b.name.toLowerCase() == tempBrand.name.trim().toLowerCase()).length == 0) {
            let _product = JSON.parse(JSON.stringify(product));
            let _tempBrand = {...tempBrand};
            
            _tempBrand.name = _tempBrand.name.trim();
            _tempBrand.tempId = counterBrand;
            counterBrand++;
            _product.brands.push(_tempBrand);
            setProduct(prev => _product);
  
            const _emptyBrand = {...emptyBrand};
            setTempBrand(prev => _emptyBrand);
            setBrandSubmitted(prev => false);
        } else {
            dialogToast.current.show({ severity: 'error', summary: 'Error', detail: 'Invalid Brand Name (Valid: 0 - 256 char. and unique)', life: 3000 });
        }
    };
      return (
          <div>
                    <Toast ref={toast} />
                    <Toolbar start={renderHeader} end={rightToolbarTemplate}></Toolbar>
                    <DataTable value={products} lazy dataKey="id" paginator rowExpansionTemplate={rowExpansionTemplate}   onRowExpand={onRowExpand} 
                            first={lazyState.first} rows={lazyState.rows} totalRecords={totalRecords} onPage={onPage} removableSort 
                            onSort={onSort} sortField={lazyState.sortField} sortOrder={lazyState.sortOrder} rowClassName="" metaKeySelection={false}
                            loading={loading} tableStyle={{ maxWidth: '100vw' }} selectionMode="multiple"  showSelectAll={false}
                            selection={selectedProducts} onSelectionChange={onSelectionChange} rowsPerPageOptions={[10, 25, 50]}>
                              {(appUser.authorities.has("PRODUCTS_UPDATE") || appUser.authorities.has("ADMIN")) && 
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
    <Dialog visible={productDialog} style={{ width: '75vw' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Product" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
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
                value={product.name}
                onChange={(e) => onInputChange(e, 'name')}
                required
                autoFocus
                className={{ 'p-invalid': (submitted && !product.name) || (submitted && product.name && product.name.length > 256 ) }}
              />
              {submitted && !product.name && <small className="p-error">Name is required.</small>}
              {submitted && product.name && product.name.length > 256 && (
                <small className="p-error">Name is too long : max 256 char.</small>
              )}
            </div>
          
            <div className="field ml-4 mr-4">
              <label htmlFor="email" className="font-bold">
                Email
              </label>
              <InputText
                id="email"
                value={product.email}
                onChange={(e) => onInputChange(e, 'email')}
                className={{ 'p-invalid': (submitted && product.email && product.email.length > 250) || (submitted && product.email && !emailPattern.test(product.email))}}
              />
              {submitted && product.email && product.email.length > 250 && (
                <small className="p-error">Email is too long : max 250 char.</small>
              )}
            {submitted && product.email && !emailPattern.test(product.email) && <small className="p-error">Email is invalid.</small>}
            </div>
  
            <div className="field ml-4 mr-4">
              <label htmlFor="telephone" className="font-bold">
                Phone
              </label>
              <InputText
                id="telephone"
                value={product.telephone}
                onChange={(e) => onInputChange(e, 'telephone')}
                className={{ 'p-invalid':(submitted && product.telephone && product.telephone.length > 20) || submitted && product.telephone && !phonePattern.test(product.telephone)}}
              />
              {submitted && product.telephone && product.telephone.length > 20 && (
                <small className="p-error">Phone is too long : max 20 char.</small>
              )}
              {submitted && product.telephone && !phonePattern.test(product.telephone) && <small className="p-error">Phone is invalid.</small>}
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
                value={product.description}
                onChange={(e) => onInputChange(e, 'description')}
                className={{ 'p-invalid': (submitted && product.description && product.description.length > 1000 )}}
                rows={5} cols={30}
              />
              {submitted && product.description && product.description.length > 1000 && (
                <small className="p-error">Description is too long : max 1000 char.</small>
              )}
            </div>
          </TabPanel>
          <TabPanel header="Contact Persons">
            {addContactPerson && 
                product.contactPersons.map((cp, index) => {
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
                                  onChange={(e) => onInputCPChange(index, 'email', e.target.value)}
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
                                  onChange={(e) => onInputCPChange(index, 'telephoneNumber', e.target.value)}
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
                                  onChange={(e) => onInputCPChange(index, 'mobilePhoneNumber', e.target.value)}
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
          <TabPanel header="Brands List">
                <DataTable value={product.brands} dataKey="tempId" tableStyle={{ width: '35vw' }}>
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
          </TabPanel>
      </TabView>
      }
  </Dialog>
  
  
              <Dialog visible={deleteProductsDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteproductsDialogFooter} onHide={hideDeleteproductsDialog}>
                  <div className="confirmation-content flex align-content-center justify-content-center">
                    {deleteProgress && <ProgressSpinner/>}
                    {!deleteProgress && 
                      <>
                      <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                      {product && <span>Are you sure you want to delete the selected products?</span>}
                      </>
                    }
                  </div>
              </Dialog>
              </div>
      );
  }