const compression = require( "compression" ),
    express = require( "express" ),
    path = require( "path" ),
    app = express(),
    handelbars = require( 'express-handlebars' ),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser');

let apiUri = "https://datagrowdockerapi.azurewebsites.net";

if ( process.env.dg_env === "beta" ) {
  apiUri = "https://betaapi.mydatagrows.com";
} else if ( process.env.dg_env === "dev" ) {
  apiUri = "http://localhost:8080";
}

const hbs = handelbars.create({
    // Specify helpers which are only registered on this instance.
    helpers: {
      section( name, options ) { 
         if (!this._sections) this._sections = {};
         this._sections[name] = options.fn(this); 
         return null;
       }
    }
});

app.engine('handlebars', hbs.engine );
app.set('view engine', 'handlebars');
app.set('views', './views');

app
  .use( bodyParser.json() )
  .use( bodyParser.urlencoded({ extended: true }) )
  .use( cookieParser() )
  .use( compression() )
  
  .use( (req, res, next) => {
    res.header( 'X-Frame-Options', "SAMEORIGIN" );
    res.header( 'Content-Security-Policy', "frame-ancestors 'none'" );
    // Pass to next layer of middleware
    next();
  } )
  .get("/config.js", (req, res) => {
    res.sendFile(path.resolve(__dirname, "gt-config.js"));
  } )
  .get("/manifest.json", (req, res) => {
    res.sendFile(path.resolve(__dirname, "manifest.json"));
  } )
  .get("/service-worker.js", (req, res) => {
    res.sendFile(path.resolve(__dirname, "service-worker.js"));
  } )
  
  .use( "/assets", express.static( path.resolve( __dirname, "assets" ) ) )
  .use( "/src", express.static( path.resolve( __dirname, "src" ) ) )
  .use( "/styles", express.static( path.resolve( __dirname, "public/css" ) ) )
  .use( "/js", express.static( path.resolve( __dirname, "public/js" ) ) )
  .use( "/img", express.static( path.resolve( __dirname, "public/img" ) ) )
  .use( "/fonts", express.static( path.resolve( __dirname, "public/fonts" ) ) )
  .use( "/dist", express.static( path.resolve( __dirname, "dist" ) ) )
  .use( "/views", express.static( path.resolve( __dirname, "views" ) ) )
  .use( "/modules", express.static( path.resolve( __dirname, "node_modules" ) ) )
  .use( "/robots.txt", express.static( path.resolve( __dirname, "robots.txt" ) ) )

  .get('/*', (req, res) => {
    let preload = [
        '</styles/main.css>; rel=preload; as=style',
        '</js/jquery.min.js>; rel=preload; as=script',
        '</js/index.min.js>; rel=preload; as=script',
        '</js/accounting-template.min.js>; rel=preload; as=script',
        '</img/Logo_Full.svg>; rel=preload; as=image'
      ]

    res.header( 'Link', preload.join(', ') );

    res.render('templates/crm/accounting', {
      showNav: true, showFooter: true, track: true
    } );
  });

if ( process.env.dg_env !== "dev" ) {
  app
    .listen( process.env.PORT || 8080, () => console.log("Server running...") );
} else {
  const spdy = require("spdy"),
    fs = require('fs'),
    options = {
        pfx: fs.readFileSync('C:/certs/dgui.local.pfx'),
        passphrase: 'DFDSF(*^(^'
      },
    server = spdy.createServer(options, app);

  server.listen( 443, () => {
    console.log('HTTPS server listening on port 443');
  } );
}