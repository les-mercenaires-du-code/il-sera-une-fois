import serialize from 'serialize-javascript';

export default function getHtml(context, markup, scriptTags) {

  return `
    <!DOCTYPE html>
    <html lang="fr" xml:lang="fr" xmlns="http://www.w3.org/1999/xhtml" dir="ltr">
      <head>
        <title>express react server side rendering</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
        <meta name="Description" content="express react server side rendering">
        <meta name="theme-color" content="#ffffff">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
        <link rel="manifest" href="/site.webmanifest">
        <meta name="msapplication-TileColor" content="#da532c">

        <script>window.__DYNAMIC_ROUTES__ = ${serialize(context.dynamicRoutes)}</script>
        <script>window.__STATIC_DATA__ = ${serialize(context.staticData)}</script>
      </head>

      <body>
        <div id="app">${markup}</div>
        ${scriptTags}
      </body>
    </html>
  `;
}
