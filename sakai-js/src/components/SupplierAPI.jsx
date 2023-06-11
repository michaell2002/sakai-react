const SERVER_PREFIX = "http://localhost:8080";
export function fetchSuppliers ( lazyState, searchValue) {
    return fetch(`${SERVER_PREFIX}/supplier/query?searchValue=${searchValue}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lazyState)
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else if (response.status == 401 || response.status == 403) {
            console.log("should log off");
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
            return response.json(); //only do this if you return an object
          } else if (response.status == 401 || response.status == 403) {
            console.log("should log off");
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
            console.log("should log off");
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
          console.log("should log off");
        }
        else {
          throw new Error(`Failed to delete supplier: ${response.status}`);
        }
      });
  };