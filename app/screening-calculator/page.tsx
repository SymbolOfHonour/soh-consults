import { withPublicSocial } from "../../lib/public-metadata";
import InstitutionPicker from "./InstitutionPicker";
export const metadata = withPublicSocial({
  title: "Post-UTME Screening Aggregate Calculator | S.O.H CONSULTS",
  description: "Find your school and calculate your Post-UTME screening or admission aggregate.",
  alternates: { canonical: "/screening-calculator" },
});
export default function ScreeningCalculatorHub() { return <InstitutionPicker />; }

