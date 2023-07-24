import SERVER_PREFIX from '../Domain';
export function fetchPurchaseDocuments ( lazyState, searchValue, filter, tokenValue) {
    const controller = new AbortController();
    setTimeout(() => {
        controller.abort();
    }, 5000);

      return fetch(`${SERVER_PREFIX}/purchasedocument/query?searchValue=${searchValue}&filter=${filter}`, {
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
              throw new Error(`Failed to fetch purchase documents: ${response.status}`);
            }
          }).catch(error => {
            throw error;
          });
    };
    export function fetchPurchaseDocumentsByRefNo (refNo, tokenValue) {
        const controller = new AbortController();
        setTimeout(() => {
            controller.abort();
        }, 5000);
    
          return fetch(`${SERVER_PREFIX}/purchasedocument/query/refNo`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenValue}`,
              },
              //credentials: 'include',
              body: JSON.stringify({query : refNo}),
              signal : controller.signal
            })
              .then((response) => {
                if (response.ok) {
                  return response.json();
                } else if (response.status == 401 || response.status == 403) {
                  throw new Error("Unauthorized");
                } else {
                  throw new Error(`Failed to fetch purchase documents: ${response.status}`);
                }
              }).catch(error => {
                throw error;
              });
        };
    