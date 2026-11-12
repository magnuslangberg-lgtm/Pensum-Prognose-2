import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="no">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Merriweather+Sans:wght@300;400;500;600;700;800&family=Open+Sans:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <style>{`
          * { font-family: 'Merriweather Sans', sans-serif !important; }
          /* Forhåndsvisningen av investeringsforslaget bruker skriftene i selskapsmalen. */
          [data-forslag-lysbilde] .forslag-sans, [data-forslag-lysbilde] .forslag-sans * { font-family: 'Open Sans', Arial, sans-serif !important; }
          [data-forslag-lysbilde] .forslag-lett, [data-forslag-lysbilde] .forslag-lett * { font-family: 'Open Sans', Arial, sans-serif !important; }
          [data-forslag-lysbilde] .forslag-serif, [data-forslag-lysbilde] .forslag-serif * { font-family: Georgia, 'Times New Roman', serif !important; }
        `}</style>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
