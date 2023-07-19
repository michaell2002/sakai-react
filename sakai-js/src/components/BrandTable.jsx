
import React, {useContext, useRef, useState, useEffect} from 'react';
import { InputText } from 'primereact/inputtext';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { fetchBrands, createBrand, deleteBrand } from './api/BrandAPI';
import SERVER_PREFIX from './Domain';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import CustomImage from './CustomImage';
import ImageContext from '../layout/context/imagecontext';
import { ProgressSpinner } from 'primereact/progressspinner';
import UserContext from '../layout/context/usercontext';
import { Toolbar } from 'primereact/toolbar';
//DO FORM BRANDS THINK ABOUT CREATE AND DELETE FUNCTIONS
export default function BrandTable() {
    const {appUser} = useContext(UserContext);
    const [brands, setBrands] = useState([]);
    const [filterBrands, setFilterBrands] = useState([]);
    const toast = useRef(null);
    const [brandSubmitted, setBrandSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const createCustomerController = useRef(new AbortController());
    const deleteCustomerController = useRef(new AbortController());
    const [search, setSearch] = useState("");
    const emptyBrand = {
        id : null,
        name : "",
        deletable : true,
    }
    const [tempBrand, setTempBrand] = useState({...emptyBrand});
    const handleAddBrand = (e) => {
        setBrandSubmitted(prev => true);
        setLoading(prev => true);
        if (tempBrand.name.trim().length > 0 &&  tempBrand.name.trim().length < 256 && brands.filter(w => w.name == tempBrand.name.trim()).length == 0) {
            let _brands = [...brands];
            let _tempBrand = {...tempBrand};
            _tempBrand.name = _tempBrand.name.trim();
            createBrand(_tempBrand, createCustomerController.current, appUser.tokenValue)
            .then(result => {
                    _brands.push(result);
                    setTempBrand(prev => ({...emptyBrand}));
                    setBrands(prev => _brands);
                    toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Brand Created', life: 3000 });
            }).catch(error => {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
            }).finally(() =>   {
                setLoading(prev => false);
                setBrandSubmitted(prev => false);
            });
        } else {
            setLoading(prev => false);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Invalid Brand Name (unique & 0-256 char.)', life: 3000 });
        }
    };
    const handleRemoveBrand = (rowData) => {
        setLoading(prev => true);
        deleteBrand(rowData, deleteCustomerController.current, appUser.tokenValue)
        .then(res => {
            let _brands = [...brands];
            _brands = _brands.filter(w => w.name != rowData.name);
            setBrands(prev => _brands);
            setLoading(prev => false);
            toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Brand Deleted', life: 3000 });
        })
        .catch(error => {
            setLoading(prev => false);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Unable to Delete Brand ' + error.message, life: 3000 });
        })
    };
    const handleCancel = (e) => {
        deleteCustomerController.current.abort();
        createCustomerController.current.abort();
        deleteCustomerController.current = new AbortController();
        createCustomerController.current = new AbortController();
        setLoading(prev => false);
    }
    const onSearchChange = (e) => {
        const search = e.target ? e.target.value : "";
        if (search != "" && search != null && search != undefined) {
            setFilterBrands(prev => brands.filter(b => b.name.includes(search)));
        } else {
            setFilterBrands(prev => [...brands]);
        }
    };
    const onBrandChange = (e) => {
        const val = (e.target && e.target.value) || '';
        const _tempBrand = {...tempBrand};
        _tempBrand.name = val;
        setTempBrand((prev) => _tempBrand);
    };
    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                {rowData.deletable &&
                (appUser.authorities.has("BRANDS_DELETE") || appUser.authorities.has("ADMIN")) &&
                 <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={(e) => handleRemoveBrand(rowData)} /> } 
            </React.Fragment>
        );
    };
    const addBrandToolBar = () => {
        return (
            (appUser.authorities.has("BRANDS_CREATE") || appUser.authorities.has("ADMIN")) &&
            <div className="flex p-inputgroup col-12">
                <InputText
                id="brand"
                value={tempBrand.name}
                placeholder="Enter Brand (max.256)"
                onChange={(e) => onBrandChange(e)}
                className={{ 'p-invalid': (brandSubmitted && tempBrand.name.length <= 0) || (brandSubmitted && tempBrand.name.length > 256 ) }}
                />
                <Button label="Add Brand" icon="pi pi-plus" onClick={handleAddBrand}/>
            </div>
        )
    }
    const searchBar = () => {
        return (
          <div className='flex'>
                <InputText
                id="name"
                placeholder="Search for Brands"
                onChange={(e) => onSearchChange(e)}/>
          </div>
        )
    }
    useEffect(() => {
        fetchBrands(appUser.tokenValue).then(c => {
            console.log(c);
            setBrands(prev => c);
        }).catch(error => {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
        });
    }, [])
    useEffect(() => {
        setFilterBrands(prev => brands.filter(b => b.name.includes(search)));
    }, [brands]);
  return (
    <>
    <Toast ref={toast}/>
    <div>
        <Toolbar start={searchBar} end={addBrandToolBar}/>
        <DataTable value={filterBrands} dataKey="id" tableStyle={{ width: '40vw' }} paginator rows={10}>
            <Column field="name" header="Brand Name" > </Column>
            <Column body={actionBodyTemplate} style={{width:"5rem"}}> </Column>
        </DataTable> 
    </div>
    <Dialog header="Processing" visible={loading} style={{ width: '35vw' }} closable={false}>
        <div className='align-content-center justify-content-center text-center mb-4'>
            <ProgressSpinner/>
        </div>
        <div className='align-content-center justify-content-center text-center'>
            <Button outlined severity='danger' label="Cancel"  icon="pi pi-times" onClick={handleCancel}/>
        </div>
    </Dialog>
    </>
  )
}