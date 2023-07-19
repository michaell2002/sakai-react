import React, {useContext} from "react";
import UserContext from "../../layout/context/usercontext";
export default function ClearCredentials() {
    console.log("CLEAR CREDENTIALS");
    localStorage.clear();
    const {appUser, updateAppUser} = useContext(UserContext);
    updateAppUser({
                    username: null,
                    authorities : new Set(),
                    tokenValue : null,
                    expiryDate : null
                  });
}