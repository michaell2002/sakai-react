import React, { useState, useEffect, useRef, useContext} from 'react';
import SERVER_PREFIX from './Domain';
import ImageContext from '../layout/context/imagecontext';
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
