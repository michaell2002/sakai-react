import SERVER_PREFIX from './Domain';
export function fetchContactPersons ( lazyState, searchValue, filter) {
    return fetch(`${SERVER_PREFIX}/contactpersons/query?searchValue=${searchValue}&filter=${filter}`, {
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
            throw new Error(`Failed to fetch Contact Persons: ${response.status}`);
          }
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
            throw new Error("should log off");
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
            throw new Error("should log off");
          }
          else {
            throw new Error(`Failed to update contact persons: ${response.status}`);
          }
        });
  };
  */