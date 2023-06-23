import SERVER_PREFIX from "./Domain";
export function fetchCompany() {
    return fetch(`${SERVER_PREFIX}/company`)
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else if (response.status == 401 || response.status == 403) {
            throw new Error("should log off");
          } else {
            throw new Error(`Failed to fetch company: ${response.status}`);
          }
        });
  };

  export function updateCompany(company) {
    return fetch(`${SERVER_PREFIX}/company`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(company)
      })
        .then((response) => {
          if (response.ok) {
          } else if (response.status == 401 || response.status == 403) {
            throw new Error("should log off");
          }
          else {
            throw new Error(`Failed to update company: ${response.status}`);
          }
        });
  };

  export function updateWarehouses(warehouses) {
    return fetch(`${SERVER_PREFIX}/warehouse`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(warehouses)
      })
        .then((response) => {
          if (response.ok) {
          } else if (response.status == 401 || response.status == 403) {
            throw new Error("should log off");
          }
          else {
            throw new Error(`Failed to update warehouses: ${response.status}`);
          }
        });
  };

  export function fetchWarehouses() {
    return fetch(`${SERVER_PREFIX}/warehouse`)
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else if (response.status == 401 || response.status == 403) {
            throw new Error("should log off");
          } else {
            throw new Error(`Failed to fetch warehouses: ${response.status}`);
          }
        });
  };