import React, {useContext} from "react";
import SERVER_PREFIX from "../Domain";
export function createBrand(brand, createBrandController, tokenValue) {
  console.log(brand);
  return fetch(`${SERVER_PREFIX}/brand`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenValue}`
      },
      //credentials: 'include',
      body: JSON.stringify(brand),
      signal: createBrandController.signal
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else if (response.status == 401 || response.status == 403) {
          throw new Error("UNAUTHORIZED");
        } else if (response.status == 409) {
          throw new Error("Brand already exists");
        }
        else {
          throw new Error(`Failed to create brands: ${response.status}`);
        }
      }).catch(error => {
        throw error;
      });
};

export function deleteBrand(brand, deleteBrandController, tokenValue) {
  return fetch(`${SERVER_PREFIX}/brand`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenValue}`
      },
      //credentials: 'include',
      body: JSON.stringify(brand),
      signal: deleteBrandController.signal
    })
      .then((response) => {
        if (response.ok) {
        } else if (response.status == 401 || response.status == 403) {
          throw new Error("Unauthorized");
        }
        else {
          throw new Error(`Failed to create brands: ${response.status}`);
        }
      }).catch(error => {
        throw error;
      });
};

  export function fetchBrands(tokenValue) {
    const controller = new AbortController();
    setTimeout(() => {
        controller.abort();
    }, 5000);
    return fetch(`${SERVER_PREFIX}/brand`, {
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
            throw new Error(`Failed to fetch brands: ${response.status}`);
          }
        }).catch(error => {
          throw error;
        });
  };
  
  export async function fetchFilteredBrands(tokenValue, searchValue) {
    console.log(searchValue)
    const controller = new AbortController();
    setTimeout(() => {
        controller.abort();
    }, 5000);
    return fetch(`${SERVER_PREFIX}/brand/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenValue}`
      },
      //credentials: 'include',
      body : JSON.stringify({query : searchValue}),
      signal : controller.signal
    })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else if (response.status == 401 || response.status == 403) {
            throw new Error("Unauthorized");
          } else {
            throw new Error(`Failed to fetch brands: ${response.status}`);
          }
        }).catch(error => {
          throw error;
        });
  };