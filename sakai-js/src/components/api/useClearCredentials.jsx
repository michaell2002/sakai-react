import React, {useContext} from "react";
import UserContext from "../../layout/context/usercontext";
export default function useClearCredentials() {
  const { updateAppUser } = useContext(UserContext);

  const clearCredentials = () => {
    localStorage.clear();
    updateAppUser( {
      username: null,
      authorities : new Set(),
      tokenValue : null,
      expiryDate : null
  });
  };

  return clearCredentials;
}