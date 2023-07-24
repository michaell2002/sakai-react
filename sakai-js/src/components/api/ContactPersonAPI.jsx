import SERVER_PREFIX from '../Domain';
export function fetchContactPersons (lazyState, searchValue, filter, tokenValue) {
  const controller = new AbortController();
  setTimeout(() => {
      controller.abort();
  }, 5000);
  
    return fetch(`${SERVER_PREFIX}/contactpersons/query?searchValue=${searchValue}&filter=${filter}`, {
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
            throw new Error(`Failed to fetch Contact Persons: ${response.status}`);
          }
        }).catch(error => {
          throw error;
        });
  };
  export function updateContactPerson(contactPerson, saveContactPersonController, tokenValue) {
    return fetch(`${SERVER_PREFIX}/contactpersons`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenValue}`,
        },
        //credentials: 'include',
        body: JSON.stringify(contactPerson),
        signal : saveContactPersonController.signal
      })
        .then((response) => {
          if (response.ok) {
          } else if (response.status == 401 || response.status == 403) {
            throw new Error("Unauthorized");
          }
          else {
            throw new Error(`Failed to update Contact Person: ${response.status}`);
          }
        }).catch(error => {
          throw error;
        });
  };
/*
  export function createContactPerson(contactPerson) {
    return fetch(`${SERVER_PREFIX}/contactPerson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactPerson)
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else if (response.status == 401 || response.status == 403) {
            throw new Error("Unauthorized");
          }
          else {
            throw new Error(`Failed to create Contact Person: ${response.status}`);
          }
        });
  };
  export function updateWarehouses(contactpersons) {
    return fetch(`${SERVER_PREFIX}/contactpersons`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactpersons)
      })
        .then((response) => {
          if (response.ok) {
          } else if (response.status == 401 || response.status == 403) {
            throw new Error("Unauthorized");
          }
          else {
            throw new Error(`Failed to update contact persons: ${response.status}`);
          }
        });
  };
  */