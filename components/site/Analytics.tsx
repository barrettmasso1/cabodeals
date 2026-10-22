import Script from "next/script"

/**
 * Tracking, for both brands. Event names are identical on cabogolf and cabodeals (brief §8),
 * so the two land in one funnel report.
 *
 * Every tag is driven by an env var and renders nothing when it is absent — local and preview
 * builds stay out of the production data. Nothing here is hardcoded.
 *
 *   NEXT_PUBLIC_GTM_ID          GTM-KGZZ8J7J, the same container on both sites
 *   NEXT_PUBLIC_META_PIXEL_ID   559021177260287, the same pixel on both sites
 *   NEXT_PUBLIC_CLARITY_ID      a different id per site: cabogolf yzd8qx6tlt, cabodeals z1hyt76fci
 *
 * The pixel lives here rather than in GTM on purpose: the server-side Lead in lib/metaCapi.ts
 * has to share an event_id with the browser event so Meta deduplicates them, and threading
 * that id through a tag manager is needless work.
 */
export function Analytics() {
  const gtm = process.env.NEXT_PUBLIC_GTM_ID
  const pixel = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const clarity = process.env.NEXT_PUBLIC_CLARITY_ID

  return (
    <>
      {gtm && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      )}

      {pixel && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}
        </Script>
      )}

      {clarity && (
        <Script id="clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarity}");`}
        </Script>
      )}
    </>
  )
}

/**
 * The no-JS halves. These are plain markup, not scripts, and GTM's iframe has to be the FIRST
 * thing inside <body> or it does not fire for visitors without JavaScript — which is why this
 * is a separate component from the scripts above.
 */
export function TrackingNoScript() {
  const gtm = process.env.NEXT_PUBLIC_GTM_ID
  const pixel = process.env.NEXT_PUBLIC_META_PIXEL_ID

  return (
    <>
      {gtm && (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtm}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
      )}
      {pixel && (
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element -- Meta's documented no-JS fallback */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${pixel}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      )}
    </>
  )
}
