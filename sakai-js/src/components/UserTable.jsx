
import React, { useState, useEffect, useRef, useContext} from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import {fetchUsers, createUser, updateUser, deleteUsers} from './api/UserAPI';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Password } from 'primereact/password';
import { Checkbox } from "primereact/checkbox";
import {Tag} from 'primereact/tag';
import {forNewTables, defaultTables } from './constants/CheckboxConstants';
import { InputSwitch } from "primereact/inputswitch";
import UserContext from '../layout/context/usercontext';
import { ProgressSpinner } from 'primereact/progressspinner';
export default function UserTable() {
  //ADMIN authority gets special treatment
  const [deleteProgress, setDeleteProgress] = useState(false);
  const [newUserProgress, setNewUserProgress] = useState(false);
  const [editUserProgress, setEditUserProgress] = useState(false);
  const {appUser, updateAppUser} = useContext(UserContext);
  const [editPassword, setEditPassword] = useState(false);
  const [tables, setTables] = useState(JSON.parse(JSON.stringify(defaultTables)));
  const [selectedFilter, setFilter] = useState({ name: 'All (complete words only)', code: 'all' });
  const [submitted, setSubmitted] = useState(false);
  const [adminFlag, setAdminFlag] = useState(false);
  const saveUserController = useRef(new AbortController());
  const deleteUserController = useRef(new AbortController());
  const emptyUser = {
    id : null,
    username: "",
    password: undefined,
    confirmPassword : undefined,
    enabled: true,
    authorities : []
};
  const dialogToast = useRef(null);
  const [user, setUser] = useState({...emptyUser});
  const toast = useRef(null);
  const [searchValueToPass, setSearchValueToPass] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
        const [lazyState, setlazyState] = useState({
            first: 0,
            rows: 10,
            page: 1,
            sortField: null,
            sortOrder: null,
            filters: {
                username: { value: '', matchMode: 'contains' },
            } 
        });
    const [userDialog, setUserDialog] = useState(false);
    const [editUserDialog, setEditUserDialog]  = useState(false);
    const [deleteUsersDialog, setDeleteUsersDialog] = useState(false);
    const openNew = () => {
        const _emptyUser = {...emptyUser}
        setUser(prev => _emptyUser);
        setTables(prev => JSON.parse(JSON.stringify(forNewTables)));
        setSubmitted(prev => false);
        setUserDialog(prev => true);
    };


    const hideDialog = () => {
        saveUserController.current.abort();
        saveUserController.current = new AbortController();
        setUserDialog(prev => false);
        setEditUserDialog(prev => false);
        setEditUserProgress(prev => false);
        setNewUserProgress(prev => false);
        setSubmitted(prev => false);
        setAdminFlag(prev => false);
        setEditPassword(prev => false);
        setSelectedUsers(prev => []); 
    };


    const hideDeleteusersDialog = () => {
        deleteUserController.current.abort();
        deleteUserController.current = new AbortController();
        setDeleteUsersDialog(false);
        setDeleteProgress(prev => false);
    };
    const authoritiesList = (u) => {
      return <span>{u.authorities != undefined && u.authorities.length > 0 ? u.authorities.reduce((x,y) => x + " , " + y) : ""}</span>
    }
    const statusBodyTemplate = (user) => {
      return <Tag value={user.enabled == true ? "true" : "false"} severity={getSeverity(user)}></Tag>;
  };
  const getSeverity = (user) => {
    switch (user.enabled) {
        case true:
            return 'success';

        case false:
            return 'danger';

        default:
            return 'info';
    }
};
    const onCategoryChange = (e) => {
      const [table, operationAuthority] = e.value.trim().split("_");
      const _tables = JSON.parse(JSON.stringify(tables));
      const relevantCategory = _tables.find(x => x.key == table);
      relevantCategory.authorities = relevantCategory.authorities.map(a => {
        if (operationAuthority == a.key) {
          return {...a, selected : e.checked};
        }
        return a;
      });
      setTables(prev => _tables);

    };
    const predicate = () => {
            if (user.username.length < 1 || user.username.length > 256) {
              return false;
            } else if (submitted && (user.enabled == undefined)) {
              return false;
            } else if (user.id && (user.password != user.confirmPassword)) {
              return false;
            } else if (user.password && (user.password.length < 5 || user.password.length > 256)) {
              return false;
            }
            return true;
          };
    const saveUser = () => {
        setSubmitted(prev => true);
        if (predicate()) {
            let _users = [...users];
            let mappedUser = JSON.parse(JSON.stringify(user)); 
            mappedUser.authorities = tables.flatMap(t => {                //mapping of table & authorities object to TABLE_OPERATION format 
              const filtered = t.authorities.filter(a => a.selected);
              if (filtered.length > 0) {
                return filtered.map(a =>  t.key + "_" + a.key);
              } else {
                return null;
              }
            }).filter(x => x != null);
            if (user.id) {
                setEditUserProgress(prev => true);
                const index = findIndexById(user.id);
                updateUser(mappedUser, saveUserController.current, appUser.tokenValue).then(res => {
                    toast.current != null ? toast.current.show({ severity: 'success', summary: 'Successful', detail: 'User Updated', life: 3000 }) : "";
                }).catch(error => {
                    toast.current != null ? toast.current.show({ severity: 'error', summary: 'Error', detail: "Unable to update user: " + error.message, life: 3000 }) : "";
                }).finally(() => {
                    if (appUser.username == mappedUser.username) {
                      toast != null ? toast.current.show({ severity: 'info', summary: 'Logging Out', detail: "Logging you out ", life: 3000 }) : "";
                      setTimeout(() => {
                        localStorage.clear();
                        updateAppUser(null);
                      }, 3000)
                    } else {
                      setEditUserProgress(prev => false);
                      setUserDialog(prev => false);
                      setEditUserDialog(prev => false);
                      loadLazyData();
                    }
                });
                setSelectedUsers(prev => []);
                const _emptyUser = {...emptyUser}
                setUser(prev => _emptyUser);
            } else {
                setNewUserProgress(prev => true);
                createUser(mappedUser, saveUserController.current, appUser.tokenValue).then(obj => {
                    toast.current.show({ severity: 'success', summary: 'Successful', detail: 'User Created', life: 3000 });
                }).catch(error => {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: "Unable to create user: " + error.message, life: 3000 });
                }).finally(() => {
                    setNewUserProgress(prev => false);
                    setUserDialog(prev => false);
                    setEditUserDialog(prev => false);
                    loadLazyData();
                }); 
           } 
        } else {
          dialogToast.current.show({ severity: 'error', summary: 'Error', detail: "Invalid Field(s)", life: 3000 });
        }
    };

    
    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _user = { ...user };
        _user[`${name}`] = val;
        setUser((prev) => _user);
    };

    const onRoleChange = (e, name) =>  {

    }

    const findIndexById = (id) => {
        let index = -1;

        for (let i = 0; i < users.length; i++) {
            if (users[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };
    const confirmDeleteSelected = () => {
        setDeleteUsersDialog(prev => true);
    };

    const deleteSelectedUsers = () => {
        setDeleteProgress(prev => true);
        deleteUsers(selectedUsers.map(c => c.id), deleteUserController.current, appUser.tokenValue).then(js => {
          let _users = users.filter((val) => !selectedUsers.includes(val));
          setUsers(prev => _users);
          setDeleteUsersDialog(prev => false);
          setSelectedUsers(prev => []);
          toast.current.show({ severity: 'success', summary: 'Successful', detail: 'Users Deleted', life: 3000 });
        }).catch(error => {
          toast.current.show({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
        }).finally(() => {
          setDeleteProgress(prev => false);
          loadLazyData();
        })
    };
    const userDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" onClick={saveUser} />
        </React.Fragment>
    );
    const deleteusersDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteusersDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteSelectedUsers} />
        </React.Fragment>
    );



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
          fetchUsers(lazyState, searchValueToPass, appUser.tokenValue).then((data) => {
              if (data != undefined && data != null && data.users != undefined) {
                  setTotalRecords(prev => data.totalRecords);       
                  data.users = data.users.map(u => {
                    u.authorities = u.authorities.map(a => a.authority);
                    return {...u, password : null};
                  })
                  setUsers(prev => data.users);
              } else {
                toast.current != null ? toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to load users', life: 3000 }) : "";
              }
              setLoading(prev => false);
          }).catch(error => {
                toast.current != null ? toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to load users', life: 3000 }) : "";
                setLoading(prev => false);
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
        setSelectedUsers(old => value);
    };
    const handleToggle = (e) => {
      setUser((prev) => {
        const _user =  JSON.parse(JSON.stringify(prev));
        _user.enabled = e.value;
        return _user;
      });
    }
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
          // Perform the action you want to execute on Enter key press
          /*
          if (searchValue.length < 4 && selectedFilter.code == "all") {
            toast.current.show({ severity: 'warn', summary: 'Info', detail: 'Words with 3 or less characters would not activate default filter', life: 3000 });
          }
          */
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
    const renderHeader = () => {

        return ( <>
            <span className="p-input-icon-left">
                <div className="flex flex-row gap-2">
                    <InputText type="search" value={searchValue} onKeyDown={handleKeyPress} onChange={(e) => setSearchValue(oldS => e.target.value)}  placeholder="Search for Username" style={{width:"30vw"}} />
                    <Button onClick={e => {
                      setSearchValueToPass(prev => searchValue);
                      /*
                      if (searchValue.length < 4 && selectedFilter.code == "all") {
                        toast.current.show({ severity: 'warn', summary: 'Info', detail: 'Words with 3 or less characters would not activate filter', life: 3000 });
                      }
                      */
                    }} icon="pi pi-search" rounded outlined />
                </div>
            </span>
            </>
        );
    };



    const handleEdit = (rd) => {
      const _rd = JSON.parse(JSON.stringify(rd));
      const _tables = JSON.parse(JSON.stringify(defaultTables));
      _rd.authorities.map(a => {                          
        const [table, operationAuthority] = a.split("_");
        //checked for undefined
        if (table == "ADMIN") { 
          setAdminFlag(prev => true);
        } else {
          const tableObj = _tables.find(t => t.key == table);
          tableObj.authorities = tableObj.authorities.map(o => {
            if (o.key == operationAuthority) {
              return {...o, selected : true};
            } else {
              return o;
            }
          });
        }
      });
      setTables(prev => _tables);
      setUser(prev => _rd);
      setSelectedUsers(prev => []);
      setSubmitted(prev => false);
      setEditUserDialog(prev => true);
      setEditPassword(prev => false);
    };
   
    return (
      <>
       {appUser.authorities.has("ADMIN") && 
        <div>
              <Toast ref={toast} />
                  <Toolbar start={renderHeader} end={rightToolbarTemplate}></Toolbar>
                  <DataTable value={users} lazy dataKey="id" paginator /*filters={lazyState.filters}  onFilter={onFilter} filterDisplay="row"*/
                          first={lazyState.first} rows={lazyState.rows} totalRecords={totalRecords} onPage={onPage} removableSort
                          onSort={onSort} sortField={lazyState.sortField} sortOrder={lazyState.sortOrder} rowClassName="" metaKeySelection={false}
                          loading={loading} tableStyle={{ maxWidth: '100vw' }} selectionMode="multiple"  showSelectAll={false}
                          selection={selectedUsers} onSelectionChange={onSelectionChange} rowsPerPageOptions={[10, 25, 50]}>
                              <Column
                                field="edit"
                                body={(rowData) => (
                                <div className=" "onClick={() => handleEdit(rowData)}>
                                      <i className="pi pi-id-card" style={{ cursor: 'pointer', fontSize: '1.3rem'}} onClick={() => handleEdit(rowData)} /> 
                                </div>
                                )}
                              />
                          <Column field="username" header="Username" sortable/>
                          <Column field="enabled" body={statusBodyTemplate} header="Enabled" style={{ maxWidth: '7rem' }} sortable/>
                          <Column body={authoritiesList} style={{ minWidth: '25rem' }} header="Authorities List"/>
                  </DataTable>
                  <Dialog visible={editUserDialog} style={{ width: '40vw' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Edit User" modal className="p-fluid" footer={userDialogFooter} onHide={hideDialog}>
                        <Toast ref={dialogToast} />
                        {editUserProgress &&                               
                            <div className='flex align-content-center justify-content-center'>
                                    <ProgressSpinner/>
                            </div>
                        }
                        {!editUserProgress && 
                        <>
                        <div className="field ml-4 mr-4">
                            <label htmlFor="username" className="font-bold">
                              Username*
                            </label>
                            <InputText
                              id="username"
                              value={user.username}
                              disabled
                            />
                          </div>
                        
                          <div className="field ml-4 mr-4">
                            <label htmlFor="password" className="font-bold">
                              New Password
                            </label>
                            <div className="field align-content-right justify-content-right">
                            {!editPassword && 
                              <Button label="Reset Password" className='w-12rem h-3rem'icon="pi pi-check" outlined onClick={e => setEditPassword(prev => true)}/> }
                            {editPassword &&
                            <>
                              <Password
                                id="password"
                                value={user.password}
                                onChange={(e) => onInputChange(e, 'password')}
                                toggleMask
                                className={{ 'p-invalid': (submitted && user.password && user.password.length < 5) || (submitted && user.password && user.password.length > 256 ) 
                                                || (submitted && (user.confirmPassword != user.password))}}
                              />
                              <br></br>
                              <label htmlFor="confirmPassword" className="font-bold">
                                Confirm Password
                               </label>
                              <Password
                              id="confirmPassword"
                              value={user.confirmPassword}
                              onChange={(e) => onInputChange(e, 'confirmPassword')}
                              toggleMask
                              className={{ 'p-invalid': (submitted && user.confirmPassword && user.confirmPassword.length < 5) || (submitted && user.confirmPassword && user.confirmPassword.length > 256 ) 
                                                  || (submitted && (user.confirmPassword != user.password))}}
                            />
                            <br></br>
                           </>
                            
                            }
                            {submitted && user.password && user.password.length > 256 && (
                              <small className="p-error">Password is too long (valid : 5-256 char.)</small>
                            )}
                            {submitted && user.password && user.password.length < 5 && (
                              <small className="p-error">Password is too short (valid : 5-256 char.).</small>
                            )}
                            {submitted && user.password && user.confirmPassword && (user.password != user.confirmPassword) && (
                              <small className="p-error">Password(s) do not match</small>
                            )}
                            </div>
                          </div>
                          {!adminFlag &&
                          <div className="field ml-4 mr-4 mb-4 mt-4 align-content-right justify-content-right text-center" >
                            <span className="font-bold">Account Status: </span>
                            <div className="field align-content-right justify-content-right text-center mt-2">
                              <InputSwitch checked={user.enabled} onChange={(e) => handleToggle(e)} />
                            </div>
                          </div>}

                          <div className="field ml-4 mr-4">
                          <div className="flex flex-column gap-3">
                          {!adminFlag && <span className='font-bold'>Access Rights Selection</span> }
                          {!adminFlag && <span className='font-italic'>Note: both updating and deleting require READ permissions</span> }
                          {!adminFlag && tables.map((item) => {
                            return (               
                              <div className="flex flex-column gap-3" key={item.key}>
                                  <span>{item.name}</span> 
                                  {item.authorities.map(authority => {
                                        return (
                                            <div key={authority.key} className="flex align-items-center">
                                                <Checkbox inputId={item.key + "_" + authority.key} name="authority" value={item.key + "_" + authority.key}  onChange={onCategoryChange} checked={authority.selected}  />
                                                <label htmlFor={item.key + "_" + authority.key} className="ml-2">
                                                    {authority.name}
                                                </label>
                                            </div>
                                        );
                                    })}
                              </div>
                            );
                          })
                          }
                        </div>
                        </div> 
                        </>}
                </Dialog>
                <Dialog visible={userDialog} style={{ width: '40vw' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="New User" modal className="p-fluid" footer={userDialogFooter} onHide={hideDialog}>
                            {newUserProgress && 
                              <div className='flex align-content-center justify-content-center'>
                                <ProgressSpinner/>
                              </div>
                            }
                            {!newUserProgress &&
                            <>
                            <Toast ref={dialogToast} />
                            <div className="field ml-4 mr-4">
                            <label htmlFor="username" className="font-bold">
                              Username*
                            </label>
                            <InputText
                              id="username"
                              value={user.username}
                              onChange={(e) => onInputChange(e, 'username')}
                              required
                              className={{ 'p-invalid': (submitted && !user.username) || (submitted && user.username && user.username.length > 256 ) }}
                            />
                            {submitted && !user.username && <small className="p-error">Username is required.</small>}
                            {submitted && user.username && user.username.length > 256 && (
                              <small className="p-error">Username is too long (valid : 1-256 char.).</small>
                            )}
                          </div>
                        
                          <div className="field ml-4 mr-4">
                            <label htmlFor="password" className="font-bold">
                              Password*
                            </label>
                            <Password
                              id="password"
                              value={user.password}
                              required
                              onChange={(e) => onInputChange(e, 'password')}
                              toggleMask
                              className={{ 'p-invalid': (submitted && user.password && user.password.length < 5) || (submitted && user.password && user.password.length > 256 )}}
                            />
                            {submitted && user.password && user.password.length > 256 && (
                              <small className="p-error">Password is too long (valid : 5-256 char.).</small>
                            )}
                            {submitted && !user.password && <small className="p-error">Password is required.</small>}
                            {submitted && user.password && user.password.length < 5 && (
                              <small className="p-error">Password is too short (valid : 5-256 char.).</small>
                            )}
                          </div>
                          <div className="field ml-4 mr-4">
                          <div className="flex flex-column gap-3">
                          {!adminFlag && <span className='font-bold'>Access Rights Selection</span>}
                          {!adminFlag && <span className='font-italic'>Note: updating and deleting requires READ permissions</span> }
                          {!adminFlag && tables.map((item) => {
                            return (               
                              <div className="flex flex-column gap-3" key={item.key}>
                                  <span>{item.name}</span> 
                                  {item.authorities.map(authority => {
                                        return (
                                            <div key={authority.key} className="flex align-items-center">
                                                <Checkbox inputId={item.key + "_" + authority.key} name="authority" value={item.key + "_" + authority.key}  onChange={onCategoryChange} checked={authority.selected}  />
                                                <label htmlFor={item.key + "_" + authority.key} className="ml-2">
                                                    {authority.name}
                                                </label>
                                            </div>
                                        );
                                    })}
                              </div>
                            );
                          })
                          }
                        </div>
                        </div>
                        </>}
                </Dialog>
                <Dialog visible={deleteUsersDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteusersDialogFooter} onHide={hideDeleteusersDialog}>
                    <div className="confirmation-content flex align-content-center justify-content-center">
                        {deleteProgress && <ProgressSpinner animationDuration=".5s"></ProgressSpinner>}
                        {!deleteProgress &&
                            <>
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {user && <span>Are you sure you want to delete the selected users?</span>}
                            </> 
                        }
                    </div>
                </Dialog>
                </div>
        }
        </>
    );
}
        