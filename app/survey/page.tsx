import type {Metadata} from "next";
import DiscoveryHeader from "../components/DiscoveryHeader";
import SurveyForm from "./SurveyForm";
import "./survey.css";
export const metadata:Metadata={title:"Your voice, our next step",description:"Help shape the future of S.O.H CONSULTS.",alternates:{canonical:"/survey"}};
export default function SurveyPage(){return <><DiscoveryHeader/><main className="soh-survey flex-1"><SurveyForm/><p className="mx-auto max-w-6xl px-6 pb-8 text-xs">S.O.H CONSULTS · Community feedback · Community survey</p></main></>}
