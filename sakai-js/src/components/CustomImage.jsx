import React, { useState, useEffect, useRef, useContext} from 'react';
import SERVER_PREFIX from './Domain';
import ImageContext from '../layout/context/imagecontext';
import UserContext from '../layout/context/usercontext';
/*
export default function CustomImage({width, height}) {
    const { contextValue, updateContextValue } = useContext(ImageContext);
    const [imgsrc, setImgSrc] = useState(`${SERVER_PREFIX}/company/image?timestamp=${new Date().getTime()}`);
    useEffect(() => {
        setImgSrc(prev => `${SERVER_PREFIX}/company/image?timestamp=${new Date().getTime()}`)
    }, [contextValue])
return (
        <img src={imgsrc} alt="Company Logo" style={{height: height + "rem", width: width + "rem"}}/>
);
} 
*/

export default function CustomImage({ width, height }) {
    const { contextValue, updateContextValue } = useContext(ImageContext);
    const {appUser} = useContext(UserContext)
    const [imgsrc, setImgSrc] = useState(``);
  
    useEffect(() => {
      const fetchImage = async () => {
        try {
          const response = await fetch(`${SERVER_PREFIX}/company/image?timestamp=${new Date().getTime()}`, {
            method: 'GET',
            headers: {
              Authorization: 'Bearer ' + appUser.tokenValue,
            },
          });
  
          if (response.ok) {
            const blob = await response.blob();
            const imageURL = URL.createObjectURL(blob);
            setImgSrc(prev => imageURL);
          } else if (response.status == 401 || response.status == 403) {
            throw new Error("should log off");
          } else  {
            console.error('Failed to fetch image:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('Error fetching image:', error);
        }
      };
  
      fetchImage();
    }, [contextValue, appUser]);
  
    return (
      <img src={imgsrc} alt="Company Logo" style={{ height: height + 'rem', width: width + 'rem' }} />
    );
  }
