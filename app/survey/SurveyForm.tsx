"use client";
import {useEffect,useRef} from "react";
import {surveyMarkup} from "../../lib/survey-markup";
import {initializeSurvey} from "../../lib/survey-client";
export default function SurveyForm(){
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(root.current)return initializeSurvey(root.current)},[]);
 return <div ref={root} className="survey-layout" dangerouslySetInnerHTML={{__html:surveyMarkup}}/>;
}
