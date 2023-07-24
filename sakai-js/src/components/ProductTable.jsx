
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
import { TabView, TabPanel } from 'primereact/tabview';
import {ToggleButton} from 'primereact/togglebutton';
import UserContext from '../layout/context/usercontext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchBrands, fetchFilteredBrands } from './api/BrandAPI';
import { AutoComplete } from 'primereact/autocomplete';
import {InputNumber} from 'primereact/inputnumber';
import {Divider} from 'primereact/divider';
import { fetchWarehouses } from './api/ProfilePanelAPI';
import { fetchPurchaseDocumentsByRefNo } from './api/PurchaseDocumentAPI';
export default function ProductTable() {

    const [defaultSupplier, setDefaultSuppier] = useState(null);
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
    //TODO 
    const emptyPurchaseDocument = {
      id: null,
      refNo: '',
      supplierPurchase: {...defaultSupplier},
      fieldCreatedDate: null,
      orderItems: [],
      status: null,
      statusEnumString: '',
      ownership: true,
      paymentTnC: '',
      otherNotes: '',
      tempId : null
  };
    const tempProductSpecId = useRef(0);
    const tempProductWarehouseQuantityId = useRef(0);
    const tempPurchaseDocumentId = useRef(0);
    let counterProduct = 0;
    let counterBrand = 0;
    const {appUser} = useContext(UserContext);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [brands, setBrands] = useState([]);
    const [filteredBrands, setFilteredBrands] = useState([]);
    const [selectedFilter, setFilter] = useState({ name: 'All (complete words only)', code: 'all' });
    const [expandedRows, setExpandedRows] = useState([]);
    const filters = [
      { name: 'All (complete words only)', code: 'all' },
      { name: 'Brand Name', code: 'brandName' }, 
      { name: 'Product Code', code: 'productCode' },
      { name: 'Product Name', code: 'productName' },
      { name: 'Standard Price', code: 'standardPrice' },
      { name: 'Product Details', code: 'productDetails' }
  ];
    const [tempBrand, setTempBrand] = useState({...emptyBrand});
    const [brandSubmitted, setBrandSubmitted] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [searching, setSearching] = useState(false);
    const saveProductController = useRef(new AbortController())
    const deleteProductsController = useRef(new AbortController());
    const [productSpecsForm, setProductSpecsForm] = useState({});
    const [warehouseQuantityForm, setWarehouseQuantityForm] = useState({});
    const [purchaseDocumentsForm, setPurchaseDocumentsForm] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [purchaseTemp, setPurchaseTemp] = useState({...emptyPurchaseDocument});
    const [filteredPurchasesByRefNo, setFilteredPurchasesByRefNo] = useState([]);

    const emptyProduct = {
      id: null,
      productCode: '',
      brand: null,
      productName: '',
      productDetails: '',
      productSpecs: {},
      warehouseQuantity: {},
      offsetStockSoldOutsideSystem: 0,
      warehouses: [],
      standardPrice: null,
      brandName: '',
  };
    const toast = useRef(null);
    const dialogToast = useRef(null);
    const [deleteProgress, setDeleteProgress] = useState(false);
    const [editOrCreateProgress, setEditOrCreateProgress] = useState(false);
    const [product, setProduct] = useState({...emptyProduct});
    const [searchValueToPass, setSearchValueToPass] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const [searchValueBrand, setSearchValueBrand] = useState({query : ""});
    const [searchValuePurchaseRefNo, setSearchValuePurchaseRefNo] = useState({query : ""});
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
      const predicate = () => { //TODO : UPDATE
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
      const handleChangeBrand = (e) => {
        setSelectedBrand(prev => e.target.value);
        const _brand = (e.target) ? e.target.value.name : '';
        const _product = JSON.parse(JSON.stringify(product));
        _product.brand = _brand;
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
          if (name == 'refNo') {
            _product[`${name}`] = val.toUpperCase();
          } else {
            _product[`${name}`] = val;
          }
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

      useEffect(() => {
        fetchWarehouses(appUser.tokenValue).then(data => {
          if (data != undefined && data != null) {
              setWarehouses(prev => data);
          } else {
            toast.current != null ? toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to load warehouses ', life: 3000 }) : "";
          }
        }).catch(error => {
          toast.current != null ? toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to load warehouses' + error.message, life: 3000 }) : "";
        });
      }, [])

      useEffect(() => {
        let ignore = false;
        fetchFilteredBrands(appUser.tokenValue, searchValueBrand.query).then(res => {
          if (!ignore) {
            setFilteredBrands(prev => res);
          }
        }).catch(error => {
          dialogToast.current  != null ? dialogToast.current.show({ severity: 'error', summary: 'Error', detail: 'Unable to fetch brands ' + error.message, life: 3000 }) : "";
        })
        return () => ignore = true;
      }, [searchValueBrand])

      useEffect(() => {
        let ignore = false;
        fetchPurchaseDocumentsByRefNo(searchValuePurchaseRefNo.query, appUser.tokenValue).then(res => {
          if (!ignore) {
            setFilteredPurchasesByRefNo(prev => res);
          }
        }).catch(error => {
          dialogToast.current  != null ? dialogToast.current.show({ severity: 'error', summary: 'Error', detail: 'Unable to fetch purchase documents ' + error.message, life: 3000 }) : "";
        })
        return () => ignore = true;
      }, [searchValuePurchaseRefNo])

    const searchBrand = (event) => {
          setSearchValueBrand(prev => ({query : event.query.toLowerCase()}));
    };
      const loadLazyData = () => {
        if (appUser.authorities.has("PRODUCTS_READ") || appUser.authorities.has("ADMIN")) {
            setLoading(prev => true);
            fetchProducts(lazyState, searchValueToPass, selectedFilter.code, appUser.tokenValue).then((data) => {
                if (data != undefined && data != null) {
                    setTotalRecords(prev => data.totalRecords);
                    setProducts(prev => data.products);
                } else {
                  toast.current != null ? toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to load products ', life: 3000 }) : "";
                }
                setLoading(prev => false);
            }).catch(error => {
              toast.current != null ? toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to load products ' + error.message, life: 3000 }) : "";
              setLoading(prev => false);
            });
          } else {
              toast.current != null ? toast.current.show({ severity: 'error', summary: 'Error', detail: 'Unauthorized to READ products ', life: 3000 }) : "";       
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
              toast.current != null ? toast.current.show({ severity: 'warn', summary: 'Info', detail: 'Words <= 3 char. would not activate "All" filter', life: 3000 }) : "";
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
                      <InputText type="search" value={searchValue} onKeyDown={handleKeyPress} onChange={(e) => setSearchValue(oldS => e.target.value)}  placeholder="Search for Products" style={{width:"30vw"}} />
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
  const onBrandAutocompleteChange = (e) => {
      setSelectedBrand(prev => e.value);
  };
      const onInputCPChange = (index, property, value) => {
        setProduct((prev) => {
          const _product = JSON.parse(JSON.stringify(prev));
          _product.contactPersons[index][property] = value;
          return _product;
        });
      };
      const handleAddSpec = (e) => {
        const _productSpecsForm = JSON.parse(JSON.stringify(productSpecsForm));
        const id = tempProductSpecId.current;
        tempProductSpecId.current = tempProductSpecId.current + 1;
        _productSpecsForm[id] =  ["", ""];
        console.log(_productSpecsForm);
        setProductSpecsForm(prev => _productSpecsForm);

      };
      const onSpecChange = (e, id, field) => {
        let _productSpecsForm = JSON.parse(JSON.stringify(productSpecsForm));
        if (field == 'key') {
          _productSpecsForm[id][0] = e.target ? e.target.value : "";
        } else {
          _productSpecsForm[id][1] = e.target ? e.target.value : "";
        }
        setProductSpecsForm(prev => _productSpecsForm);
      }
      const handleSpecDelete = (id) => {
        const _productSpecsForm = JSON.parse(JSON.stringify(productSpecsForm));
        delete _productSpecsForm[id];
        setProductSpecsForm(prev => _productSpecsForm);
      }
      const handleAddWarehouseQuantity = (e) => {
        const _warehouseQuantityForm = JSON.parse(JSON.stringify(warehouseQuantityForm));
        const id = tempProductWarehouseQuantityId.current;
        tempProductWarehouseQuantityId.current = tempProductWarehouseQuantityId.current + 1;
        _warehouseQuantityForm[id] =  [warehouses.length > 0 ? warehouses[0] : {}, 0];
        setWarehouseQuantityForm(prev => _warehouseQuantityForm);
      };
      const onWarehouseQuantityChange = (e, id, field) => {
        let _warehouseQuantityForm = JSON.parse(JSON.stringify(warehouseQuantityForm));
        if (field == 'key') {
          _warehouseQuantityForm[id][0] = e.value;
        } else {
          _warehouseQuantityForm[id][1] = e.target ? e.target.value : "";
        }
        setWarehouseQuantityForm(prev => _warehouseQuantityForm);
      };
      const handleWarehouseQuantityDelete = (id) => {
        const _warehouseQuantityForm = JSON.parse(JSON.stringify(warehouseQuantityForm));
        delete _warehouseQuantityForm[id];
        setWarehouseQuantityForm(prev => _warehouseQuantityForm);
      };
      
      const handleAddPurchaseDocument = (e) => {
        //TODO : fetch purchase documents by refNo keyword
        const pId = tempPurchaseDocumentId.current;
        tempPurchaseDocumentId.current = tempPurchaseDocumentId.current + 1;
        setPurchaseDocumentsForm(prev => prev.concat({...emptyPurchaseDocument, tempId : pId }));
        setPurchaseTemp(prev => ({id : null, refNo : ""}));
      };

      const searchPurchasesByRefNo = (e) => {
        setSearchValuePurchaseRefNo(prev => ({query : e.query.trim().toUpperCase()}))
      };

      const onChangePurchaseRefNo = (e) => {
        console.log(e.value);
        setPurchaseTemp(prev => e.value);
      }

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
        for (const brand of brands) {
          if (brand.name == _rd.brand) {
            setSelectedBrand(prev => brand);
          }
        }
        
        setSubmitted(prev => false);
        setAddContactPerson(prev => rd.contactPersons.length > 0 ? true : false);
        setProductDialog(prev => true);
      };
      /*
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
            dialogToast.current != null ? dialogToast.current.show({ severity: 'error', summary: 'Error', detail: 'Invalid Brand Name (Valid: 0 - 256 char. and unique)', life: 3000 }) : "";
        }
    }; */
    const actionBodyTemplate = (rowData) => {
      return (
          <React.Fragment>
              {rowData.deletable && <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={(e) => handleRemoveBrand(rowData)} /> } 
          </React.Fragment>
      );
  };
    const rowExpansionTemplate = (data) => {
      return (
          <div className="p-3">
              <h5>Orders for {data.name}</h5>
              {/*<DataTable value={data.orders}>
                  <Column field="id" header="Id" sortable></Column>
                  <Column field="customer" header="Customer" sortable></Column>
                  <Column field="date" header="Date" sortable></Column>
                  <Column field="amount" header="Amount" body={amountBodyTemplate} sortable></Column>
                  <Column field="status" header="Status" body={statusOrderBodyTemplate} sortable></Column>
                  <Column headerStyle={{ width: '4rem' }} body={searchBodyTemplate}></Column>
              </DataTable> */}
          </div>
      );
  };

      return (
          <div>
                    <Toast ref={toast} />
                    <Toolbar start={renderHeader} end={rightToolbarTemplate}></Toolbar>
                    <DataTable value={products} lazy dataKey="id" paginator rowExpansionTemplate={rowExpansionTemplate}
                            first={lazyState.first} rows={lazyState.rows} totalRecords={totalRecords} onPage={onPage} removableSort 
                            onSort={onSort} sortField={lazyState.sortField} sortOrder={lazyState.sortOrder} rowClassName="" metaKeySelection={false}
                            loading={loading} tableStyle={{ maxWidth: '100vw' }} selectionMode="multiple"  showSelectAll={false}
                            selection={selectedProducts} onSelectionChange={onSelectionChange} rowsPerPageOptions={[10, 25, 50]}>
                            <Column expander={true} style={{ width: '5rem' }} />
                            <Column field="brandName" header="Brand" sortable/>
                            <Column field="productName" header="Product Name" sortable/>
                            <Column field="productCode" header="Product Code" sortable/>
                            <Column field="standardPrice" header="Standard Price" sortable/>
                            <Column field="productDetails" header="Product Details" style={{ minWidth: '20rem' }}  sortable/>
                    </DataTable>   
    <Dialog visible={productDialog} style={{ width: '75vw' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Product" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
    <Toast ref={dialogToast} />
    {editOrCreateProgress &&  
      <div className='flex align-content-center justify-content-center'>
              <ProgressSpinner />
      </div>
    }
    {!editOrCreateProgress &&
    <>
            <div className="field ml-4 mr-4 w-6">
              <label htmlFor="brand" className="font-bold">
                Brand*
              </label>
              <AutoComplete field="name" value={selectedBrand} suggestions={filteredBrands} 
                    completeMethod={searchBrand} onChange={onBrandAutocompleteChange} 
                    placeholder="Enter Existing Brand" showEmptyMessage={true} forceSelection/>
            </div>

          <div className="field ml-4 mr-4">
              <label htmlFor="productName" className="font-bold">
                Product Name*
              </label>
              <InputText
                id="productName"
                value={product.productName}
                onChange={(e) => onInputChange(e, 'productName')}
                required
                autoFocus
                className={{ 'p-invalid': (submitted && !product.productName) || (submitted && product.productName && product.productName.length > 256 ) }}
              />
              {submitted && !product.productName && <small className="p-error">Product Name is required.</small>}
              {submitted && product.productName && product.productName.length > 256 && (
                <small className="p-error">Product Name is too long : max 256 char.</small>
              )}
            </div>
          
            <div className="field ml-4 mr-4">
              <label htmlFor="productCode" className="font-bold">
                Product Code*
              </label>
              <InputText
                id="productCode"
                value={product.productCode}
                onChange={(e) => onInputChange(e, 'productCode')}
                required
                className={{
                  'p-invalid': (submitted && !product.productCode) || (submitted && product.productCode && product.productCode.length > 256)
                }}
              />
              {submitted && !product.productCode && <small className="p-error">Product Code is required.</small>}
              {submitted && product.productCode && product.productCode.length > 256 && (
                <small className="p-error">Product Code is too long: maximum 256 characters.</small>
              )}
            </div>
  
            <div className="field ml-4 mr-4">
                <label htmlFor="standardPrice" className="font-bold">
                  Standard Price*
                </label>
                <InputNumber inputId="currency-us" 
                              value={product.standardPrice} 
                              onChange={(e) => onInputChange(e, 'standardPrice')} 
                              mode="currency" 
                              currency="USD" 
                              locale="en-US"  
                              className={{
                                'p-invalid': (submitted && !product.standardPrice) || (submitted && product.standardPrice && isNaN(product.standardPrice))
                              }}
                />
                {submitted && !product.standardPrice && <small className="p-error">Standard Price is required.</small>}
                {submitted && product.standardPrice && product.standardPrice < 0 && (
                  <small className="p-error">Standard Price must more than 0</small>
                )}
              </div>
            <div className="field ml-4 mr-4">
              <label htmlFor="productSpecs" className="font-bold mr-4">
                Product Specifications (unique fields only)
              </label>
              {Object.keys(productSpecsForm).map((id) => {
                return (<div key={id} className='grid align-content-center justify-content-center'>
                    <div className='col-5'>
                      <InputText
                        id={"productSpecsKey" + id}
                        value={productSpecsForm[id][0]}
                        placeholder='Field Name'
                        onChange={(e) => onSpecChange(e, id, 'key')}
                        className={{
                          'p-invalid': (submitted && productSpecsForm[id][0] && productSpecsForm[id][0] > 256)
                        }}
                      /> 
                      {submitted && !productSpecsForm[id][0] && <small className="p-error">Product Spec is required.</small>}
                      {submitted && productSpecsForm[id][0] && productSpecsForm[id][0] > 256 && (
                        <small className="p-error">Product Spec is too long: maximum 256 characters.</small>
                      )}
                    </div>
                    <div className='col-5'>
                      <InputText
                        id={"productSpecsValue" + id}
                        value={productSpecsForm[id][1]}
                        placeholder='Value'
                        onChange={(e) => onSpecChange(e, id, 'value')}
                        className={{
                          'p-invalid': (submitted && productSpecsForm[id][1] && productSpecsForm[id][1] > 256)
                        }}
                      />
                      {submitted && productSpecsForm[id][1] && (productSpecsForm[id][1].length > 256) && (
                        <small className="p-error">Product Specification Field is too long : max 256 char.</small>
                      )}
                    </div>
                    <div className='col-2 text-center justify-content-center align-content-center'>
                      <Button icon="pi pi-times" onClick={e => handleSpecDelete(id)} outlined severity='danger' className='w-5'/>
                    </div>
                  </div>)
              })
              }
              <div className='flex text-center justify-content-center align-content-center mt-4 mb-4'>
                <Button label="Add Product Specification" icon="pi pi-plus" onClick={handleAddSpec} className='w-5'/>
              </div>
            </div>
            <div className="field ml-4 mr-4">
                <label htmlFor="productDetails" className="font-bold">
                  Product Details
                </label>
                <InputTextarea
                  id="productDetails"
                  value={product.productDetails}
                  onChange={(e) => onInputChange(e, 'productDetails')}
                  required
                  className={{
                    'p-invalid': (submitted && product.productDetails && product.productDetails.length > 1000)
                  }}
                />
                {submitted && product.productDetails && product.productDetails.length > 1000 && (
                  <small className="p-error">Product Details is too long: maximum 1000 characters.</small>
                )}
              </div>
              <div className="field ml-4 mr-4">
              <label htmlFor="warehouseQuantity" className="font-bold mr-4">
                Quantity in Warehouse(s)
              </label>
              {Object.keys(warehouseQuantityForm).map((id) => {
                return (<div key={id} className='grid align-content-center justify-content-center'>
                    <div className='col-5'>
                      <Dropdown value={warehouseQuantityForm[id][0]} onChange={(e) => onWarehouseQuantityChange(e, id, 'key')} options={warehouses} optionLabel="name" 
                          placeholder="Select Warehouse" className="w-full" id={"quantitySpecsKey" + id} />
                    </div>
                    <div className='col-5'>
                      <InputNumber
                        id={"quantitySpecsValue" + id}
                        value={warehouseQuantityForm[id][1]}
                        placeholder='Quantity'
                        onChange={(e) => onWarehouseQuantityChange(e, id, 'value')}
                        className={{
                         // 'p-invalid': submitted && productSpecsForm[id][1] && (productSpecsForm[id][1] < 0)
                        }}
                        min={0}
                      />

                    </div>
                    <div className='col-2 text-center justify-content-center align-content-center'>
                      <Button icon="pi pi-times" onClick={e => handleWarehouseQuantityDelete(id)} outlined severity='danger' className='w-5'/>
                    </div>
                  </div>)
              })
              }
              <div className='flex text-center justify-content-center align-content-center mt-4 mb-4'>
                <Button label="Add Warehouse Entry" icon="pi pi-plus" onClick={handleAddWarehouseQuantity} className='w-5'/>
              </div>
              </div>
              <br></br>
              <h5 className='ml-4 font-bold'>Most Recent Purchases</h5>
              <span className='ml-4'>*Total quantity must be equal or greater than current stock</span>
              <div className='card'>  
                <div className='flex text-center justify-content-center align-content-center mt-4 mb-4'>
                <div className="flex p-inputgroup col-10">
                    <AutoComplete
                    id="purchaseRefNo"
                    field="refNo"
                    value={purchaseTemp}
                    suggestions={filteredPurchasesByRefNo} 
                    completeMethod={searchPurchasesByRefNo}
                    placeholder="Enter Purchase Reference Number"
                    onChange={onChangePurchaseRefNo} 
                    //showEmptyMessage={true}
                    //className={{ 'p-invalid': (brandSubmitted && tempBrand.name.length <= 0) || (brandSubmitted && tempBrand.name.length > 256 ) }}
                    />
                    <Button label="Add Purchase Document" icon="pi pi-plus" onClick={handleAddPurchaseDocument}/>
                </div>
                </div>
                {purchaseDocumentsForm.map(pd => {
                                            return (
                                              <div className="field" key={tempId}>
                                              </div>
                                            );
                                          })
                }

              </div>

      </>
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