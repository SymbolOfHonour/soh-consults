/** Cloudflare's documented per-address opt-out preserves links under nonce CSP. */
export default function EmailObfuscationBoundary({end=false}:{end?:boolean}) {
 return <span aria-hidden="true" dangerouslySetInnerHTML={{__html:end?"<!--/email_off-->":"<!--email_off-->"}}/>;
}
