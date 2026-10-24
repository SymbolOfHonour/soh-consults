"use client";
import {useState} from 'react';
export default function PublisherAvatar({name,pictureUrl,className='',portrait=false}:{name:string;pictureUrl?:string;className?:string;portrait?:boolean}){
 const [failed,setFailed]=useState('');
 const safe=pictureUrl&&(/^https:\/\//i.test(pictureUrl)||/^\/(?!\/)/.test(pictureUrl))?pictureUrl:'';
 const initials=name.split(/\s+/).filter(Boolean).slice(0,2).map(p=>Array.from(p)[0]).join('').toUpperCase();
 return <span className={className} style={{position:'relative',overflow:'hidden',display:'inline-flex',alignItems:'center',justifyContent:'center'}}><span aria-hidden="true">{initials}</span>{safe&&failed!==safe&&<img src={safe} alt={portrait?name:''} referrerPolicy="no-referrer" onError={()=>setFailed(safe)} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:'50% 25%'}}/>}</span>;
}
