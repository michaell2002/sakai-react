import SERVER_PREFIX from '../Domain';
export function fetchUsers ( lazyState, searchValue, tokenValue) {
  const controller = new AbortController();
  setTimeout(() => {
      controller.abort();
  }, 5000);

    return fetch(`${SERVER_PREFIX}/user/query?searchValue=${searchValue}`, {
        method: 'POST',
        //credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenValue}`,
        },
        credentials: 'include',
        body: JSON.stringify(lazyState),
        signal : controller.signal
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else if (response.status == 401 || response.status == 403) {
            throw new Error("Unauthorized");
          } else {
            throw new Error(`Failed to fetch users: ${response.status}`);
          }
        }).catch(error => {
          throw error;
        });
  };

  export function createUser(user, saveUserController, tokenValue) {
    return fetch(`${SERVER_PREFIX}/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenValue}`,

        },
        credentials: 'include',
        body: JSON.stringify(user),
        signal: saveUserController.signal
      })
        .then((response) => {
          if (response.ok) {
          } else if (response.status == 401 || response.status == 403) {
            throw new Error("Unauthorized");
          } else if (response.status == 422) {
            throw new Error("User already exists");
          }
          else {
            throw new Error(`Failed to create user: ${response.status}`);
          }
        }).catch(error => {
          throw error;
        });
  };
  export function updateUser(user, saveUserController, tokenValue) {
    return fetch(`${SERVER_PREFIX}/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenValue}`,

        },
        credentials: 'include',
        body: JSON.stringify(user),
        signal: saveUserController.signal
      })
        .then((response) => {
          if (response.ok) {
          } else if (response.status == 401 || response.status == 403) {
            throw new Error("Unauthorized");
          }
          else {
            throw new Error(`Failed to update user: ${response.status}`);
          }
        }).catch(error => {
          throw error;
        });
  };
  export function deleteUsers(selectedUsersId, deleteUserController, tokenValue) {
    return fetch(`${SERVER_PREFIX}/user`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenValue}`,

        },
        credentials: 'include',
        body: JSON.stringify(selectedUsersId),
        signal : deleteUserController.signal
      })
      .then((response) => {
        if (response.ok) {
        } else if (response.status == 401 || response.status == 403) {
          throw new Error("Unauthorized");
        }
        else {
          throw new Error(`Failed to delete user: ${response.status}`);
        }
      }).catch(error => {
        throw error;
      });
  };
  export async function Login(username, password, updateAppUser) {
    
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, 5000)
      
      const loginResult = await fetch(`${SERVER_PREFIX}/login`, {
        method: 'POST',
        //credentials: 'include',
        
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({username : username.trim(), password : password.trim()}),
        signal : controller.signal
      })
        .then((response) => {
            clearTimeout(timeout);
            if (response.ok) {
                return response.json().then(jwt => {
                    updateAppUser({username : jwt.claims.username, authorities : new Set(jwt.claims.scope.trim().split(" ")), tokenValue : jwt.tokenValue, expiryDate : jwt.claims.exp });
                    return jwt.tokenValue;
                });
            } else {
                throw new Error(`Failed to Login: ${response.status}`);
            }
        }).catch(error => {
          clearTimeout(timeout);
          throw error;
        });
        return loginResult;
  }
  /*
  export async function refreshToken(tv, updateAppUser, controller) {
    console.log("1")
    const refreshResult = await fetch(`${SERVER_PREFIX}/refresh`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${tv}`,
                              },
                              body: JSON.stringify({tokenValue : tv}),
                              signal : controller.signal
                            })
                            .then((response) => {
                                console.log("2")
                                console.log("YEE");
                                //clearTimeout(timeout);
                                if (response.ok) {
                                    return response.json().then(jwt => {
                                        const appUser = localStorage.getItem("appUser") != null ? JSON.parse(localStorage.getItem("appUser")) : null; //check invariant
                                        if (appUser != null && appUser.username != null && appUser.username != undefined && jwt.claims.username == appUser.username) {
                                          updateAppUser({username : jwt.claims.username, authorities : new Set(jwt.claims.scope.trim().split(" ")), tokenValue : jwt.tokenValue, expiryDate : jwt.claims.exp });
                                          return jwt.tokenValue;
                                        } else {
                                          return null;
                                        }
                                    })
                                } else {
                                    throw new Error(`Failed to Login: ${response.status}`);
                                }
                            }).catch(error => {
                              throw error;
                            });
      return refreshResult;
}
*/
export function refreshTokenUpdated(tv, updateAppUser, controller) {
    return fetch(`${SERVER_PREFIX}/refresh`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${tv}`,
                            },
                            credentials: 'include',
                            body: JSON.stringify({tokenValue : tv}),
                            signal : controller.signal
                          })
                          .then((response) => {
                              if (response.ok) {
                                   response.json().then(jwt => {
                                      const appUser = localStorage.getItem("appUser") != null ? JSON.parse(localStorage.getItem("appUser")) : null; //check invariant
                                      if (appUser.expiryDate != null && appUser.username != null && jwt.claims.username == appUser.username && Date.parse(jwt.claims.exp) > Date.parse(appUser.expiryDate)) {
                                        updateAppUser({username : jwt.claims.username, authorities : new Set(jwt.claims.scope.trim().split(" ")), tokenValue : jwt.tokenValue, expiryDate : jwt.claims.exp });
                                      } 
                                    })
                              } else {
                                  throw new Error(`Failed to Login: ${response.status}`);
                              }
                          }).catch(error => {
                            throw error;
                          });
}