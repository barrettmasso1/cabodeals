import Script from "next/script"

/**
 * Brief §8. Event names match cabogolf so both brands land in one funnel report; the events
 * themselves are already fired by lib/track.ts and the form's tracker.
 *
 * Each container only renders when its id is set, so the site runs clean until the ids land:
 *   NEXT_PUBLIC_GTM_ID          GA4 via Google Tag Manager
 *   NEXT_PUBLIC_META_PIXEL_ID   Meta pixel (CAPI is server-side, set up in GHL)
 *   NEXT_PUBLIC_CLARITY_ID      Microsoft Clarity — the grid and the form
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
