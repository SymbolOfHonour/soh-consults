"use client";
import { useEffect } from "react";
import { ADMIN_UPDATES_REFRESH } from "./admin-events";
export default function AdminGalleryRefresh(){useEffect(()=>{const refresh=()=>window.dispatchEvent(new Event(ADMIN_UPDATES_REFRESH));window.addEventListener("focus",refresh);return()=>window.removeEventListener("focus",refresh)},[]);return null;}
