import SERVER_PREFIX from './Domain';
export function fetchSuppliers ( lazyState, searchValue, filter) {
    return fetch(`${SERVER_PREFIX}/supplier/query?searchValue=${searchValue}&filter=${filter}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lazyState)
      })
        .then((response) => {
          console.log(response);
          if (response.ok) {
            return response.json();
          } else if (response.status == 401 || response.status == 403) {
            throw new Error("should log off");
          } else {
            throw new Error(`Failed to fetch suppliers: ${response.status}`);
          }
        });
  };

  export function createSupplier(supplier) {
    console.log(supplier);
    return fetch(`${SERVER_PREFIX}/supplier`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(supplier)
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else if (response.status == 401 || response.status == 403) {
            throw new Error("should log off");
          }
          else {
            throw new Error(`Failed to create supplier: ${response.status}`);
          }
        });
  };
  export function updateSupplier(supplier) {
    console.log(supplier);
    return fetch(`${SERVER_PREFIX}/supplier`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(supplier)
      })
        .then((response) => {
          if (response.ok) {
          } else if (response.status == 401 || response.status == 403) {
            throw new Error("should log off");
          }
          else {
            throw new Error(`Failed to update supplier: ${response.status}`);
          }
        });
  };
  export function deleteSuppliers(selectedSuppliersId) {
    return fetch(`${SERVER_PREFIX}/supplier`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedSuppliersId)
      })
      .then((response) => {
        if (response.ok) {
        } else if (response.status == 401 || response.status == 403) {
          throw new Error("should log off");
        }
        else {
          throw new Error(`Failed to delete supplier: ${response.status}`);
        }
      });
  };