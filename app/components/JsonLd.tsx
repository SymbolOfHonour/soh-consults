import { headers } from "next/headers";
export default async function JsonLd({data}:{data:unknown}) {
 const nonce=(await headers()).get("x-nonce")||undefined;
 return <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data).replace(/</g,"\\u003c")}}/>;
}
