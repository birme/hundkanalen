import Script from 'next/script';

const umamiScriptUrl = 'https://birme-hundkanalenstats.umami-software-umami.auto.prod-se.osaas.io/script.js';
const websiteId = '3ab03276-8a81-44f0-b4e7-f1cedd9406fb';

export default function UmamiAnalytics() {
  return (
    <Script
      defer
      src={umamiScriptUrl}
      data-website-id={websiteId}
      strategy="afterInteractive"
    />
  );
}
