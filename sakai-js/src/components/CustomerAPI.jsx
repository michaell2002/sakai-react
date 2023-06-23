import SERVER_PREFIX from './Domain';
export function fetchClients ( lazyState, searchValue, filter) {
    return fetch(`${SERVER_PREFIX}/client/query?searchValue=${searchValue}&filter=${filter}`, {
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
            throw new Error("should log off");
          } else {
            throw new Error(`Failed to fetch clients: ${response.status}`);
          }
        });
  };

  export function createClient(client) {
    console.log(client);
    return fetch(`${SERVER_PREFIX}/client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(client)
      })
        .then((response) => {
          if (response.ok) {
            return response.json(); //only do this if you return an object
          } else if (response.status == 401 || response.status == 403) {
            throw new Error("should log off");
          }
          else {
            throw new Error(`Failed to create clients: ${response.status}`);
          }
        });
  };
  export function updateClient(client) {
    return fetch(`${SERVER_PREFIX}/client`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(client)
      })
        .then((response) => {
          if (response.ok) {
          } else if (response.status == 401 || response.status == 403) {
            throw new Error("should log off");
          }
          else {
            throw new Error(`Failed to update clients: ${response.status}`);
          }
        });
  };
  export function deleteClients(selectedCustomersId) {
    return fetch(`${SERVER_PREFIX}/client`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedCustomersId)
      })
      .then((response) => {
        if (response.ok) {
        } else if (response.status == 401 || response.status == 403) {
          throw new Error("should log off");
        }
        else {
          throw new Error(`Failed to delete clients: ${response.status}`);
        }
      });
  };