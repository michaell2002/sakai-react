import SERVER_PREFIX from '../Domain';
export function fetchClients ( lazyState, searchValue, filter, tokenValue) {
  const controller = new AbortController();
  setTimeout(() => {
      controller.abort();
  }, 5000);

    return fetch(`${SERVER_PREFIX}/client/query?searchValue=${searchValue}&filter=${filter}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenValue}`
        },
        //credentials: 'include',
        body: JSON.stringify(lazyState),
        signal : controller.signal
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else if (response.status == 401 || response.status == 403) {
            throw new Error("Unauthorized");
          } else {
            throw new Error(`Failed to fetch customers: ${response.status}`);
          }
        }).catch(error => {
          throw error;
        });
  };

  export function createClient(client, saveCustomerController, tokenValue) {
    return fetch(`${SERVER_PREFIX}/client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenValue}`
        },
        //credentials: 'include',
        body: JSON.stringify(client),
        signal: saveCustomerController.signal
      })
        .then((response) => {
          if (response.ok) {
          } else if (response.status == 401 || response.status == 403) {
            throw new Error("Unauthorized");
          } else if (response.status == 409) {
            throw new Error("Customer Name already exists");
          }
          else {
            throw new Error(`Failed to create customers: ${response.status}`);
          }
        }).catch(error => {
          throw error;
        });
  };
  export function updateClient(client, saveCustomerController, tokenValue) {
    return fetch(`${SERVER_PREFIX}/client`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenValue}`
        },
        //credentials: 'include',
        body: JSON.stringify(client),
        signal: saveCustomerController.signal
      })
        .then((response) => {
          if (response.ok) {
          } else if (response.status == 401 || response.status == 403) {
            throw new Error("Unauthorized");
          } else if (response.status == 409) {
            throw new Error("Customer Name already exists");
          }
          else {
            throw new Error(`Failed to update customers: ${response.status}`);
          }
        }).catch(error => {
          throw error;
        });
  };
  export function deleteClients(selectedCustomersId, deleteClientsController, tokenValue) {
    return fetch(`${SERVER_PREFIX}/client`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenValue}`

        },
        //credentials: 'include',
        body: JSON.stringify(selectedCustomersId),
        signal: deleteClientsController.signal
      })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else if (response.status == 401 || response.status == 403) {
          throw new Error("Unauthorized");
        }
        else {
          throw new Error(`Failed to delete customers: ${response.status}`);
        }
      }).catch(error => {
        throw error;
      });
  };