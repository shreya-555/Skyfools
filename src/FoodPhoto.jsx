import React, {useState} from 'react';
import {photos,itemPhotos} from './photos';

export default function FoodPhoto({item}){
  const [failed,setFailed]=useState(false);
  const photo=photos[itemPhotos[item.id]];
  return <div className="food-art food-photo">
    {!failed?<img src={photo.file} alt={photo.alt} loading="lazy" decoding="async" draggable="false" onError={()=>setFailed(true)}/>:<div className="photo-error">Photograph unavailable</div>}
  </div>;
}
