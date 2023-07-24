import SERVER_PREFIX from "../Domain";
export function fetchCompany(tokenValue) {
  const controller = new AbortController();
  setTimeout(() => {
      controller.abort();
  }, 5000);

    return fetch(`${SERVER_PREFIX}/company`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenValue}`,
      },
      //credentials: 'include',
      signal : controller.signal
    })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else if (response.status == 401 || response.status == 403) {
            throw new Error("Unauthorized");
          } else {
            throw new Error(`Failed to fetch company: ${response.status}`);
          }
        }).catch(error => {
          throw error;
        });
  };

  export function updateCompany(company, saveProfileController, tokenValue) {
    return fetch(`${SERVER_PREFIX}/company`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenValue}`
        },
        //credentials: 'include',
        body: JSON.stringify(company),
        signal : saveProfileController.signal
      })
        .then((response) => {
          console.log("COMPANY " + response);

          if (response.ok) {
          } else if (response.status == 401 || response.status == 403) {
            throw new Error("Unauthorized");
          }
          else {
            throw new Error(`Failed to update company: ${response.status}`);
          }
        }).catch(error => {
          throw error;
        });
  };

  export function updateWarehouses(warehouses, saveProfileController, tokenValue) {
    return fetch(`${SERVER_PREFIX}/warehouse`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenValue}`
        },
        //credentials: 'include',
        body: JSON.stringify(warehouses),
        signal : saveProfileController.signal
      })
        .then((response) => {
          if (response.ok) {
          } else if (response.status == 401 || response.status == 403) {
            throw new Error("Unauthorized");
          }
          else {
            throw new Error(`Failed to update warehouses: ${response.status}`);
          }
        }).catch(error => {
          throw error;
        });
  };

  export function fetchWarehouses(tokenValue) {
    const controller = new AbortController();
    setTimeout(() => {
        controller.abort();
    }, 5000);

    return fetch(`${SERVER_PREFIX}/warehouse`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenValue}`
      },
      //credentials: 'include',
      signal : controller.signal
    })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else if (response.status == 401 || response.status == 403) {
            throw new Error("Unauthorized");
          } else {
            throw new Error(`Failed to fetch warehouses: ${response.status}`);
          }
        }).catch(error => {
          throw error;
        });
  };