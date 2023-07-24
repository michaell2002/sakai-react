import SERVER_PREFIX from '../Domain';
export function fetchProducts ( lazyState, searchValue, filter, tokenValue) {
  const controller = new AbortController();
  setTimeout(() => {
      controller.abort();
  }, 5000);

    return fetch(`${SERVER_PREFIX}/product/query?searchValue=${searchValue}&filter=${filter}`, {
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
            throw new Error(`Failed to fetch products: ${response.status}`);
          }
        }).catch(error => {
          throw error;
        });
  };

  export function createProduct(product, saveProductController, tokenValue) {
    return fetch(`${SERVER_PREFIX}/product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenValue}`,

        },
        //credentials: 'include',
        body: JSON.stringify(product),
        signal : saveProductController.signal
      })
      .then((response) => {
        if (response.ok) {
        } else if (response.status == 401 || response.status == 403) {
          throw new Error("Unauthorized");
        }
        else {
          throw new Error(`Failed to create product: ${response.status}`);
        }
      }).catch(error => {
        throw error;
      });
  };
  export function updateProduct(product, saveProductController, tokenValue) {
    return fetch(`${SERVER_PREFIX}/product`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenValue}`,

        },
        //credentials: 'include',
        body: JSON.stringify(product),
        signal : saveProductController.signal
      })
        .then((response) => {
          if (response.ok) {
          } else if (response.status == 401 || response.status == 403) {
            throw new Error("Unauthorized");
          } else if (response.status == 409) {
            throw new Error("Product Code already exists");
          }
          else {
            throw new Error(`Failed to update product: ${response.status}`);
          }
        }).catch(error => {
          throw error;
        });
  };
  export function deleteProducts(selectedProductsId, deleteProductsController, tokenValue) {
    return fetch(`${SERVER_PREFIX}/product`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenValue}`,
        },
        //credentials: 'include',
        body: JSON.stringify(selectedProductsId),
        signal : deleteProductsController.signal
      })
      .then((response) => {
        if (response.ok) {
        } else if (response.status == 401 || response.status == 403) {
          throw new Error("Unauthorized");
        } else if (response.status == 409) {
          throw new Error("Product Code already exists");
        }
        else {
          throw new Error(`Failed to delete product: ${response.status}`);
        }
      }).catch(error => {
        throw error;
      });
  };