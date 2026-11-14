/**
 * Language gateway: static hosting cannot negotiate, so a tiny inline script picks
 * the saved preference (or the browser language) and replaces the URL. Links remain for no-JS.
 */
const B = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const script = `(function(){try{var s=localStorage.getItem('hotel100.lang');var l=s==='fr'||s==='en'?s:((navigator.languages&&navigator.languages[0])||navigator.language||'en').slice(0,2).toLowerCase()==='fr'?'fr':'en';location.replace('${B}/'+l+'/'+location.hash);}catch(e){location.replace('${B}/en/');}})();`;

export default function Gateway() {
  return (
    <main className="gateway">
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <p className="gateway__brand">100 Hours of Agentic AI</p>
      <p className="gateway__links">
        <a href={`${B}/en/`} hrefLang="en">Enter in English</a>
        <a href={`${B}/fr/`} hrefLang="fr" lang="fr">Entrer en français</a>
      </p>
    </main>
  );
}
