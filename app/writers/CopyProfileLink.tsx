"use client";
import {useState} from 'react';
import styles from './publisher.module.css';
export default function CopyProfileLink(){const [message,setMessage]=useState('');async function copy(){try{await navigator.clipboard.writeText(window.location.origin+window.location.pathname);setMessage('Profile link copied.')}catch{setMessage('Copy this profile’s link from your address bar.')}}return <div className={styles.share}><button type="button" onClick={()=>void copy()}>↥ Share profile</button><span role="status">{message}</span></div>}
