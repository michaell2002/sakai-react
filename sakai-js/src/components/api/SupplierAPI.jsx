import SERVER_PREFIX from '../Domain';
  export function fetchSuppliers ( lazyState, searchValue, filter, tokenValue) {
    const controller = new AbortController();
    setTimeout(() => {
        controller.abort();
    }, 5000);

      return fetch(`${SERVER_PREFIX}/supplier/query?searchValue=${searchValue}&filter=${filter}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenValue}`,
          },
          //credentials: 'include',
          body: JSON.stringify(lazyState),
          signal : controller.signal
        })
          .then((response) => {
            console.log(response);
            if (response.ok) {
              return response.json();
            } else if (response.status == 401 || response.status == 403) {
              throw new Error("Unauthorized");
            } else {
              throw new Error(`Failed to fetch suppliers: ${response.status}`);
            }
          }).catch(error => {
            throw error;
          });
    };

  export function createSupplier(supplier, saveSupplierController, tokenValue) {
    return fetch(`${SERVER_PREFIX}/supplier`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenValue}`,

        },
        //credentials: 'include',
        body: JSON.stringify(supplier),
        signal : saveSupplierController.signal
      })
      .then((response) => {
        if (response.ok) {
        } else if (response.status == 401 || response.status == 403) {
          throw new Error("Unauthorized");
        } else if (response.status == 409) {
          throw new Error("Supplier's name already exists");
        }
        else {
          throw new Error(`Failed to create supplier: ${response.status}`);
        }
      }).catch(error => {
        throw error;
      });
  };
  export function updateSupplier(supplier, saveSupplierController, tokenValue) {
    return fetch(`${SERVER_PREFIX}/supplier`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenValue}`,

        },
        //credentials: 'include',
        body: JSON.stringify(supplier),
        signal : saveSupplierController.signal
      })
        .then((response) => {
          if (response.ok) {
          } else if (response.status == 401 || response.status == 403) {
            throw new Error("Unauthorized");
          } else if (response.status == 409) {
            throw new Error("Supplier's name already exists");
          }
          else {
            throw new Error(`Failed to update supplier: ${response.status}`);
          }
        }).catch(error => {
          throw error;
        });
  };
  export function deleteSuppliers(selectedSuppliersId, deleteSuppliersController, tokenValue) {
    return fetch(`${SERVER_PREFIX}/supplier`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenValue}`,
        },
        //credentials: 'include',
        body: JSON.stringify(selectedSuppliersId),
        signal : deleteSuppliersController.signal
      })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else if (response.status == 401 || response.status == 403) {
          throw new Error("Unauthorized");
        } 
        else {
          throw new Error(`Failed to delete supplier: ${response.status}`);
        }
      }).catch(error => {
        throw error;
      });
  };