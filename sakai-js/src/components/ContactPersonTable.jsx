
import React, { useState, useEffect, useRef} from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import {fetchContactPersons, updateContactPersons} from './ContactPersonAPI';
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
import {countries} from './constants/Countries';
import { TabView, TabPanel } from 'primereact/tabview';
import {ToggleButton} from 'primereact/togglebutton';
import {Tag} from 'primereact/tag';
export default function ContactPersonTable() {
  let counterContactPerson = 0;
  const [selectedFilter, setFilter] = useState({ name: 'All (complete words only)', code: 'all' });
  const filters = [
    { name: 'All (complete words only)', code: 'all' },
    { name: 'Name', code: 'name ' },
    { name: 'Email', code: 'email' },
    { name: 'Telephone', code: 'telephoneNumber' },
    { name: 'Mobile Number', code: 'mobilePhoneNumber' },
    { name: 'Status', code: 'status' },
    { name: 'Entity', code: 'entity' }
];
  const toast = useRef(null);
  const [searchValueToPass, setSearchValueToPass] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [contactPersons, setContactPersons] = useState([]);
  const [selectedContactPersons, setSelectedContactPersons] = useState([]);
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
        setLoading(prev => true);
        fetchContactPersons(lazyState, searchValueToPass, selectedFilter.code).then((data) => {
            if (data != undefined && data != null) {
              console.log(data.contactPersons);
                setTotalRecords(prev => data.totalRecords);
                setContactPersons(prev => data.contactPersons);
            } else {
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to load contact person list', life: 3000 });
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
        setSelectedContactPersons(old => value);
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
          // Perform the action you want to execute on Enter key press
          if (searchValue.length < 4 && selectedFilter.code == "all") {
            toast.current.show({ severity: 'warn', summary: 'Info', detail: 'Words with 3 or less characters would not activate default filter', life: 3000 });
          }
          setSearchValueToPass(prev => searchValue);
        } 

      };
    const renderHeader = () => {

        return ( <>
            <span className="p-input-icon-left">
                <div className="flex flex-row gap-2">
                    <InputText type="search" value={searchValue} onKeyPress={handleKeyPress} onChange={(e) => setSearchValue(oldS => e.target.value)}  placeholder="Search for Contact Persons" style={{width:"30vw"}} />
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
          <div>
              <Toast ref={toast} />
                  <Toolbar start={renderHeader}></Toolbar>
                  <DataTable value={contactPersons} lazy dataKey="id" paginator /*filters={lazyState.filters}  onFilter={onFilter} filterDisplay="row" selectionMode="multiple" */
                          first={lazyState.first} rows={lazyState.rows} totalRecords={totalRecords} onPage={onPage} removableSort
                          onSort={onSort} sortField={lazyState.sortField} sortOrder={lazyState.sortOrder} rowClassName="" metaKeySelection={false}
                          loading={loading} tableStyle={{ maxWidth: '100vw' }}  showSelectAll={false}
                          selection={selectedContactPersons} onSelectionChange={onSelectionChange} rowsPerPageOptions={[10, 25, 50]}>
                          <Column field="name" header="Name" sortable/>
                          <Column field="email" header="Email" sortable/>
                          <Column field="telephoneNumber" header="Telephone" sortable/>
                          <Column field="mobilePhoneNumber" header="Mobile Phone" sortable/>
                          <Column field="status" body={statusBodyTemplate} header="Active" sortable/>
                          <Column field="entity" header="Entity" sortable/>
                  </DataTable>
            </div>
    );
}
        