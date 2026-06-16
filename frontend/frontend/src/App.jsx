import { useState, useRef, useEffect, useCallback } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhYzM1M2QwMDNiOWExODNiZjE0NDI1OGJhOWU3ZjMxYyIsIm5iZiI6MTc4MDcwODAyMS4wMDE5OTk5LCJzdWIiOiI2YTIzNzJiNDIyNDVmZTQzNzQ4ZGQxYmYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.TFI6fd9DYZlQiQ7PTsKF5PIOTl6Cf6riJf8Lj3OnLDE";
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/w300";
const OTP_URL = ""; // mismo servidor: backend y frontend unidos
const WA_NUMBER = "573223071283";
const WA_DISPLAY = "3223071283";
const LOGO_URL = "/images/logo.png";
const PAGO_NUMERO = "3052308374";
const RULETA_CODE = "DMJUN2026";

const formatPrice = p => `$${p.toLocaleString("es-CO")}`;

// ─── IMÁGENES ─────────────────────────────────────────────────────────────────
const IMG = {
  netflix: "/images/netflix1mes.png",
  spotify: "https://imgproxy.treinta.co/sig/size:384:::/quality:75/plain/https%3A%2F%2Fcdn.treinta.co%2Fweb-app%2Finventory%2Fc4e07ae4-dd7c-53a3-a327-e8ff0e863ad1%2F2299f05c-3877-5d52-a1df-27a2ac424e82.png",
  youtube: "/images/youtube.png",
  disneyStd: "/images/disneyStd.png",
  disneyPrem: "/images/disneyPrem.png",
  hbo: "/images/hbo.png",
  prime: "/images/prime.png",
  paramount: "/images/paramount.png",
  crunchyroll: "/images/crunchyroll.png",
  vix: "/images/vix.png",
  plex: "/images/plex.png",
  jellyfin: "/images/jellyfin.png",
  appletv: "/images/appletv.png",
  canva: "/images/canva.png",
  playstation: "/images/playstation.png",
  win: "/images/win.png",
  directv: "/images/directv.png",
  iptv: "/images/iptv.png",
  office: "/images/office.png",
  combo2: "/images/combo2.png",
  combo3: "/images/combo3.png",
  combo4: "/images/combo4.png",
  combo5: "/images/combo5.png",
  comboVip: "/images/comboVip.png",
  favNetPrime: "/images/favNetPrime.png",
  favNetJelly: "/images/favNetJelly.png",
  favNetDisney: "/images/favNetDisney.png",
  favNetYt: "/images/favNetYt.png",
  favNetWin: "/images/favNetWin.png",
  facebook: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1024px-Facebook_Logo_%282019%29.png",
  instagram: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/1024px-Instagram_icon.png",
  tiktok: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Logomark_-_TikTok.png/800px-Logomark_-_TikTok.png",
};

// ─── DATOS ────────────────────────────────────────────────────────────────────
const PANTALLAS = [
  { id:"net1-p", name:"Netflix 1 Mes", price:16000, img:"/images/netflix1mes.png", color:"#E50914", desc:"1 pantalla · HD", features:["Series y películas","Calidad HD","Soporte incluido"] },
  { id:"sp1-p", name:"Spotify 1 Mes", price:12000, img:IMG.spotify, color:"#1DB954", desc:"Premium sin anuncios", features:["Sin anuncios","Descarga offline","Calidad máxima"] },
  { id:"yt1-p", name:"YouTube 1 Mes", price:16000, img:IMG.youtube, color:"#FF0000", desc:"Sin anuncios · Music", features:["Sin anuncios","YouTube Music","Descarga videos"] },
  { id:"hbo", name:"HBO Max", price:11000, img:IMG.hbo, color:"#8B5CF6", desc:"Series exclusivas · HD", features:["Series exclusivas HBO","Estrenos de cine","Calidad HD"] },
  { id:"prime", name:"Prime Video", price:11000, img:IMG.prime, color:"#00A8E1", desc:"Originales Amazon · HD", features:["Originales Amazon","Calidad HD","Soporte incluido"] },
  { id:"dis1", name:"Disney+ Estándar", price:11000, img:IMG.disneyStd, color:"#0063e5", desc:"Marvel, Star Wars, Pixar", features:["Marvel, Star Wars, Pixar","Calidad HD","Sin ESPN"] },
  { id:"dis2", name:"Disney+ Premium ESPN", price:15000, img:IMG.disneyPrem, color:"#0063e5", badge:"ESPN", desc:"Con deportes ESPN", features:["Todo Disney+","ESPN en vivo","Calidad HD+"] },
  { id:"paramount", name:"Paramount+", price:14000, img:IMG.paramount, color:"#0064FF", desc:"Series Paramount · HD", features:["Series Paramount","Películas exclusivas","Calidad HD"] },
  { id:"crunchy", name:"Crunchyroll", price:11000, img:IMG.crunchyroll, color:"#F47521", desc:"Anime sin límite", features:["Anime sin límite","Simulcast","Sin anuncios"] },
  { id:"vix", name:"ViX+", price:11000, img:IMG.vix, color:"#FF3B30", desc:"Contenido en español", features:["Contenido en español","Deportes","Novelas y series"] },
  { id:"plex", name:"Plex Premium", price:11000, img:IMG.plex, color:"#E5A00D", desc:"Sin anuncios · HD", features:["Películas y series","Sin anuncios","Calidad HD"] },
  { id:"jelly", name:"Jellyfin", price:14000, img:IMG.jellyfin, color:"#9B59B6", desc:"Catálogo enorme", features:["Catálogo enorme","Sin restricciones","Alta calidad"] },
  { id:"iptv", name:"IPTV Smarters", price:14000, img:IMG.iptv, color:"#27AE60", desc:"Solo Smart TV", features:["Canales en vivo","Deportes","Smart TV requerido"] },
  { id:"iptvfull", name:"IPTV 3 Pantallas", price:20000, img:IMG.iptv, color:"#27AE60", desc:"3 pantallas · Smart TV", features:["3 pantallas","Canales en vivo","Smart TV requerido"] },
  { id:"win", name:"WIN+", price:35000, img:IMG.win, color:"#FF6B00", desc:"Fútbol · Solo Smart TV", features:["Deportes en vivo","Fútbol latinoamericano","Smart TV requerido"] },
  { id:"directv", name:"DirecTV GO", price:38000, img:IMG.directv, color:"#00529B", desc:"Canales premium · HD", features:["Canales premium","Deportes en vivo","Calidad HD"] },
  { id:"apple", name:"Apple TV+", price:20000, img:IMG.appletv, color:"#aaa", desc:"Originales Apple · 4K", features:["Originales Apple","Calidad 4K","Soporte incluido"] },
  { id:"canva", name:"Canva Pro", price:11000, img:IMG.canva, color:"#00C4CC", desc:"Diseño sin límites", features:["Diseños ilimitados","Recursos premium","Sin marca de agua"] },
  { id:"ps", name:"PlayStation Plus", price:38000, img:IMG.playstation, color:"#003087", desc:"Gaming · Online", features:["Juegos gratis mensuales","Multijugador online","Descuentos exclusivos"] },
  { id:"office", name:"Office 1 Mes", price:20000, img:IMG.office, color:"#D83B01", desc:"Word, Excel, PowerPoint", features:["Office completo","1 mes","Todas las apps incluidas"] },
];

const MESES = [
  { id:"net1", cat:"Netflix", name:"Netflix 1 Mes", price:16000, img:"/images/netflix1mes.png", color:"#E50914", desc:"1 pantalla · HD", features:["Series y películas","Calidad HD","Soporte incluido"] },
  { id:"net2p", cat:"Netflix", name:"Netflix 2 Pantallas", price:30000, img:"/images/netflix1mes.png", color:"#E50914", badge:"OFERTA", desc:"Compartir en familia", features:["2 pantallas","Comparte con familia","1 app gratis"] },
  { id:"net2m", cat:"Netflix", name:"Netflix 2 Meses", price:32000, img:"/images/netflix2meses.png", color:"#E50914", badge:"+ APP GRATIS", desc:"2 meses seguidos", features:["2 meses","Calidad HD","1 app gratis"] },
  { id:"net3m", cat:"Netflix", name:"Netflix 3 Meses", price:48000, img:"/images/netflix3meses.png", color:"#E50914", badge:"MEJOR PRECIO", desc:"3 meses seguidos", features:["3 meses","Calidad HD","1 app gratis"] },
  { id:"sp1", cat:"Spotify", name:"Spotify 1 Mes", price:12000, img:IMG.spotify, color:"#1DB954", desc:"Premium sin anuncios", features:["Sin anuncios","Descarga offline","Calidad máxima"] },
  { id:"sp2", cat:"Spotify", name:"Spotify 2 Meses", price:22000, img:IMG.spotify, color:"#1DB954", desc:"2 meses", features:["2 meses","Descarga offline","Calidad máxima"] },
  { id:"sp3", cat:"Spotify", name:"Spotify 3 Meses", price:28000, img:"/images/spotify3meses.png", color:"#1DB954", desc:"3 meses", features:["3 meses","Descarga offline","Calidad máxima"] },
  { id:"sp4", cat:"Spotify", name:"Spotify 4 Meses", price:35000, img:IMG.spotify, color:"#1DB954", desc:"4 meses", features:["4 meses","Descarga offline","Calidad máxima"] },
  { id:"sp6", cat:"Spotify", name:"Spotify 6 Meses", price:55000, img:IMG.spotify, color:"#1DB954", badge:"SUPER", desc:"Mejor precio", features:["6 meses","Descarga offline","Mejor precio"] },
  { id:"yt1", cat:"YouTube", name:"YouTube 1 Mes", price:16000, img:IMG.youtube, color:"#FF0000", desc:"Sin anuncios · Music", features:["Sin anuncios","YouTube Music","Descarga videos"] },
  { id:"yt2", cat:"YouTube", name:"YouTube 2 Meses", price:32000, img:IMG.youtube, color:"#FF0000", desc:"2 meses", features:["2 meses","YouTube Music","Descarga videos"] },
  { id:"yt3", cat:"YouTube", name:"YouTube 3 Meses", price:48000, img:IMG.youtube, color:"#FF0000", badge:"🔥", desc:"3 meses", features:["3 meses","YouTube Music","Descarga videos"] },
];

const COMBOS = [
  { id:"c2apps", name:"2 Apps sin Netflix", price:18000, img:IMG.combo2, color:"#6C63FF", desc:"Elige 2 plataformas" },
  { id:"c3apps", name:"3 Apps sin Netflix", price:22000, img:IMG.combo3, color:"#6C63FF", desc:"Elige 3 plataformas" },
  { id:"cx2", name:"Combo x2 Apps", price:22000, img:IMG.combo2, color:"#E50914", desc:"Netflix + 1 plataforma" },
  { id:"cx3", name:"Combo x3 Apps", price:28000, img:IMG.combo3, color:"#E50914", desc:"Netflix + 2 plataformas" },
  { id:"cx4", name:"Combo x4 Apps", price:30000, img:IMG.combo4, color:"#E50914", desc:"Netflix + 3 plataformas" },
  { id:"cx5", name:"Combo x5 Apps", price:32000, img:IMG.combo5, color:"#E50914", desc:"Netflix + 4 plataformas" },
  { id:"vip", name:"Combo VIP 9 Apps", price:45000, img:IMG.comboVip, color:"#a855f7", badge:"VIP 💎", desc:"9 plataformas premium" },
];

const FAV_COMBOS = [
  { id:"fav1", name:"Netflix + Prime Video", price:22000, img:IMG.favNetPrime, color:"#FF9900", stars:1, desc:"Combo Favorito" },
  { id:"fav2", name:"Netflix + Jellyfin/IPTV", price:25000, img:IMG.favNetJelly, color:"#9B59B6", stars:2, desc:"Solo Smart TV" },
  { id:"fav3", name:"Netflix + YouTube Premium", price:32000, img:IMG.favNetYt, color:"#FF0000", stars:3, desc:"Combo Favorito" },
  { id:"fav4", name:"Netflix + Disney+ Premium", price:28000, img:IMG.favNetDisney, color:"#0063e5", stars:4, desc:"Con ESPN incluido" },
  { id:"fav5", name:"Netflix + WIN+", price:45000, img:IMG.favNetWin, color:"#FF6B00", stars:5, desc:"Solo Smart TV" },
  { id:"office1", name:"Office 1 Mes", price:20000, img:IMG.office, color:"#D83B01", stars:5, desc:"Word, Excel, PowerPoint" },
  { id:"fav6", name:"Netflix 1 Mes", price:16000, img:"/images/netflix1mes.png", color:"#E50914", stars:5, desc:"1 pantalla · HD" },
  { id:"fav7", name:"Disney+ Premium", price:16000, img:IMG.disneyPrem, color:"#0063e5", stars:4, desc:"Con ESPN incluido" },
  { id:"fav8", name:"DirecTV GO", price:38000, img:IMG.directv, color:"#00529B", stars:4, desc:"Canales premium · HD" },
];

// Ruleta items
const RULETA_ITEMS = [
  { label:"10% OFF", emoji:"💎", color:"#a855f7", prize:"10% de descuento en tu próxima compra" },
  { label:"Inténtalo", emoji:"😅", color:"#374151", prize:null },
  { label:"Pantalla Gratis", emoji:"⚽", color:"#E50914", prize:"1 pantalla gratis de una plataforma a elegir" },
  { label:"5% OFF", emoji:"🎉", color:"#0063e5", prize:"5% de descuento en tu próxima compra" },
  { label:"Inténtalo", emoji:"🙈", color:"#374151", prize:null },
  { label:"1 Día Extra", emoji:"🕐", color:"#27AE60", prize:"1 día extra en tu próxima suscripción" },
  { label:"Inténtalo", emoji:"😬", color:"#374151", prize:null },
  { label:"15% OFF", emoji:"🚀", color:"#F59E0B", prize:"15% de descuento en tu próxima compra" },
  { label:"1 Mes Gratis", emoji:"🎁", color:"#E50914", prize:"1 mes gratis de una plataforma a elegir" },
];

// ─── CHAT BOT: RESPUESTAS PREDEFINIDAS ────────────────────────────────────────
const BOT_RULES = [
  { kw:["hola","buenas","hey","buenos dias","buenas tardes","buenas noches","ola","saludos"],
    reply:`¡Hola! 👋 Bienvenido a Digital Market 🚀\n¿En qué te puedo ayudar? Puedo darte precios, info de combos, métodos de pago o ayuda con errores.` },

  { kw:["gracias","adios","chao","bye","hasta luego","nos vemos"],
    reply:`¡Gracias a ti! 🙌 Cualquier cosa aquí estoy. Que disfrutes tu plataforma 🎬✨` },

  { kw:["netflix"],
    reply:`📺 NETFLIX:\n• 1 Mes: $16.000\n• 2 Pantallas: $30.000 (+ 1 app gratis 🎁)\n• 2 Meses: $32.000\n• 3 Meses: $48.000\n\n¿Quieres que te ayude a agregarlo al carrito?` },

  { kw:["spotify"],
    reply:`🎵 SPOTIFY PREMIUM:\n• 1 mes: $12.000\n• 2 meses: $22.000\n• 3 meses: $28.000\n• 4 meses: $35.000\n• 6 meses: $55.000 (mejor precio 🔥)` },

  { kw:["youtube"],
    reply:`▶️ YOUTUBE PREMIUM:\n• 1 mes: $12.000\n• 2 meses: $24.000\n• 3 meses: $36.000\n\nIncluye YouTube Music y descarga de videos sin anuncios.` },

  { kw:["disney"],
    reply:`✨ DISNEY+:\n• Estándar: $11.000\n• Premium con ESPN: $15.000\n\nMarvel, Star Wars, Pixar y mucho más.` },

  { kw:["hbo","max"],
    reply:`🎬 HBO Max: $11.000\nSeries exclusivas y estrenos de cine en HD.` },

  { kw:["prime","amazon"],
    reply:`📦 Prime Video: $11.000\nOriginales Amazon en calidad HD.` },

  { kw:["paramount"],
    reply:`⭐ Paramount+: $11.000\nSeries y películas exclusivas de Paramount.` },

  { kw:["crunchyroll","anime"],
    reply:`🍙 Crunchyroll: $11.000\nAnime sin límite, simulcast y sin anuncios.` },

  { kw:["vix"],
    reply:`🌎 ViX+: $11.000\nContenido en español: novelas, series y deportes.` },

  { kw:["plex"],
    reply:`🎞️ Plex Premium: $11.000\nPelículas y series sin anuncios en HD.` },

  { kw:["jellyfin"],
    reply:`📚 Jellyfin: $14.000\nCatálogo enorme sin restricciones.` },

  { kw:["iptv"],
    reply:`📡 IPTV:\n• IPTV Smarters: $14.000\n• IPTV 3 Pantallas: $20.000\n\n⚠️ Solo compatible con Smart TV.` },

  { kw:["win+","win plus","winsports","win sports"],
    reply:`⚽ WIN+: $25.000\nFútbol colombiano y latinoamericano en vivo. Solo Smart TV.` },

  { kw:["directv"],
    reply:`📡 DirecTV GO: $45.000\nCanales premium y deportes en vivo en HD.` },

  { kw:["apple tv","appletv"],
    reply:`🍎 Apple TV+: $20.000\nOriginales Apple en calidad 4K.` },

  { kw:["canva"],
    reply:`🎨 Canva Pro: $11.000\nDiseños ilimitados, recursos premium y sin marca de agua.` },

  { kw:["playstation","ps plus","ps+"],
    reply:`🎮 PlayStation Plus: $38.000\nJuegos gratis mensuales y multijugador online.` },

  { kw:["office","word","excel","powerpoint"],
    reply:`💼 Office 1 Mes: $20.000\nIncluye Word, Excel, PowerPoint y todas las apps de Office.` },

  { kw:["combo"],
    reply:`🔥 COMBOS:\n• 2 Apps sin Netflix: $18.000\n• 3 Apps sin Netflix: $22.000\n• Combo x2 (con Netflix): $22.000\n• Combo x3: $28.000\n• Combo x4: $30.000\n• Combo x5: $32.000\n• Combo VIP 9 Apps: $45.000 💎\n\n¿Quieres armar uno personalizado? Dime cuáles plataformas te interesan.` },

  { kw:["favorito","favoritos"],
    reply:`⭐ COMBOS FAVORITOS:\n• Netflix + Prime: $22.000\n• Netflix + Jellyfin/IPTV: $25.000\n• Netflix + YouTube: $25.000\n• Netflix + Disney+ Premium: $25.000\n• Netflix + WIN+: $35.000` },

  { kw:["seguidor","seguidores","facebook","instagram","tiktok"],
    reply:`👥 SEGUIDORES:\n• Facebook 1000: $38.000\n• Instagram 1000: $38.000\n• TikTok 1000: $58.000\n\nEntrega gradual y segura.` },

  { kw:["club"],
    reply:`💎 CLUB DIGITAL MARKET: $10.000/mes\nIncluye 1 giro de ruleta, descuentos exclusivos, ofertas anticipadas y notificaciones por WhatsApp.` },

  { kw:["ruleta","codigo ruleta","código ruleta"],
    reply:`🎰 El código de la ruleta de este mes es: DMJUN2026\nVálido solo para suscriptores del Club Digital Market.` },

  { kw:["pago","pagar","nequi","daviplata","llaves","transferencia"],
    reply:`💳 MÉTODOS DE PAGO:\nNequi, Daviplata o Llaves (Cualquier Banco) al número ${PAGO_NUMERO}.\n\nUna vez realices el pago, envíanos el comprobante por WhatsApp y activamos tu cuenta en máximo 5 minutos.` },

  { kw:["no puedo entrar","no entra","no funciona","error","contraseña","clave"],
    reply:`🆘 Si no puedes entrar:\n1. Verifica que el correo y la contraseña no tengan espacios.\n2. Revisa mayúsculas/minúsculas.\n3. Si persiste, escríbenos al WhatsApp y lo resolvemos enseguida.` },

  { kw:["verificacion","verificación","codigo de acceso","código de acceso","hogar"],
    reply:`🔐 Si Netflix o Disney+ piden un código de verificación, ve a la sección "Validar Código" en el menú de la app y lo obtienes ahí mismo.` },

  { kw:["pantalla","pantallas al limite","límite de pantallas"],
    reply:`📱 Si dice que las pantallas están al límite, espera unos minutos — puede que otro usuario esté activo en ese momento. Si pasan más de 10 minutos, escríbenos.` },

  { kw:["no llego","no llegó","no recibo","cuenta no llega"],
    reply:`⏱️ La entrega es automática y demora máximo 5 minutos. Si pasan más de 10 minutos sin recibir tu cuenta, escríbenos al WhatsApp y te ayudamos enseguida.` },

  { kw:["como comprar","cómo comprar","como compro"],
    reply:`🛍️ Para comprar: elige tu producto, agrégalo al carrito 🛒 y finaliza el pedido por WhatsApp. ¡Así de fácil!` },

  { kw:["como crear usuario","crear cuenta","crear usuario"],
    reply:`👤 Por ahora la creación de usuario se hace por WhatsApp. Pronto estará disponible directamente en la página.` },

  { kw:["que plataformas","qué plataformas","plataformas tienen","cuales plataformas","cuáles plataformas"],
    reply:`📺 Tenemos: Netflix, Spotify, YouTube Premium, Disney+, HBO Max, Prime Video, Paramount+, Crunchyroll, ViX+, Plex, Jellyfin, IPTV, WIN+, DirecTV, Apple TV+, Canva Pro, PlayStation Plus y Office.\n\n¿Cuál te interesa? Te paso el precio 👀` },

  { kw:["precio","precios","cuanto cuesta","cuánto cuesta","cuanto vale","cuánto vale"],
    reply:`💰 Tenemos precios desde $11.000. Dime qué plataforma te interesa (Netflix, Spotify, Disney+, HBO, etc.) y te paso el precio exacto.` },

  { kw:["promo","promocion","promoción","oferta","descuento"],
    reply:`🎁 PROMO NETFLIX ACTIVA:\nLleva 2 Pantallas, 2 o 3 Meses y recibe 1 app GRATIS (Disney+, HBO, Plex, ViX+, Crunchyroll, Paramount+ o IPTV) 🥳` },
];

const BOT_FALLBACK = `Hmm, no tengo esa información a la mano 🤔\nPara ayudarte mejor, escríbenos directo al WhatsApp ${WA_DISPLAY} 💬`;

function getBotReply(text) {
  const normalized = text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .trim();
  for (const rule of BOT_RULES) {
    if (rule.kw.some(k => normalized.includes(k.normalize("NFD").replace(/[\u0300-\u036f]/g,"")))) {
      return rule.reply;
    }
  }
  return BOT_FALLBACK;
}

// ─── THEME ────────────────────────────────────────────────────────────────────
const getTheme = (dark) => ({
  bg: dark ? "#0d141f" : "#f0f4f8",
  surface: dark ? "#141d2c" : "#ffffff",
  card: dark ? "#182433" : "#ffffff",
  border: dark ? "#26334a" : "#e2e8f0",
  text: dark ? "#eef2f7" : "#1a202c",
  muted: dark ? "#8497b8" : "#718096",
});

const getCSS = (dark) => `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Outfit',system-ui,sans-serif; background:${dark?"#080d14":"#f0f4f8"}; color:${dark?"#e8eef5":"#1a202c"}; transition:background 0.3s,color 0.3s; }
  ::placeholder { color:${dark?"#2a3a4a":"#a0aec0"}; }
  input:focus, textarea:focus { outline:none; }
  ::-webkit-scrollbar { width:3px; height:3px; }
  ::-webkit-scrollbar-thumb { background:${dark?"#1a2535":"#cbd5e0"}; border-radius:3px; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
  @keyframes menuSlide { from{transform:translateX(-100%)} to{transform:translateX(0)} }
  @keyframes menuSlideOut { from{transform:translateX(0)} to{transform:translateX(-100%)} }
  @keyframes overlayIn { from{opacity:0} to{opacity:1} }
  @keyframes overlayOut { from{opacity:1} to{opacity:0} }
  @keyframes modalIn { from{opacity:0;transform:scale(0.92) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(229,9,20,0.15)} 50%{box-shadow:0 0 40px rgba(229,9,20,0.35)} }
  @keyframes blink { 0%,100%{opacity:.2} 50%{opacity:1} }
  @keyframes cartBounce { 0%{transform:scale(1)} 50%{transform:scale(1.35)} 100%{transform:scale(1)} }
  @keyframes ruletaSpin { 0%{transform:rotate(0deg)} 100%{transform:rotate(1800deg)} }
  @keyframes prizeReveal { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
  @keyframes goldGlow { 0%,100%{box-shadow:0 0 20px rgba(245,158,11,0.3)} 50%{box-shadow:0 0 40px rgba(245,158,11,0.6)} }
  .card-hover { transition:transform 0.25s cubic-bezier(.2,.8,.2,1), box-shadow 0.25s ease, border-color 0.25s ease; animation:fadeUp 0.4s ease backwards; }
  .card-hover:hover { transform:translateY(-6px) scale(1.02); box-shadow:0 12px 28px rgba(0,0,0,0.25); }
  .card-hover:active { transform:translateY(-2px) scale(0.99); }
  .card-hover img { transition:transform 0.35s ease; }
  .card-hover:hover img { transform:scale(1.06); }
  .tab-active { background:#7c3aed !important; color:#fff !important; font-weight:700 !important; }
  .tab-btn { transition:transform 0.15s ease, background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease; }
  .tab-btn:active { transform:scale(0.95); }
  @keyframes tabGlow { 0%,100%{box-shadow:0 4px 14px rgba(124,58,237,0.35)} 50%{box-shadow:0 4px 22px rgba(124,58,237,0.65)} }
  .tab-active { transform:scale(1.05); animation:tabGlow 2.2s ease-in-out infinite; }
  .cart-bounce { animation:cartBounce 0.4s ease; }
  .product-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
  @media (min-width:640px) { .product-grid { grid-template-columns:repeat(3,1fr); gap:14px; } }
  @media (min-width:1024px) { .product-grid { grid-template-columns:repeat(4,1fr); gap:18px; } }
  @media (min-width:1400px) { .product-grid { grid-template-columns:repeat(5,1fr); gap:20px; } }
  @keyframes backGlow { 0%,100%{box-shadow:0 2px 8px rgba(124,58,237,0.15), 0 0 0 0 rgba(124,58,237,0.0)} 50%{box-shadow:0 2px 14px rgba(124,58,237,0.35), 0 0 0 4px rgba(124,58,237,0.08)} }
  .back-btn { display:inline-flex; align-items:center; gap:8px; transition:transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease; animation:backGlow 2.6s ease-in-out infinite; cursor:pointer; }
  .back-btn:hover { transform:translateX(-4px) scale(1.04); animation:none; box-shadow:0 4px 16px rgba(124,58,237,0.45); }
  .back-btn:active { transform:translateX(-2px) scale(0.97); }
  .back-btn-arrow { transition:transform 0.18s ease; }
  .back-btn:hover .back-btn-arrow { transform:translateX(-3px); }
  @keyframes fabPulse { 0%,100%{box-shadow:0 6px 24px rgba(124,58,237,0.5)} 50%{box-shadow:0 6px 24px rgba(124,58,237,0.5), 0 0 0 10px rgba(124,58,237,0.15)} }
  .fab-pulse { animation:fabPulse 2.4s ease-in-out infinite; transition:transform 0.18s ease; }
  .fab-pulse:hover { transform:scale(1.08) rotate(8deg); }
  .hdr-btn { transition:transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease; }
  .hdr-btn:hover { transform:translateY(-2px); box-shadow:0 4px 10px rgba(0,0,0,0.15); }
  .hdr-btn:active { transform:translateY(0) scale(0.95); }
  @keyframes floatBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  .cart-item { transition:transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
  .cart-item:hover { transform:translateX(4px); box-shadow:0 6px 18px rgba(0,0,0,0.12); }
  .remove-btn { transition:transform 0.15s ease, background 0.15s ease; }
  .remove-btn:hover { transform:scale(1.08); background:#2a1414; }
  .remove-btn:active { transform:scale(0.92); }
  @keyframes checkoutGlow { 0%,100%{box-shadow:0 6px 18px rgba(37,211,102,0.35)} 50%{box-shadow:0 6px 28px rgba(37,211,102,0.6)} }
  .checkout-btn { animation:checkoutGlow 2.5s ease-in-out infinite; transition:transform 0.15s ease; }
  .checkout-btn:hover { transform:translateY(-2px) scale(1.01); }
  .checkout-btn:active { transform:translateY(0) scale(0.98); }
  .quick-access { transition:transform 0.18s ease, box-shadow 0.18s ease; }
  .quick-access:hover { transform:translateY(-3px); box-shadow:0 6px 16px rgba(0,0,0,0.15); }
  .quick-access:active { transform:translateY(-1px) scale(0.98); }
  @keyframes glowPurple { 0%,100%{box-shadow:0 2px 10px rgba(124,58,237,0.25)} 50%{box-shadow:0 2px 18px rgba(124,58,237,0.55)} }
  @keyframes glowGreen { 0%,100%{box-shadow:0 2px 10px rgba(37,211,102,0.2)} 50%{box-shadow:0 2px 18px rgba(37,211,102,0.5)} }
  .glow-purple { animation:glowPurple 2.6s ease-in-out infinite; }
  .glow-green { animation:glowGreen 2.6s ease-in-out infinite; }
  @keyframes glowBlue { 0%,100%{box-shadow:0 2px 10px rgba(59,130,246,0.2)} 50%{box-shadow:0 2px 18px rgba(59,130,246,0.5)} }
  .glow-blue { animation:glowBlue 2.6s ease-in-out infinite; }
  .menu-item { transition:background 0.15s ease, padding-left 0.15s ease; }
  .menu-item:hover { background:rgba(124,58,237,0.1); padding-left:24px !important; }
  div[style*="overflowX"]::-webkit-scrollbar { display:none; }
  .tab-icon { font-size:16px; }
  .tab-label { font-size:12px; }
  .report-icon-only { display:inline; }
  .report-text { display:none; }
  @media (min-width:480px) {
    .report-icon-only { display:none; }
    .report-text { display:inline; }
  }
  @media (min-width:768px) {
    .tab-bar { justify-content:stretch !important; }
    .tab-btn { padding:13px 16px !important; min-width:0 !important; flex:1 !important; flex-direction:row !important; gap:8px !important; justify-content:center !important; }
    .tab-icon { font-size:18px; }
    .tab-label { font-size:14px; }
  }
  .login-field { transition:border-color 0.18s ease, box-shadow 0.18s ease; }
  .login-field:focus-within { border-color:#7c3aed !important; box-shadow:0 0 0 3px rgba(124,58,237,0.15); }
  .login-submit { transition:transform 0.15s ease, box-shadow 0.15s ease; }
  .login-submit:hover { transform:translateY(-2px); box-shadow:0 6px 16px rgba(124,58,237,0.4); }
  .login-submit:active { transform:translateY(0) scale(0.98); }
  .payment-row { transition:background 0.15s ease; }
  .payment-row:hover { background:rgba(124,58,237,0.08); }
`;

// ─── COMPONENTES BASE ─────────────────────────────────────────────────────────
function BackButton({ onClick, dark, label="Volver" }) {
  const t = getTheme(dark);
  return (
    <button onClick={onClick} className="back-btn" style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:12, padding:"10px 18px", color:t.text, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit", boxShadow:dark?"0 2px 8px rgba(0,0,0,0.3)":"0 2px 8px rgba(0,0,0,0.06)" }}>
      <span className="back-btn-arrow" style={{ fontSize:18, lineHeight:1 }}>←</span>
      {label && <span>{label}</span>}
    </button>
  );
}

function Img({ src, alt, size=44, style={} }) {
  const [err, setErr] = useState(false);
  return (
    <div style={{ width:size, height:size, borderRadius:10, background:"#1a2535", overflow:"hidden", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", ...style }}>
      {!err && src ? <img src={src} alt={alt} onError={()=>setErr(true)} style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : <span style={{ fontSize:size*0.4, color:"#555" }}>{alt?.[0]||"?"}</span>}
    </div>
  );
}

// ─── CARRUSEL PELICULAS ───────────────────────────────────────────────────────
// ─── CARRUSEL DE PROMOCIONES ──────────────────────────────────────────────────
const PROMOS = [
  { emoji:"🎁", tag:"Promo Netflix activa", title:"Lleva 2 Pantallas, 2 o 3 Meses", desc:"y recibe 1 app GRATIS 🥳 a tu elección entre estas plataformas:", items:["Disney+","HBO Max","Plex","ViX+","Crunchyroll","Paramount+","IPTV"], color:"#E50914", bgDark:"linear-gradient(135deg,#2a0000,#1f0000)", bgLight:"linear-gradient(135deg,#fff1f1,#ffe4e4)" },
  { emoji:"🔥", tag:"Lo más vendido", title:"Combo VIP — 9 Plataformas", desc:"El combo más completo de la tienda, ideal si quieres todo en un solo pago:", items:["Netflix","HBO Max","Prime Video","ViX+","Crunchyroll","IPTV","Paramount+","Plex","Jellyfin"], price:"$45.000", color:"#a855f7", bgDark:"linear-gradient(135deg,#1f0a2a,#150620)", bgLight:"linear-gradient(135deg,#f6eeff,#ece0ff)" },
  { emoji:"👑", tag:"Club Digital Market", title:"Únete por $10.000 al mes", desc:"Beneficios exclusivos para miembros del club:", items:["1 giro de ruleta cada mes","Descuentos exclusivos","Ofertas anticipadas","Notificaciones por WhatsApp"], color:"#FFD700", bgDark:"linear-gradient(135deg,#2a2000,#1f1700)", bgLight:"linear-gradient(135deg,#fffbe6,#fff3c4)" },
  { emoji:"🎰", tag:"Ruleta de premios", title:"Gira y gana cada mes", desc:"Disponible para suscriptores del Club Digital Market:", items:["Descuentos en combos","Meses gratis","Plataformas de regalo","Premios sorpresa"], color:"#F59E0B", bgDark:"linear-gradient(135deg,#2a1800,#1f1100)", bgLight:"linear-gradient(135deg,#fff4e6,#ffe4c4)" },
];

function PromoCarrusel({ dark }) {
  const t = getTheme(dark);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const dragRef = useRef({ startX:0, dragging:false });
  const resumeTimer = useRef(null);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setActive(a => (a+1) % PROMOS.length);
        setVisible(true);
      }, 350);
    }, 9000);
    return () => clearInterval(interval);
  }, [paused]);

  const goTo = (i, wrap=true) => {
    let idx = i;
    if (wrap) idx = ((i % PROMOS.length) + PROMOS.length) % PROMOS.length;
    if (idx===active) return;
    setVisible(false);
    setTimeout(() => { setActive(idx); setVisible(true); }, 250);
  };

  const pauseTemporarily = () => {
    setPaused(true);
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), 12000);
  };

  const onDown = (x) => { dragRef.current = { startX:x, dragging:true }; setPaused(true); clearTimeout(resumeTimer.current); };
  const onMove = () => {};
  const onUp = (x) => {
    if (!dragRef.current.dragging) return;
    const diff = x - dragRef.current.startX;
    dragRef.current.dragging = false;
    if (Math.abs(diff) > 40) {
      if (diff < 0) goTo(active+1); else goTo(active-1);
    }
    pauseTemporarily();
  };

  const p = PROMOS[active];
  return (
    <div style={{ padding:"0 16px" }}>
      <div>
        <div
          onMouseDown={e=>onDown(e.clientX)}
          onMouseMove={onMove}
          onMouseUp={e=>onUp(e.clientX)}
          onMouseLeave={()=>{ if(dragRef.current.dragging){ dragRef.current.dragging=false; pauseTemporarily(); } }}
          onTouchStart={e=>onDown(e.touches[0].clientX)}
          onTouchEnd={e=>onUp(e.changedTouches[0].clientX)}
          style={{ background:dark?p.bgDark:p.bgLight, border:`1px solid ${p.color}33`, borderRadius:16, padding:"18px 20px", minHeight:150, opacity:visible?1:0, transform:visible?"translateY(0) scale(1)":"translateY(8px) scale(0.985)", transition:"opacity 0.35s ease, transform 0.35s ease, background 0.4s ease", cursor:"grab", userSelect:"none", touchAction:"pan-y" }}
        >
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <span style={{ fontSize:20 }}>{p.emoji}</span>
            <span style={{ color:p.color, fontWeight:700, fontSize:12, textTransform:"uppercase", letterSpacing:0.8 }}>{p.tag}</span>
            {p.price && <span style={{ marginLeft:"auto", color:p.color, fontWeight:900, fontSize:18 }}>{p.price}</span>}
          </div>
          <p style={{ color:t.text, fontSize:16, fontWeight:800, lineHeight:1.3, marginBottom:6 }}>{p.title}</p>
          <p style={{ color:t.muted, fontSize:12.5, lineHeight:1.5, marginBottom:10 }}>{p.desc}</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {p.items.map((it,i)=>(
              <span key={i} style={{ background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)", border:`1px solid ${p.color}33`, color:t.text, fontSize:11.5, fontWeight:600, padding:"4px 10px", borderRadius:20 }}>{it}</span>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginTop:10 }}>
          <button onClick={()=>{ goTo(active-1); pauseTemporarily(); }} aria-label="Anterior" style={{ background:"transparent", border:"none", color:t.muted, fontSize:16, cursor:"pointer", padding:4, lineHeight:1 }}>‹</button>
          <div style={{ display:"flex", justifyContent:"center", gap:6 }}>
            {PROMOS.map((_,i)=>(
              <button key={i} onClick={()=>{ goTo(i); pauseTemporarily(); }} aria-label={`Promo ${i+1}`} style={{ width:i===active?22:8, height:8, borderRadius:4, border:"none", cursor:"pointer", background:i===active?PROMOS[active].color:t.border, transition:"all 0.3s ease", padding:0 }} />
            ))}
          </div>
          <button onClick={()=>{ goTo(active+1); pauseTemporarily(); }} aria-label="Siguiente" style={{ background:"transparent", border:"none", color:t.muted, fontSize:16, cursor:"pointer", padding:4, lineHeight:1 }}>›</button>
        </div>
      </div>
    </div>
  );
}

function MovieModal({ movie, dark, onClose }) {
  const [details, setDetails] = useState(null);
  const t = getTheme(dark);
  useEffect(() => {
    fetch(`${TMDB_BASE}/movie/${movie.id}?language=es-CO`, { headers:{ Authorization:`Bearer ${TMDB_TOKEN}` } })
      .then(r=>r.json()).then(d=>setDetails(d)).catch(()=>{});
  }, [movie.id]);
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:500, display:"flex", alignItems:"flex-end", justifyContent:"center", animation:"overlayIn 0.2s ease" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:t.surface, borderRadius:"20px 20px 0 0", width:"100%", maxWidth:540, maxHeight:"85vh", overflowY:"auto", animation:"fadeUp 0.3s ease", paddingBottom:32 }}>
        <div style={{ position:"relative", width:"100%", height:200, overflow:"hidden", borderRadius:"20px 20px 0 0" }}>
          {movie.backdrop_path
            ? <img src={`https://image.tmdb.org/t/p/w780${movie.backdrop_path}`} alt={movie.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            : <div style={{ width:"100%", height:"100%", background:"linear-gradient(135deg,#1a2535,#0d141f)" }} />}
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85))" }} />
          <button onClick={onClose} style={{ position:"absolute", top:12, right:12, background:"rgba(0,0,0,0.6)", border:"none", borderRadius:"50%", width:32, height:32, color:"#fff", fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <div style={{ padding:"16px 20px" }}>
          <h2 style={{ color:t.text, fontSize:20, fontWeight:800, marginBottom:6 }}>{movie.title}</h2>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:12 }}>
            {details?.release_date && <span style={{ background:t.card, border:`1px solid ${t.border}`, color:t.muted, fontSize:11, padding:"3px 10px", borderRadius:20 }}>📅 {details.release_date?.slice(0,4)}</span>}
            {details?.runtime && <span style={{ background:t.card, border:`1px solid ${t.border}`, color:t.muted, fontSize:11, padding:"3px 10px", borderRadius:20 }}>⏱ {details.runtime} min</span>}
            {details?.vote_average && <span style={{ background:t.card, border:`1px solid ${t.border}`, color:"#f59e0b", fontSize:11, padding:"3px 10px", borderRadius:20 }}>⭐ {details.vote_average?.toFixed(1)}</span>}
          </div>
          {details?.genres?.length > 0 && (
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
              {details.genres.map(g=>(
                <span key={g.id} style={{ background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.3)", color:"#a78bfa", fontSize:11, padding:"3px 10px", borderRadius:20 }}>{g.name}</span>
              ))}
            </div>
          )}
          <p style={{ color:t.muted, fontSize:13, lineHeight:1.7, marginBottom:16 }}>{movie.overview || "Sin descripción disponible."}</p>
          <button onClick={()=>{ window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola! Vi "${movie.title}" en la app y quiero saber en qué plataforma está disponible 🎬`)}`,"_blank"); }} style={{ width:"100%", padding:14, background:"linear-gradient(135deg,#25d366,#128c7e)", border:"none", borderRadius:12, color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"'Outfit',system-ui,sans-serif" }}>💬 Preguntar disponibilidad por WhatsApp</button>
        </div>
      </div>
    </div>
  );
}

function Carrusel({ dark }) {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const scrollRef = useRef(null);
  const dragRef = useRef({ down:false, startX:0, scrollLeft:0, moved:false });
  const autoRef = useRef(null);
  const t = getTheme(dark);

  useEffect(() => {
    const headers = { Authorization:`Bearer ${TMDB_TOKEN}` };
    const lang = "language=es-CO";
    Promise.all([
      fetch(`${TMDB_BASE}/trending/all/week?${lang}`,{headers}).then(r=>r.json()),
      fetch(`${TMDB_BASE}/movie/top_rated?${lang}&page=1`,{headers}).then(r=>r.json()),
      fetch(`${TMDB_BASE}/tv/top_rated?${lang}&page=1`,{headers}).then(r=>r.json()),
      fetch(`${TMDB_BASE}/movie/popular?${lang}&page=2`,{headers}).then(r=>r.json()),
      fetch(`${TMDB_BASE}/tv/popular?${lang}&page=1`,{headers}).then(r=>r.json()),
    ]).then(results=>{
      const all = results.flatMap(r=>r.results||[]).filter(m=>m.poster_path);
      const seen=new Set(); const unique=all.filter(m=>{if(seen.has(m.id))return false;seen.add(m.id);return true;});
      setMovies(unique.slice(0,80));
    }).catch(()=>{});
  }, []);

  useEffect(() => {
    autoRef.current = setInterval(()=>{
      if (scrollRef.current && !dragRef.current.down) {
        scrollRef.current.scrollLeft += 0.8;
        if (scrollRef.current.scrollLeft >= scrollRef.current.scrollWidth/2) scrollRef.current.scrollLeft=0;
      }
    }, 20);
    return () => clearInterval(autoRef.current);
  }, [movies]);

  if (!movies.length) return null;
  const all = [...movies,...movies];

  const startDrag = (x) => {
    clearInterval(autoRef.current);
    dragRef.current = { down:true, startX:x-(scrollRef.current?.offsetLeft||0), scrollLeft:scrollRef.current?.scrollLeft||0, moved:false };
  };
  const moveDrag = (x) => {
    if (!dragRef.current.down) return;
    const walk = (x-(scrollRef.current?.offsetLeft||0)-dragRef.current.startX)*1.5;
    if (Math.abs(walk)>5) dragRef.current.moved=true;
    if (scrollRef.current) scrollRef.current.scrollLeft=dragRef.current.scrollLeft-walk;
  };
  const endDrag = (movie) => {
    if (!dragRef.current.moved && movie) setSelectedMovie(movie);
    dragRef.current.down=false; dragRef.current.moved=false;
    autoRef.current = setInterval(()=>{
      if(scrollRef.current&&!dragRef.current.down){
        scrollRef.current.scrollLeft+=0.8;
        if(scrollRef.current.scrollLeft>=scrollRef.current.scrollWidth/2) scrollRef.current.scrollLeft=0;
      }
    },20);
  };

  return (
    <>
      {selectedMovie && <MovieModal movie={selectedMovie} dark={dark} onClose={()=>setSelectedMovie(null)} />}
      <div style={{ padding:"12px 0 8px", background:t.surface, borderBottom:`1px solid ${t.border}` }}>
        <div style={{ padding:"0 16px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ color:t.muted, fontSize:12, letterSpacing:"1.5px", textTransform:"uppercase", fontWeight:600 }}>🎬 Estrenos y destacados</span>
          <span style={{ color:t.muted, fontSize:10 }}>Toca para ver info</span>
        </div>
        <div
          ref={scrollRef}
          onMouseDown={e=>startDrag(e.pageX)}
          onMouseMove={e=>moveDrag(e.pageX)}
          onMouseUp={()=>endDrag(null)}
          onMouseLeave={()=>{dragRef.current.down=false;dragRef.current.moved=false;}}
          onTouchStart={e=>startDrag(e.touches[0].pageX)}
          onTouchMove={e=>moveDrag(e.touches[0].pageX)}
          onTouchEnd={()=>endDrag(null)}
          style={{ display:"flex", gap:8, overflowX:"auto", paddingLeft:16, paddingRight:16, paddingBottom:4, scrollbarWidth:"none", msOverflowStyle:"none", cursor:"grab", userSelect:"none", WebkitOverflowScrolling:"touch" }}
        >
          {all.map((m,i)=>(
            <div key={`${m.id}-${i}`} onMouseUp={()=>endDrag(m)} onTouchEnd={()=>endDrag(m)} style={{ flexShrink:0, width:95, cursor:"pointer" }}>
              <div className="card-hover" style={{ width:95, height:140, borderRadius:10, overflow:"hidden", background:"#1a2535", boxShadow:"0 3px 10px rgba(0,0,0,0.3)" }}>
                <img src={`${TMDB_IMG}${m.poster_path}`} alt={m.title||m.name} style={{ width:"100%", height:"100%", objectFit:"cover", pointerEvents:"none" }} loading="lazy" />
              </div>
              <div style={{ marginTop:4, fontSize:9, color:t.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.title||m.name}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── RULETA ───────────────────────────────────────────────────────────────────
function Ruleta({ dark, onClose }) {
  const t = getTheme(dark);
  const [code, setCode] = useState("");
  const [codeValid, setCodeValid] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [hasSpun, setHasSpun] = useState(() => {
    const key = `ruleta_spun_${new Date().toISOString().slice(0,7)}`;
    return !!localStorage.getItem(key);
  });
  const canvasRef = useRef(null);

  const validateCode = () => {
    if (code.trim().toUpperCase() === RULETA_CODE) setCodeValid(true);
    else alert("Código inválido. Escribe 'código ruleta' en el chat bot para obtenerlo.");
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const n = RULETA_ITEMS.length;
    const arc = (2 * Math.PI) / n;
    const r = canvas.width / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    RULETA_ITEMS.forEach((item, i) => {
      const angle = i * arc + rotation * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(r, r);
      ctx.arc(r, r, r - 4, angle, angle + arc);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.save();
      ctx.translate(r, r);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px Outfit, sans-serif";
      ctx.fillText(item.emoji + " " + item.label, r - 10, 4);
      ctx.restore();
    });
    // Center circle
    ctx.beginPath();
    ctx.arc(r, r, 24, 0, 2*Math.PI);
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 14px Outfit";
    ctx.textAlign = "center";
    ctx.fillText("🎰", r, r + 5);
  }, [rotation]);

  const spin = () => {
    if (spinning || hasSpun) return;
    setSpinning(true);
    const extraSpins = 5 * 360;
    const randomAngle = Math.floor(Math.random() * 360);
    const finalRotation = rotation + extraSpins + randomAngle;
    let start = null;
    const duration = 4000;
    const animate = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setRotation(rotation + (finalRotation - rotation) * ease);
      if (progress < 1) { requestAnimationFrame(animate); }
      else {
        const normalizedAngle = (360 - (finalRotation % 360)) % 360;
        const itemAngle = 360 / RULETA_ITEMS.length;
        const index = Math.floor(normalizedAngle / itemAngle) % RULETA_ITEMS.length;
        const won = RULETA_ITEMS[index];
        setResult(won);
        setSpinning(false);
        setHasSpun(true);
        const key = `ruleta_spun_${new Date().toISOString().slice(0,7)}`;
        localStorage.setItem(key, "1");
      }
    };
    requestAnimationFrame(animate);
  };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.92)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16, animation:"overlayIn 0.2s ease" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:24, width:"100%", maxWidth:400, maxHeight:"92vh", overflowY:"auto", animation:"modalIn 0.3s ease", position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:12, right:12, background:"#1a2535", border:"none", color:"#888", width:30, height:30, borderRadius:"50%", cursor:"pointer", fontSize:18 }}>×</button>

        <div style={{ padding:"22px 20px 0", textAlign:"center" }}>
          <div style={{ fontSize:11, color:"#FFD700", letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:6 }}>🎰 Tu giro del mes</div>
          <h2 style={{ fontSize:24, fontWeight:900, marginBottom:4 }}>Ruleta de Premios</h2>
          <p style={{ color:t.muted, fontSize:13, marginBottom:16 }}>Suscriptor Club Digital Market</p>
        </div>

        <div style={{ padding:"0 20px" }}>
          {!result ? (
            <>
              <div style={{ position:"relative", width:280, height:280, margin:"0 auto 16px" }}>
                <canvas ref={canvasRef} width={280} height={280} style={{ borderRadius:"50%", boxShadow:"0 0 30px rgba(245,158,11,0.3)" }} />
                <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", fontSize:28, filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>▼</div>
              </div>

              {!codeValid ? (
                <div style={{ marginBottom:16 }}>
                  <p style={{ color:t.muted, fontSize:13, marginBottom:10, textAlign:"center" }}>Ingresa tu código de giro mensual:</p>
                  <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                    <input value={code} onChange={e=>setCode(e.target.value)} placeholder="Código de giro" style={{ flex:1, background:t.bg, border:`1px solid ${t.border}`, borderRadius:10, padding:"11px 14px", color:t.text, fontSize:14, fontFamily:"inherit" }} />
                    <button onClick={validateCode} style={{ padding:"11px 16px", background:"linear-gradient(135deg,#F59E0B,#D97706)", border:"none", borderRadius:10, color:"#000", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>Validar</button>
                  </div>
                  <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, padding:14 }}>
                    <p style={{ color:t.muted, fontSize:12, marginBottom:10, fontWeight:600 }}>¿Cómo obtener tu código?</p>
                    {[["1","Abre el Chat Bot (ícono morado, abajo a la derecha)"],["2","Escribe: código ruleta"],["3","Copia el código y pégalo aquí"]].map(([n,d],i)=>(
                      <div key={i} style={{ display:"flex", gap:8, marginBottom:i<2?8:0 }}>
                        <div style={{ width:20, height:20, borderRadius:6, background:"#F59E0B22", border:"1px solid #F59E0B44", display:"flex", alignItems:"center", justifyContent:"center", color:"#F59E0B", fontWeight:700, fontSize:10, flexShrink:0 }}>{n}</div>
                        <div style={{ color:t.muted, fontSize:12 }}>{d}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : hasSpun ? (
                <div style={{ background:"#1a0f0f", border:"1px solid #3a1a1a", borderRadius:12, padding:14, marginBottom:16, textAlign:"center" }}>
                  <p style={{ color:"#fca5a5", fontSize:13 }}>Ya usaste tu giro de este mes. Vuelve el próximo mes para girar de nuevo 🗓️</p>
                </div>
              ) : (
                <button onClick={spin} disabled={spinning} style={{ width:"100%", padding:18, background:"linear-gradient(135deg,#F59E0B,#D97706)", border:"none", borderRadius:14, color:"#000", fontWeight:900, fontSize:18, cursor:spinning?"not-allowed":"pointer", fontFamily:"inherit", marginBottom:16, animation:"goldGlow 2s ease infinite" }}>
                  {spinning ? "Girando..." : "🎰 ¡Girar la ruleta!"}
                </button>
              )}
            </>
          ) : (
            <div style={{ textAlign:"center", padding:"10px 0 20px", animation:"prizeReveal 0.5s ease" }}>
              {result.prize ? (
                <>
                  <div style={{ fontSize:64, marginBottom:16 }}>{result.emoji}</div>
                  <div style={{ fontSize:22, fontWeight:900, marginBottom:8, color:result.color }}>¡Felicitaciones!</div>
                  <div style={{ fontSize:28, fontWeight:800, marginBottom:12 }}>{result.label}</div>
                  <p style={{ color:t.muted, fontSize:14, marginBottom:20, lineHeight:1.6 }}>{result.prize}</p>
                  <button onClick={()=>window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola! Gané en la ruleta: ${result.prize}. Quiero reclamar mi premio 🎉`)}`,"_blank")} style={{ width:"100%", padding:16, background:"linear-gradient(135deg,#25d366,#128c7e)", border:"none", borderRadius:14, color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit", marginBottom:8 }}>
                    💬 Reclamar premio por WhatsApp
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize:64, marginBottom:16 }}>😅</div>
                  <div style={{ fontSize:22, fontWeight:900, marginBottom:8 }}>¡Inténtalo de nuevo!</div>
                  <p style={{ color:t.muted, fontSize:14, marginBottom:20 }}>Esta vez no fue, pero el próximo mes tienes otro giro 🍀</p>
                </>
              )}
              <button onClick={onClose} style={{ width:"100%", padding:12, background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, color:t.muted, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>Cerrar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CLUB DIGITAL MARKET ──────────────────────────────────────────────────────
function ClubModal({ dark, onClose }) {
  const t = getTheme(dark);
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16, animation:"overlayIn 0.2s ease" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:t.card, border:"1px solid #3a2800", borderRadius:24, width:"100%", maxWidth:400, maxHeight:"92vh", overflowY:"auto", animation:"modalIn 0.3s ease", position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:12, right:12, background:"#1a2535", border:"none", color:"#888", width:30, height:30, borderRadius:"50%", cursor:"pointer", fontSize:18 }}>×</button>
        <div style={{ padding:"24px 20px 0", textAlign:"center" }}>
          <div style={{ fontSize:36, marginBottom:8 }}>👑</div>
          <h2 style={{ fontSize:24, fontWeight:900, marginBottom:4 }}>Club Digital Market</h2>
          <p style={{ color:t.muted, fontSize:13, marginBottom:20 }}>Suscripción mensual de beneficios exclusivos</p>
          <div style={{ background:"linear-gradient(135deg,#1a1000,#2a1800)", border:"1px solid #3a2800", borderRadius:16, padding:"18px 20px", marginBottom:20 }}>
            <div style={{ color:t.muted, fontSize:13, marginBottom:4 }}>Por solo</div>
            <div style={{ fontSize:42, fontWeight:900, color:"#FFD700" }}>$10.000</div>
            <div style={{ color:"#F59E0B", fontSize:14, fontWeight:600 }}>al mes</div>
          </div>
          {[
            { icon:"🎰", text:"1 giro de ruleta con premios reales al mes" },
            { icon:"💎", text:"Descuentos exclusivos solo para suscriptores" },
            { icon:"🎁", text:"Ofertas anticipadas antes de que salgan" },
            { icon:"🔔", text:"Notificaciones de promos por WhatsApp" },
          ].map((b,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:`1px solid ${t.border}` }}>
              <span style={{ fontSize:22 }}>{b.icon}</span>
              <span style={{ color:t.text, fontSize:14 }}>{b.text}</span>
            </div>
          ))}
        </div>
        <div style={{ padding:"20px" }}>
          <button onClick={()=>{ window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hola, quiero suscribirme al Club Digital Market por $10.000/mes")}`,"_blank"); onClose(); }} style={{ width:"100%", padding:16, background:"linear-gradient(135deg,#25d366,#128c7e)", border:"none", borderRadius:14, color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit", marginBottom:10, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            💬 Suscribirme — $10.000/mes
          </button>
          <button onClick={onClose} style={{ width:"100%", padding:12, background:t.surface, border:`1px solid ${t.border}`, borderRadius:12, color:t.muted, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>¿Ya eres suscriptor? Obtén tu código en el Chat Bot</button>
        </div>
      </div>
    </div>
  );
}

// ─── VIP MODAL ────────────────────────────────────────────────────────────────
function VipModal({ onClose, onAdd, dark }) {
  const t = getTheme(dark);
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16, animation:"overlayIn 0.2s ease" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:20, width:"100%", maxWidth:440, maxHeight:"92vh", overflowY:"auto", animation:"modalIn 0.3s ease", position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:12, right:12, background:"#1a2535", border:"none", color:"#888", width:30, height:30, borderRadius:"50%", cursor:"pointer", fontSize:18, zIndex:1 }}>×</button>
        <div style={{ padding:"24px 20px 0", textAlign:"center" }}>
          <div style={{ fontSize:11, color:"#FFD700", letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:8 }}>⭐ Oferta Exclusiva ⭐</div>
          <h2 style={{ fontSize:28, fontWeight:900, marginBottom:4 }}>Combo VIP 💎</h2>
          <p style={{ color:t.muted, fontSize:13, marginBottom:20 }}>9 plataformas premium · 1 pantalla de cada una</p>
        </div>
        <div style={{ padding:"0 20px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
            {[{name:"Netflix",img:IMG.netflix},{name:"HBO Max",img:IMG.hbo},{name:"Prime",img:IMG.prime},{name:"ViX+",img:IMG.vix},{name:"Crunchyroll",img:IMG.crunchyroll},{name:"IPTV",img:IMG.iptv},{name:"Paramount+",img:IMG.paramount},{name:"Plex",img:IMG.plex},{name:"Jellyfin",img:IMG.jellyfin}].map((it,i)=>(
              <div key={i} style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:14, padding:"12px 8px", textAlign:"center" }}>
                <div style={{ width:54, height:54, borderRadius:12, overflow:"hidden", background:"#1a2535", margin:"0 auto 8px", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <img src={it.img} alt={it.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"} />
                </div>
                <div style={{ fontSize:11, fontWeight:700, color:t.text }}>{it.name}</div>
              </div>
            ))}
          </div>
          <div style={{ background:"linear-gradient(135deg,#1a0010,#0d0028)", border:"1px solid #3a0040", borderRadius:16, padding:"18px 20px", marginBottom:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontSize:14, color:"#888", textDecoration:"line-through" }}>$58.000</div>
                <div style={{ fontSize:40, fontWeight:900, color:"#fff" }}>$45.000</div>
                <div style={{ fontSize:13, color:"#25d366", fontWeight:700 }}>Ahorras $13.000 🎉</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:11, color:"#888", marginBottom:6 }}>Cupón:</div>
                <div onClick={()=>navigator.clipboard?.writeText("DM10")} style={{ background:"rgba(229,9,20,0.15)", border:"2px dashed #E50914", borderRadius:10, padding:"8px 14px", fontSize:16, fontWeight:800, color:"#E50914", cursor:"pointer" }}>📋 DM10</div>
                <div style={{ fontSize:9, color:"#555", marginTop:3 }}>Toca para copiar</div>
              </div>
            </div>
          </div>
          <button onClick={()=>{ onAdd({ id:"vip", name:"Combo VIP 💎 (9 plataformas)", price:45000, img:IMG.comboVip, color:"#a855f7", desc:"Netflix+HBO+Prime+ViX+Crunchyroll+IPTV+Paramount+Plex+Jellyfin" }); onClose(); }} style={{ width:"100%", padding:18, background:"linear-gradient(135deg,#E50914,#a855f7)", border:"none", borderRadius:14, color:"#fff", fontWeight:800, fontSize:16, cursor:"pointer", fontFamily:"inherit", marginBottom:10 }}>
            💎 Agregar al carrito — $45.000
          </button>
          <button onClick={onClose} style={{ width:"100%", padding:10, background:"transparent", border:"none", color:t.muted, fontSize:12, cursor:"pointer", fontFamily:"inherit", marginBottom:20 }}>No gracias, continuar sin descuento</button>
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ onLogin, onBack, dark }) {
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const t = getTheme(dark);
  const handle = async () => {
    if (!u.trim()||!p.trim()) return;
    setLoading(true); setErr("");
    try {
      const res = await fetch("/auth-validador", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({user:u.trim(),pass:p.trim()}) });
      const data = await res.json();
      if (data.ok) onLogin();
      else setErr(data.mensaje||"Usuario o contraseña incorrectos");
    } catch(e) { setErr("Error de conexión. Intenta de nuevo."); }
    setLoading(false);
  };
  return (
    <div style={{ minHeight:"100vh", width:"100%", background:t.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'Outfit',system-ui,sans-serif", boxSizing:"border-box", position:"relative" }}>
      <div style={{ position:"fixed", top:20, left:20, zIndex:10 }}><BackButton onClick={onBack} dark={dark} /></div>
      <div style={{ width:"100%", maxWidth:460, animation:"fadeUp 0.3s ease" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:60, marginBottom:14 }}>🔐</div>
          <h2 style={{ fontWeight:800, fontSize:28, marginBottom:8, color:t.text }}>Validador de Códigos</h2>
          <p style={{ color:t.muted, fontSize:14, marginBottom:10 }}>Acceso restringido — Digital Market</p>
          <p style={{ color:t.muted, fontSize:13 }}>¿No sabes el usuario? <a onClick={()=>window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Necesito acceso al validador de códigos")}`, "_blank")} style={{ color:"#7c3aed", cursor:"pointer", textDecoration:"underline" }}>Contacta soporte</a></p>
        </div>
        <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:20, padding:36, boxShadow:dark?"0 8px 32px rgba(0,0,0,0.35)":"0 8px 32px rgba(0,0,0,0.08)" }}>
          <label style={{ display:"block", fontSize:12, fontWeight:700, color:t.muted, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Usuario</label>
          <div className="login-field" style={{ display:"flex", alignItems:"center", gap:10, width:"100%", background:t.bg, border:`1px solid ${t.border}`, borderRadius:12, padding:"15px 16px", marginBottom:20, boxSizing:"border-box" }}>
            <span style={{ fontSize:18, opacity:0.6, flexShrink:0 }}>👤</span>
            <input value={u} onChange={e=>setU(e.target.value)} placeholder="Ingresa tu usuario" style={{ flex:1, width:"100%", minWidth:0, background:"transparent", border:"none", outline:"none", color:t.text, fontSize:15, fontFamily:"inherit" }} />
          </div>
          <label style={{ display:"block", fontSize:12, fontWeight:700, color:t.muted, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Contraseña</label>
          <div className="login-field" style={{ display:"flex", alignItems:"center", gap:10, width:"100%", background:t.bg, border:`1px solid ${t.border}`, borderRadius:12, padding:"15px 16px", marginBottom:22, boxSizing:"border-box" }}>
            <span style={{ fontSize:18, opacity:0.6, flexShrink:0 }}>🔑</span>
            <input value={p} onChange={e=>setP(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()} type="password" placeholder="Ingresa tu contraseña" style={{ flex:1, width:"100%", minWidth:0, background:"transparent", border:"none", outline:"none", color:t.text, fontSize:15, fontFamily:"inherit" }} />
          </div>
          {err && <p style={{ color:"#ef4444", fontSize:13, marginBottom:14, textAlign:"center", animation:"fadeUp 0.25s ease" }}>⚠️ {err}</p>}
          <button onClick={handle} className="login-submit" style={{ width:"100%", padding:16, background:"linear-gradient(135deg,#7c3aed,#6d28d9)", border:"none", borderRadius:12, color:"#fff", fontWeight:700, fontSize:16, cursor:"pointer", fontFamily:"inherit", opacity:loading?0.7:1 }}>{loading?"Verificando...":"Ingresar"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── VALIDAR CODIGO ───────────────────────────────────────────────────────────
function ValidarCodigo({ onBack, dark }) {
  const [auth, setAuth] = useState(false);
  const [platform, setPlatform] = useState(null);
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const t = getTheme(dark);

  if (!auth) return <Login onLogin={()=>setAuth(true)} onBack={onBack} dark={dark} />;

  const buscar = async () => {
    if (!email.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`${OTP_URL}/buscar-correo`, { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ email:email.trim(), plataforma:platform||"ambas" }) });
      if (!res.ok) throw new Error("HTTP "+res.status);
      const data = await res.json();
      if (data.ok) setResult(data.correo); else setError(data.mensaje);
    } catch(e) { setError("Error de conexión. Intenta de nuevo."); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", width:"100%", background:t.bg, fontFamily:"'Outfit',system-ui,sans-serif", color:t.text }}>
      <div style={{ maxWidth:960, margin:"0 auto", paddingBottom:40 }}>
      <div style={{ padding:"16px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", gap:12, background:t.surface }}>
        <BackButton onClick={onBack} dark={dark} label="" />
        <div style={{ width:40, height:40, background:"linear-gradient(135deg,#7c3aed,#a78bfa)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🔐</div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:800, fontSize:17 }}>Validar Código</div>
          <div style={{ color:t.muted, fontSize:11 }}>Solo códigos de acceso temporal</div>
        </div>
        <button onClick={()=>setAuth(false)} style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:8, padding:"5px 10px", color:t.muted, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>Cerrar sesión</button>
      </div>
      <div style={{ padding:16 }}>
        {!platform ? (
          <>
            <p style={{ color:t.muted, fontSize:14, marginBottom:20, textAlign:"center", fontWeight:600 }}>Selecciona la plataforma</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
              <button onClick={()=>setPlatform("netflix")} style={{ background:"#1a0000", border:"2px solid #E50914", borderRadius:18, padding:24, cursor:"pointer", fontFamily:"inherit", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
                <div style={{ width:90, height:90, borderRadius:18, overflow:"hidden", background:"#000" }}>
                  <img src={IMG.netflix} alt="Netflix" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                </div>
                <div style={{ color:"#fff", fontWeight:800, fontSize:18 }}>Netflix</div>
                <div style={{ color:"#E50914", fontSize:12 }}>Código de hogar</div>
              </button>
              <button onClick={()=>setPlatform("disney")} style={{ background:"#00001a", border:"2px solid #0063e5", borderRadius:18, padding:24, cursor:"pointer", fontFamily:"inherit", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
                <div style={{ width:90, height:90, borderRadius:18, overflow:"hidden", background:"#000" }}>
                  <img src={IMG.disneyPrem} alt="Disney+" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                </div>
                <div style={{ color:"#fff", fontWeight:800, fontSize:18 }}>Disney+</div>
                <div style={{ color:"#0063e5", fontSize:12 }}>Código acceso único</div>
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <button onClick={()=>{ setPlatform(null); setResult(null); setError(null); }} style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:8, padding:"6px 12px", color:t.muted, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>← Cambiar</button>
              <div style={{ fontWeight:700, fontSize:15 }}>{platform==="netflix"?"🎬 Netflix — Código de hogar":"✨ Disney+ — Código acceso único"}</div>
            </div>
            <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:14, padding:16, marginBottom:14 }}>
              <p style={{ color:t.muted, fontSize:12, fontWeight:600, marginBottom:14, textTransform:"uppercase", letterSpacing:1 }}>📋 Instrucciones</p>
              {(platform==="netflix"?[
                ["1","Abre Netflix en tu dispositivo"],
                ["2","Selecciona \"Estoy de viaje\" o \"Obtener código\""],
                ["3","Haz clic en \"Ir a Netflix\" abajo para solicitar el código"],
                ["4","Espera 2-3 minutos y busca con tu correo aquí"],
              ]:[
                ["1","Abre Disney+ en tu dispositivo"],
                ["2","Selecciona \"Enviar código\" en el mensaje de verificación"],
                ["3","Haz clic en \"Ir a Disney+\" abajo para solicitar el código"],
                ["4","Espera 2-3 minutos y busca con tu correo aquí"],
              ]).map(([n,d],i)=>(
                <div key={i} style={{ display:"flex", gap:10, marginBottom:i<3?12:0 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:"#7c3aed22", border:"1px solid #7c3aed44", display:"flex", alignItems:"center", justifyContent:"center", color:"#a78bfa", fontWeight:700, fontSize:13, flexShrink:0 }}>{n}</div>
                  <div style={{ color:t.muted, fontSize:14, lineHeight:1.5, paddingTop:4 }}>{d}</div>
                </div>
              ))}
              <button onClick={()=>window.open(platform==="netflix"?"https://www.netflix.com/password":"https://www.disneyplus.com","_blank")} style={{ display:"block", width:"100%", marginTop:16, padding:"13px 0", background:platform==="netflix"?"#E50914":"#0063e5", border:"none", borderRadius:12, color:"#fff", fontWeight:700, fontSize:15, textAlign:"center", cursor:"pointer", fontFamily:"inherit" }}>
                {platform==="netflix"?"🎬 Ir a Netflix":"✨ Ir a Disney+"}
              </button>
            </div>
            <div style={{ background:"#1a0f0f", borderLeft:"3px solid #ef4444", borderRadius:10, padding:"10px 14px", marginBottom:14 }}>
              <p style={{ fontSize:12, color:"#fca5a5" }}>⚠️ Solo se muestran códigos de acceso temporal. Ningún otro correo es visible.</p>
            </div>
            <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:14, padding:14, marginBottom:12 }}>
              <div style={{ display:"flex", gap:8 }}>
                <input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&buscar()} type="email" placeholder="tucorreo@gmail.com" style={{ flex:1, background:t.bg, border:`1px solid ${t.border}`, borderRadius:10, padding:"12px 14px", color:t.text, fontSize:14, fontFamily:"inherit" }} />
                <button onClick={buscar} disabled={loading||!email.trim()} style={{ background:loading||!email.trim()?"#1a2535":"linear-gradient(135deg,#7c3aed,#6d28d9)", border:"none", borderRadius:10, padding:"12px 16px", color:"#fff", fontSize:13, fontWeight:700, cursor:email.trim()&&!loading?"pointer":"not-allowed", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}>
                  {loading?<div style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/>:"🔍 Buscar"}
                </button>
              </div>
            </div>
            {error && <div style={{ background:"#1a0f0f", border:"1px solid #3a1a1a", borderRadius:12, padding:16, textAlign:"center", marginBottom:10, animation:"fadeUp 0.2s ease" }}><div style={{ fontSize:32, marginBottom:8 }}>⏳</div><p style={{ color:"#fca5a5", fontSize:13, lineHeight:1.6, marginBottom:12 }}>{error}</p><button onClick={buscar} style={{ background:"#1e2a3a", border:"1px solid #2a3a4a", borderRadius:8, padding:"8px 16px", color:"#a78bfa", fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>↻ Reintentar</button></div>}
            {result && (
              <div style={{ animation:"fadeUp 0.3s ease" }}>
                <div style={{ background:t.card, borderRadius:14, overflow:"hidden", boxShadow:dark?"0 8px 32px rgba(0,0,0,0.5)":"0 8px 32px rgba(0,0,0,0.1)", border:`1px solid ${t.border}` }}>
                  <div style={{ background:"linear-gradient(135deg,#7c3aed,#a78bfa)", padding:"10px 16px", display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:8, height:8, background:"#10b981", borderRadius:"50%" }} />
                    <span style={{ fontSize:13, color:"rgba(255,255,255,0.95)", fontWeight:700 }}>✓ Código encontrado</span>
                  </div>
                  <div style={{ padding:"12px 16px", display:"flex", gap:10, borderBottom:`1px solid ${t.border}` }}>
                    <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a78bfa)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, flexShrink:0 }}>{result.de?.[0]?.toUpperCase()||"N"}</div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:11, color:t.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{result.de}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:t.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{result.asunto}</div>
                      <div style={{ fontSize:11, color:t.muted }}>Recibido: {result.hora}</div>
                    </div>
                  </div>
                  <div style={{ padding:"8px 12px", background:"#fff", maxHeight:420, overflowY:"auto", overflowX:"hidden" }}>
                    <div style={{ transform:"scale(0.72)", transformOrigin:"top left", width:"138.9%", pointerEvents:"none" }} dangerouslySetInnerHTML={{ __html:result.cuerpo }} />
                  </div>
                </div>
                <button onClick={buscar} style={{ width:"100%", marginTop:10, background:t.card, border:`1px solid ${t.border}`, borderRadius:10, padding:11, color:"#a78bfa", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>↻ Actualizar</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </div>
  );
}

// ─── CARRITO ──────────────────────────────────────────────────────────────────
function Carrito({ items, onRemove, onClear, onBack, dark }) {
  const total = items.reduce((s,i)=>s+i.price,0);
  const t = getTheme(dark);
  const checkout = () => {
    const lista = items.map((i,idx)=>`${idx+1}. ${i.name} — ${formatPrice(i.price)}`).join("\n");
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola! Quiero comprar:\n\n${lista}\n\nTotal: ${formatPrice(total)}\n\nPor favor confirmar 🙏`)}`, "_blank");
  };
  return (
    <div style={{ minHeight:"100vh", width:"100%", background:t.bg, fontFamily:"'Outfit',system-ui,sans-serif", color:t.text, position:"relative", overflow:"hidden" }}>
      {/* Decoraciones de fondo */}
      <div style={{ position:"absolute", top:-120, right:-120, width:320, height:320, borderRadius:"50%", background:"radial-gradient(circle, rgba(124,58,237,0.18), transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:-100, left:-100, width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, rgba(37,211,102,0.12), transparent 70%)", pointerEvents:"none" }} />
      <div style={{ maxWidth:960, margin:"0 auto", display:"flex", flexDirection:"column", minHeight:"100vh", position:"relative" }}>
      <div style={{ padding:"16px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", gap:12, background:t.surface, position:"sticky", top:0, zIndex:10, boxShadow:dark?"0 4px 16px rgba(0,0,0,0.3)":"0 4px 16px rgba(0,0,0,0.05)" }}>
        <BackButton onClick={onBack} dark={dark} label="" />
        <div style={{ flex:1 }}><div style={{ fontWeight:800, fontSize:18 }}>🛒 Mi Carrito</div><div style={{ color:t.muted, fontSize:12 }}>{items.length} producto{items.length!==1?"s":""}</div></div>
        {items.length>0 && <button onClick={onClear} className="hdr-btn" style={{ background:"#1a0f0f", border:"1px solid #3a1a1a", borderRadius:10, padding:"7px 14px", color:"#ef4444", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>🗑️ Vaciar</button>}
      </div>
      <div style={{ flex:1, padding:"14px 16px", overflowY:"auto" }}>
        {items.length===0 ? (
          <div style={{ textAlign:"center", padding:"70px 20px", animation:"fadeUp 0.4s ease" }}>
            <div style={{ fontSize:72, marginBottom:14, animation:"floatBob 3s ease-in-out infinite" }}>🛒</div>
            <div style={{ color:t.text, fontSize:18, fontWeight:700, marginBottom:6 }}>Tu carrito está vacío</div>
            <div style={{ color:t.muted, fontSize:13, marginBottom:24 }}>Explora el catálogo y agrega tus plataformas favoritas</div>
            <button onClick={onBack} className="hdr-btn" style={{ background:"linear-gradient(135deg,#7c3aed,#6d28d9)", border:"none", borderRadius:12, padding:"13px 28px", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 6px 18px rgba(124,58,237,0.35)" }}>Ver productos</button>
          </div>
        ) : (<>
          {items.map((item,i)=>(
            <div key={i} className="cart-item" style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:16, padding:14, marginBottom:10, display:"flex", alignItems:"center", gap:12, animation:"fadeUp 0.3s ease backwards", animationDelay:`${i*0.05}s` }}>
              <div style={{ width:60, height:60, borderRadius:12, overflow:"hidden", flexShrink:0, boxShadow:"0 4px 10px rgba(0,0,0,0.15)" }}><Img src={item.img} alt={item.name} size={60} style={{ borderRadius:0 }} /></div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</div>
                <div style={{ color:t.muted, fontSize:12, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.desc}</div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ color:item.color||t.text, fontWeight:900, fontSize:16, marginBottom:6 }}>{formatPrice(item.price)}</div>
                <button onClick={()=>onRemove(i)} className="remove-btn" style={{ background:"#1a0f0f", border:"1px solid #3a1a1a", borderRadius:8, color:"#ef4444", fontSize:11, fontWeight:600, cursor:"pointer", padding:"5px 10px", fontFamily:"inherit", display:"inline-flex", alignItems:"center", gap:4 }}>✕ Quitar</button>
              </div>
            </div>
          ))}
          <div style={{ background:"linear-gradient(135deg,#0d2e1a,#0a1f12)", border:"1px solid #1f4a30", borderRadius:16, padding:18, marginTop:14, animation:"fadeUp 0.3s ease" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontWeight:700, fontSize:16, color:"#a8e6c1" }}>Total a pagar</span>
              <span style={{ fontWeight:900, fontSize:26, color:"#25d366" }}>{formatPrice(total)}</span>
            </div>
          </div>
          <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:16, padding:16, marginTop:10 }}>
            <p style={{ color:t.muted, fontSize:12, marginBottom:14, fontWeight:600, textTransform:"uppercase", letterSpacing:1 }}>💳 Medios de pago</p>
            {[{icon:"🤍",name:"Nequi"},{icon:"❤️",name:"Daviplata"},{icon:"🔑",name:"Llaves (Cualquier Banco)"}].map((p,i)=>(
              <div key={i} className="payment-row" onClick={()=>navigator.clipboard?.writeText(PAGO_NUMERO)} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:i<2?10:0, cursor:"pointer", borderRadius:10, padding:"6px 8px" }}>
                <span style={{ fontSize:18 }}>{p.icon}</span>
                <span style={{ color:t.muted, fontSize:13 }}>{p.name}:</span>
                <span style={{ color:t.text, fontWeight:700, fontSize:15 }}>{PAGO_NUMERO}</span>
                <span style={{ marginLeft:"auto", fontSize:11, color:t.muted }}>📋</span>
              </div>
            ))}
          </div>
        </>)}
      </div>
      {items.length>0 && (
        <div style={{ padding:"14px 16px 32px" }}>
          <button onClick={checkout} className="checkout-btn" style={{ width:"100%", padding:18, background:"linear-gradient(135deg,#25d366,#128c7e)", border:"none", borderRadius:14, color:"#fff", fontWeight:700, fontSize:17, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
            💬 Finalizar por WhatsApp · {formatPrice(total)}
          </button>
        </div>
      )}
      </div>
    </div>
  );
}

// ─── MENU LATERAL ─────────────────────────────────────────────────────────────
function SideMenu({ open, onClose, onNav, cartCount, dark, onToggleTheme }) {
  const t = getTheme(dark);
  const [render, setRender] = useState(open);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (open) { setRender(true); setClosing(false); }
    else if (render) {
      setClosing(true);
      const timer = setTimeout(() => setRender(false), 250);
      return () => clearTimeout(timer);
    }
  }, [open, render]);
  if (!render) return null;
  const items = [
    {icon:"⭐",label:"Favoritos",key:"favoritos"},
    {icon:"📺",label:"Pantallas",key:"pantallas"},
    {icon:"🔥",label:"Combos",key:"combos"},
    {icon:"🗓️",label:"Meses",key:"meses"},
    {icon:"👥",label:"Seguidores",key:"seguidores"},
    {icon:"🔐",label:"Validar Código",key:"validar"},
    {icon:"🛒",label:"Carrito",key:"cart",badge:cartCount},
    {icon:"🤖",label:"Chat Bot",key:"chat"},
    {icon:"🆘",label:"Soporte",key:"soporte"},
    {icon:"📞",label:"WhatsApp",key:"wa"},
  ];
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:200, animation:closing?"overlayOut 0.25s ease forwards":"overlayIn 0.2s ease" }} />
      <div style={{ position:"fixed", top:0, left:0, bottom:0, width:270, background:t.surface, borderRight:`1px solid ${t.border}`, zIndex:201, display:"flex", flexDirection:"column", animation:closing?"menuSlideOut 0.25s ease forwards":"menuSlide 0.25s ease", boxShadow:"4px 0 24px rgba(0,0,0,0.25)" }}>
        <div style={{ padding:"24px 18px 18px", borderBottom:`1px solid ${t.border}`, background:dark?"linear-gradient(135deg,#150a25,#0e1520)":"linear-gradient(135deg,#f3edff,#ffffff)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <img src={LOGO_URL} alt="Digital Market" style={{ width:60, height:60, objectFit:"contain", borderRadius:12, flexShrink:0, filter:"drop-shadow(0 3px 12px rgba(168,85,247,0.45))" }} onError={e=>{ e.target.style.display="none"; }} />
            <div>
              <div style={{ fontWeight:900, fontSize:17, letterSpacing:0.3 }}>
                <span style={{ color:"#ff6b35" }}>Digital </span>
                <span style={{ color:"#a855f7" }}>Market</span>
              </div>
              <div style={{ fontSize:11, color:"#25d366", fontWeight:600, display:"flex", alignItems:"center", gap:5, marginTop:2 }}><span style={{ width:6, height:6, background:"#25d366", borderRadius:"50%", display:"inline-block", animation:"blink 1.6s ease infinite" }}/> En línea</div>
            </div>
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"10px 0" }}>
          {items.map((item,i)=>(
            <button key={item.key} onClick={()=>{ onNav(item.key); onClose(); }} className="menu-item" style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"13px 18px", background:"transparent", border:"none", color:t.text, fontSize:14, cursor:"pointer", fontFamily:"inherit", position:"relative", textAlign:"left", animation:`fadeUp 0.35s ease backwards`, animationDelay:`${i*0.04}s` }}>
              <span style={{ fontSize:20 }}>{item.icon}</span><span>{item.label}</span>
              {item.badge>0 && <div style={{ position:"absolute", right:18, background:"#E50914", color:"#fff", borderRadius:"50%", width:20, height:20, fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>{item.badge}</div>}
            </button>
          ))}
        </div>
        <div style={{ padding:"14px 18px", borderTop:`1px solid ${t.border}` }}>
          <button onClick={onToggleTheme} style={{ width:"100%", background:t.card, border:`1px solid ${t.border}`, borderRadius:10, padding:10, color:t.text, fontSize:13, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            {dark?"☀️ Modo día":"🌙 Modo oscuro"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── DETAIL ───────────────────────────────────────────────────────────────────
function Detail({ item, onBack, onAddCart, dark }) {
  const accent = item.color||"#fff";
  const t = getTheme(dark);
  return (
    <div style={{ minHeight:"100vh", background:t.bg, fontFamily:"'Outfit',system-ui,sans-serif", color:t.text, maxWidth:960, margin:"0 auto", display:"flex", flexDirection:"column", animation:"slideIn 0.22s ease" }}>
      <div style={{ padding:"16px", background:`linear-gradient(160deg,${accent}18 0%,${t.bg} 60%)`, borderBottom:`1px solid ${accent}22` }}>
        <div style={{ marginBottom:16 }}><BackButton onClick={onBack} dark={dark} /></div>
        <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
          <div style={{ width:100, height:100, borderRadius:16, overflow:"hidden", background:"#1a2535", flexShrink:0 }}>
            <img src={item.img} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"} />
          </div>
          <div style={{ flex:1 }}>
            {item.badge && <div style={{ display:"inline-block", background:accent, borderRadius:6, padding:"2px 8px", fontSize:10, fontWeight:700, color:"#fff", marginBottom:6 }}>{item.badge}</div>}
            <h2 style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>{item.name}</h2>
            <p style={{ color:t.muted, fontSize:13 }}>{item.desc}</p>
            <div style={{ marginTop:12, display:"inline-block", background:`${accent}1a`, border:`1px solid ${accent}44`, borderRadius:10, padding:"8px 18px" }}>
              <span style={{ color:accent, fontWeight:900, fontSize:28 }}>{formatPrice(item.price)}</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding:"18px 16px", flex:1 }}>
        {item.features && (<>
          <p style={{ color:t.muted, fontSize:11, letterSpacing:"1px", textTransform:"uppercase", marginBottom:12, fontWeight:600 }}>Incluye</p>
          {item.features.map((f,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:`1px solid ${t.border}` }}>
              <div style={{ width:20, height:20, borderRadius:6, background:`${accent}1a`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:accent, flexShrink:0 }}>✓</div>
              <span style={{ color:t.text, fontSize:13 }}>{f}</span>
            </div>
          ))}
        </>)}
      </div>
      <div style={{ padding:"14px 16px 32px", display:"flex", flexDirection:"column", gap:8 }}>
        <button onClick={()=>{ onAddCart(item); onBack(); }} style={{ width:"100%", padding:15, background:`linear-gradient(135deg,${accent},${accent}99)`, border:"none", borderRadius:13, color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>🛒 Agregar al carrito</button>
        <button onClick={()=>{ const msg=`Hola! Quiero comprar ${item.name} por ${formatPrice(item.price)} 🙏`; window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`,"_blank"); }} style={{ width:"100%", padding:13, background:"linear-gradient(135deg,#25d366,#128c7e)", border:"none", borderRadius:13, color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>💬 Comprar por WhatsApp</button>
      </div>
    </div>
  );
}

// ─── SOPORTE ──────────────────────────────────────────────────────────────────
// ─── BASE DE CONOCIMIENTO DE ERRORES ──────────────────────────────────────────
const ERRORES_COMUNES = [
  {
    id:"hogar",
    icon:"🏠",
    title:"Error de Hogar / \"Tu dispositivo no forma parte de este Hogar\"",
    keywords:["hogar","dispositivo no pertenece","actualizar hogar","ubicacion principal","household"],
    causa:"Netflix detecta que estás conectado desde una red WiFi diferente a la del titular y pide confirmar el Hogar.",
    solucion:"1. Mantén la app abierta y NO la cierres.\n2. Te enviaremos un código de 4 dígitos al correo en minutos.\n3. Ingresa ese código donde Netflix te lo solicite.\n4. Listo, tu Hogar queda confirmado por 31 días.",
    necesitaCodigo:true,
    reportable:true
  },
  {
    id:"password",
    icon:"❌",
    title:'Contraseña incorrecta',
    keywords:["contraseña incorrecta","password","clave mal","no entra contraseña","credenciales incorrectas"],
    causa:"La contraseña fue copiada con espacios extra, mayúsculas distintas, o fue cambiada por error.",
    solucion:"1. Copia la contraseña que te enviamos exactamente como está (sin espacios al inicio o final).\n2. Verifica que no tenga activado el autocorrector del teclado.\n3. Si copiaste bien y sigue sin funcionar, es posible que la cuenta necesite restablecimiento — repórtalo abajo.",
    necesitaCodigo:false,
    reportable:true
  },
  {
    id:"bloqueada",
    icon:"🔒",
    title:'"Esta cuenta está temporalmente bloqueada"',
    keywords:["bloqueada","cuenta bloqueada","suspendida","temporalmente bloqueada"],
    causa:"Demasiados intentos fallidos de inicio de sesión activaron un bloqueo temporal de seguridad.",
    solucion:"1. Espera 30 minutos sin intentar iniciar sesión.\n2. Vuelve a intentar con la contraseña exacta que te dimos.\n3. Si sigue bloqueada después de 30 min, repórtalo para que revisemos la cuenta.",
    necesitaCodigo:false,
    reportable:true
  },
  {
    id:"verificacion2",
    icon:"📲",
    title:'Código de verificación en dos pasos',
    keywords:["verificacion en dos pasos","codigo de verificacion","2fa","doble verificacion"],
    causa:"La plataforma quiere confirmar que eres tú quien intenta ingresar, por seguridad adicional.",
    solucion:"1. El código llega al correo del titular de la cuenta, no al tuyo.\n2. Te lo enviamos en minutos desde el Validador de Códigos.\n3. Ingresa el código apenas te lo enviemos (vence en 15 minutos).",
    necesitaCodigo:true,
    reportable:true
  },
  {
    id:"conexion",
    icon:"🌐",
    title:'"No se puede conectar" / Error de red',
    keywords:["no se puede conectar","error de red","sin conexion","no carga","no carga la app"],
    causa:"Problema de conexión a internet, no de la cuenta — puede ser tu WiFi, datos móviles o un servidor caído.",
    solucion:"1. Verifica que tengas internet activo (abre otra app o página).\n2. Prueba cambiar de WiFi a datos móviles (o viceversa).\n3. Cierra la app completamente y vuelve a abrirla.\n4. Reinicia el router si usas WiFi.\n5. Si el problema persiste solo en esta plataforma, puede ser una falla temporal del servicio — intenta en 10-15 minutos.",
    necesitaCodigo:false,
    reportable:true
  },
  {
    id:"limite_pantallas",
    icon:"🚫",
    title:'"Has alcanzado el límite de pantallas" / Error 13',
    keywords:["limite de pantallas","maximo de dispositivos","error 13","demasiados dispositivos","ya hay alguien viendo"],
    causa:"Otro perfil de la cuenta está usando el máximo de pantallas simultáneas permitidas en ese momento.",
    solucion:"1. Espera unos minutos y vuelve a intentar — es posible que otro usuario cierre su sesión.\n2. Evita ver contenido en varios dispositivos a la vez con el mismo perfil.\n3. Si el problema es constante (no solo ocasional), repórtalo para revisar la asignación de pantallas.",
    necesitaCodigo:false,
    reportable:true
  },
  {
    id:"removido",
    icon:"🔄",
    title:'"Tu cuenta fue removida" o dejó de funcionar antes de tiempo',
    keywords:["cuenta removida","dejo de funcionar","se quito el acceso","ya no funciona","perdi el acceso"],
    causa:"El acceso se interrumpió antes de la fecha de vencimiento de tu plan — puede ser un cambio de contraseña por el titular original o un ajuste de la plataforma.",
    solucion:"Esto no debería pasar dentro del periodo que compraste. Si tu plan aún no vence, te repondremos el tiempo perdido sin costo adicional. Por favor reporta este error con una captura para que lo resolvamos hoy mismo.",
    necesitaCodigo:false,
    reportable:true
  },
  {
    id:"dispositivo_incompatible",
    icon:"📱",
    title:'"No compatible con tu dispositivo" (IPTV / WIN+)',
    keywords:["no compatible","dispositivo no soportado","solo smart tv","no funciona en celular"],
    causa:"Algunos servicios como IPTV y WIN+ son exclusivos para Smart TV y no funcionan en celular o computador.",
    solucion:"1. Verifica que estés intentando acceder desde una Smart TV.\n2. Si no tienes Smart TV, contamos con apps de IPTV para celular — pregúntanos cuál te conviene.\n3. Revisa que tu Smart TV tenga la app instalada correctamente.",
    necesitaCodigo:false,
    reportable:true
  },
  {
    id:"perfil_eliminado",
    icon:"👤",
    title:'Mi perfil desapareció o no lo encuentro',
    keywords:["perfil desaparecio","no encuentro mi perfil","borraron mi perfil","perfil eliminado"],
    causa:"El titular de la cuenta pudo haber editado los perfiles, o la cuenta alcanzó el límite de perfiles permitidos.",
    solucion:"NO crees un perfil nuevo ni edites los existentes — esto puede afectar a otros usuarios de la cuenta. Repórtalo de inmediato para que el administrador revise y restaure tu acceso.",
    necesitaCodigo:false,
    reportable:true
  },
  {
    id:"pago_pendiente",
    icon:"💳",
    title:'"Actualiza tu método de pago" o "cuenta suspendida por pago"',
    keywords:["actualizar pago","metodo de pago","suspendida por pago","problema con el pago","actualiza tus datos de pago"],
    causa:"La plataforma muestra este mensaje al titular de la cuenta original, no afecta directamente tu acceso comprado con nosotros — pero puede ser indicio de que el titular dejó de pagar.",
    solucion:"Este mensaje normalmente NO debes tocarlo ni intentar pagar tú mismo. Repórtalo con una captura para verificar el estado real de la cuenta y darte una solución o reposición.",
    necesitaCodigo:false,
    reportable:true
  },
];

function SoporteIA({ onBack, dark, onOpenValidador }) {
  const t = getTheme(dark);
  const [step, setStep] = useState("inicio"); // inicio | seleccion | diagnostico | reporte
  const [selectedError, setSelectedError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [resuelto, setResuelto] = useState(null);

  const filtrados = ERRORES_COMUNES.filter(e=>{
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return e.title.toLowerCase().includes(q) || e.keywords.some(k=>k.includes(q));
  });

  if (step==="reporte") return <ReportarError onBack={()=>setStep("diagnostico")} dark={dark} prefill={selectedError?selectedError.title:""} />;

  return (
    <div style={{ minHeight:"100vh", width:"100%", background:t.bg, fontFamily:"'Outfit',system-ui,sans-serif", color:t.text }}>
      <div style={{ maxWidth:960, margin:"0 auto", paddingBottom:40 }}>
        <div style={{ padding:"16px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", gap:12, background:t.surface, position:"sticky", top:0, zIndex:10 }}>
          <BackButton onClick={step==="diagnostico"?()=>{setStep("seleccion");setSelectedError(null);setResuelto(null);}:onBack} dark={dark} label="" />
          <div style={{ width:40, height:40, background:"linear-gradient(135deg,#3b82f6,#1d4ed8)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🛟</div>
          <div><div style={{ fontWeight:800, fontSize:18 }}>Soporte Inteligente</div><div style={{ color:t.muted, fontSize:11 }}>Resolvemos tu problema en segundos</div></div>
        </div>

        <div style={{ padding:16 }}>
          {step==="inicio" && (
            <>
              <div style={{ background:"linear-gradient(135deg,#0d1f35,#0a1628)", border:"1px solid #1e3a5f", borderRadius:16, padding:20, marginBottom:18, textAlign:"center" }}>
                <div style={{ fontSize:40, marginBottom:8 }}>🤖</div>
                <div style={{ fontWeight:800, fontSize:16, marginBottom:6 }}>¿Qué problema tienes?</div>
                <p style={{ color:t.muted, fontSize:13, lineHeight:1.6 }}>Selecciona tu error o descríbelo y te mostramos la causa y la solución al instante — sin esperar respuesta por WhatsApp.</p>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10, background:t.card, border:`1px solid ${t.border}`, borderRadius:14, padding:"12px 16px", marginBottom:16 }}>
                <span style={{ fontSize:18, opacity:0.5 }}>🔍</span>
                <input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Describe tu error... Ej: contraseña incorrecta" style={{ flex:1, background:"transparent", border:"none", outline:"none", color:t.text, fontSize:14, fontFamily:"inherit" }} />
              </div>
              <p style={{ color:t.muted, fontSize:12, marginBottom:10, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>Errores más comunes</p>
              {filtrados.map(err=>(
                <button key={err.id} onClick={()=>{ setSelectedError(err); setStep("diagnostico"); }} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"14px 16px", background:t.card, border:`1px solid ${t.border}`, borderRadius:12, marginBottom:8, cursor:"pointer", textAlign:"left", fontFamily:"inherit" }}>
                  <span style={{ fontSize:22, flexShrink:0 }}>{err.icon}</span>
                  <span style={{ flex:1, color:t.text, fontSize:13.5, fontWeight:600 }}>{err.title}</span>
                  <span style={{ color:t.muted, fontSize:14 }}>›</span>
                </button>
              ))}
              {filtrados.length===0 && (
                <div style={{ textAlign:"center", padding:"24px 0", color:t.muted, fontSize:13 }}>
                  No encontramos ese error en nuestra base. <br/>
                  <button onClick={()=>setStep("reporte")} style={{ marginTop:10, padding:"10px 20px", background:"#7c3aed", border:"none", borderRadius:10, color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>Reportar este error</button>
                </div>
              )}
            </>
          )}

          {step==="diagnostico" && selectedError && resuelto===null && (
            <div style={{ animation:"fadeUp 0.3s ease" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <span style={{ fontSize:28 }}>{selectedError.icon}</span>
                <div style={{ fontWeight:800, fontSize:16 }}>{selectedError.title}</div>
              </div>
              <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:14, padding:16, marginBottom:14 }}>
                <p style={{ color:"#f59e0b", fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:0.5, marginBottom:8 }}>🔎 Causa probable</p>
                <p style={{ color:t.text, fontSize:13.5, lineHeight:1.6 }}>{selectedError.causa}</p>
              </div>
              <div style={{ background:"linear-gradient(135deg,#0a1f15,#0d2818)", border:"1px solid #1a4530", borderRadius:14, padding:16, marginBottom:16 }}>
                <p style={{ color:"#34d399", fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:0.5, marginBottom:8 }}>✅ Solución sugerida</p>
                <p style={{ color:t.text, fontSize:13.5, lineHeight:1.7, whiteSpace:"pre-wrap" }}>{selectedError.solucion}</p>
              </div>

              {selectedError.necesitaCodigo && (
                <button onClick={onOpenValidador} style={{ width:"100%", padding:15, background:"linear-gradient(135deg,#7c3aed,#6d28d9)", border:"none", borderRadius:13, color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit", marginBottom:12, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  🔐 Abrir Validador de Códigos
                </button>
              )}

              <p style={{ textAlign:"center", color:t.muted, fontSize:13, marginBottom:12 }}>¿Esto resolvió tu problema?</p>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>setResuelto(true)} style={{ flex:1, padding:13, background:t.card, border:`1px solid #34d399`, borderRadius:12, color:"#34d399", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>👍 Sí, gracias</button>
                <button onClick={()=>setResuelto(false)} style={{ flex:1, padding:13, background:t.card, border:`1px solid ${t.border}`, borderRadius:12, color:t.text, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>👎 Sigo con el problema</button>
              </div>
            </div>
          )}

          {step==="diagnostico" && resuelto===true && (
            <div style={{ textAlign:"center", padding:"40px 20px", animation:"fadeUp 0.3s ease" }}>
              <div style={{ fontSize:56, marginBottom:14 }}>🎉</div>
              <div style={{ fontWeight:800, fontSize:18, marginBottom:8 }}>¡Genial!</div>
              <p style={{ color:t.muted, fontSize:13, marginBottom:20 }}>Nos alegra haber resuelto tu problema sin esperas.</p>
              <button onClick={()=>{ setStep("inicio"); setSelectedError(null); setResuelto(null); setBusqueda(""); }} style={{ padding:"12px 24px", background:t.card, border:`1px solid ${t.border}`, borderRadius:12, color:t.text, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>← Volver al inicio</button>
            </div>
          )}

          {step==="diagnostico" && resuelto===false && selectedError?.reportable && (
            <div style={{ animation:"fadeUp 0.3s ease" }}>
              <div style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:14, padding:18, marginBottom:16, textAlign:"center" }}>
                <div style={{ fontSize:36, marginBottom:8 }}>📋</div>
                <p style={{ color:t.text, fontSize:14, fontWeight:700, marginBottom:6 }}>Vamos a reportarlo</p>
                <p style={{ color:t.muted, fontSize:12.5, lineHeight:1.6 }}>Adjunta una captura del error y nuestro equipo lo revisará directamente — esto es más rápido que escribir por WhatsApp.</p>
              </div>
              <button onClick={()=>setStep("reporte")} style={{ width:"100%", padding:15, background:"linear-gradient(135deg,#ef4444,#dc2626)", border:"none", borderRadius:13, color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit", marginBottom:10 }}>🚩 Reportar este error</button>
              <button onClick={()=>window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola! Tengo este problema: ${selectedError.title}`)}`,"_blank")} style={{ width:"100%", padding:13, background:"transparent", border:`1px solid ${t.border}`, borderRadius:12, color:t.muted, fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>💬 Prefiero escribir por WhatsApp</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function ReportarError({ onBack, dark, prefill="" }) {
  const t = getTheme(dark);
  const [correo, setCorreo] = useState("");
  const [descripcion, setDescripcion] = useState(prefill);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [errorCorreo, setErrorCorreo] = useState("");
  const fileRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > 15*1024*1024) { alert("La imagen supera el máximo de 15 MB. Por favor elige una más liviana."); return; }
    setImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const validarYEnviar = async () => {
    if (!correo.trim()) { setErrorCorreo("Escribe el correo de la cuenta para identificarla"); return; }
    if (!validarEmail(correo)) { setErrorCorreo("Ese correo no parece válido, revísalo"); return; }
    if (!descripcion.trim()) { alert("Describe el fallo antes de enviar"); return; }
    if (!image) { alert("La imagen del error es obligatoria para que el administrador pueda revisar el caso"); return; }
    setErrorCorreo("");
    setEnviando(true);
    try {
      const res = await fetch("/reporte-error", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ correo:correo.trim(), descripcion, imagen:imagePreview }) });
      const data = await res.json();
      setEnviando(false);
      if (!data.ok) { alert(data.mensaje || "No se pudo enviar el reporte, intenta de nuevo"); return; }
    } catch(e) { setEnviando(false); }
    setEnviado(true);
  };

  const mensajeWA = `🚩 REPORTE DE ERROR\n\nCorreo de la cuenta: ${correo}\n\nDescripción: ${descripcion}\n\n(Voy a adjuntar la captura del error aquí mismo)`;

  if (enviado) {
    return (
      <div style={{ minHeight:"100vh", width:"100%", background:t.bg, fontFamily:"'Outfit',system-ui,sans-serif", color:t.text, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div style={{ maxWidth:480, textAlign:"center", animation:"fadeUp 0.4s ease" }}>
          <div style={{ fontSize:64, marginBottom:18 }}>✅</div>
          <div style={{ fontWeight:800, fontSize:24, marginBottom:12 }}>¡Reporte registrado!</div>
          <p style={{ color:t.muted, fontSize:16, lineHeight:1.7, marginBottom:28 }}>Tu reporte ya quedó guardado y será revisado pronto. Si quieres una respuesta más rápida, también puedes avisarnos por WhatsApp adjuntando la misma captura.</p>
          <button onClick={()=>window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(mensajeWA)}`,"_blank")} style={{ width:"100%", padding:17, background:"linear-gradient(135deg,#25d366,#128c7e)", border:"none", borderRadius:14, color:"#fff", fontWeight:700, fontSize:16, cursor:"pointer", fontFamily:"inherit", marginBottom:12 }}>💬 También avisar por WhatsApp</button>
          <button onClick={onBack} style={{ width:"100%", padding:15, background:t.card, border:`1px solid ${t.border}`, borderRadius:14, color:t.text, fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>← Volver al inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", width:"100%", background:t.bg, fontFamily:"'Outfit',system-ui,sans-serif", color:t.text }}>
      <div style={{ maxWidth:640, margin:"0 auto", paddingBottom:60 }}>
        <div style={{ padding:"18px 16px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", gap:12, background:t.surface, position:"sticky", top:0, zIndex:10 }}>
          <BackButton onClick={onBack} dark={dark} label="" />
          <div style={{ width:44, height:44, background:"linear-gradient(135deg,#ef4444,#dc2626)", borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🚩</div>
          <div><div style={{ fontWeight:800, fontSize:20 }}>Reportar un error</div><div style={{ color:t.muted, fontSize:12.5 }}>3 pasos rápidos — lo revisamos lo antes posible</div></div>
        </div>

        <div style={{ padding:22 }}>
          {/* PASO 1: Correo */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <div style={{ width:26, height:26, borderRadius:8, background:"linear-gradient(135deg,#7c3aed,#a78bfa)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:13, flexShrink:0 }}>1</div>
            <label style={{ fontWeight:800, fontSize:16 }}>¿Cuál es el correo de la cuenta?</label>
          </div>
          <p style={{ color:t.muted, fontSize:13.5, marginBottom:10, lineHeight:1.6, paddingLeft:36 }}>Escribe el correo con el que entras a tu cuenta de streaming. Esto nos ayuda a identificar exactamente cuál es tu cuenta para revisarla rápido. Tu información es privada y solo la usamos para resolver tu caso.</p>
          <input
            value={correo}
            onChange={e=>{ setCorreo(e.target.value); setErrorCorreo(""); }}
            placeholder="tucorreo@gmail.com"
            type="email"
            style={{ width:"100%", background:t.card, border:`1.5px solid ${errorCorreo?"#ef4444":t.border}`, borderRadius:12, padding:"15px 16px", color:t.text, fontSize:16, fontFamily:"inherit", outline:"none", marginBottom:errorCorreo?6:24, boxSizing:"border-box" }}
          />
          {errorCorreo && <p style={{ color:"#ef4444", fontSize:13, marginBottom:24, fontWeight:600 }}>⚠️ {errorCorreo}</p>}

          {/* PASO 2: Descripción */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <div style={{ width:26, height:26, borderRadius:8, background:"linear-gradient(135deg,#7c3aed,#a78bfa)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:13, flexShrink:0 }}>2</div>
            <label style={{ fontWeight:800, fontSize:16 }}>Describe el fallo</label>
          </div>
          <p style={{ color:t.muted, fontSize:13.5, marginBottom:10, lineHeight:1.6, paddingLeft:36 }}>Cuéntanos qué pasa exactamente con la cuenta (error de acceso, perfil, contraseña, etc). Ejemplo: "No puedo iniciar sesión, aparece credenciales incorrectas".</p>
          <textarea
            value={descripcion}
            onChange={e=>setDescripcion(e.target.value)}
            placeholder="Escribe aquí el detalle del problema..."
            rows={4}
            style={{ width:"100%", background:t.card, border:`1.5px solid ${t.border}`, borderRadius:12, padding:16, color:t.text, fontSize:15.5, fontFamily:"inherit", outline:"none", resize:"vertical", marginBottom:26, boxSizing:"border-box", lineHeight:1.5 }}
          />

          {/* PASO 3: Imagen */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <div style={{ width:26, height:26, borderRadius:8, background:"linear-gradient(135deg,#7c3aed,#a78bfa)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:13, flexShrink:0 }}>3</div>
            <label style={{ fontWeight:800, fontSize:16 }}>Adjunta una captura del error</label>
          </div>
          <p style={{ color:t.muted, fontSize:13.5, marginBottom:12, lineHeight:1.6, paddingLeft:36 }}>Toma una foto o captura de pantalla del mensaje de error tal como aparece en tu dispositivo.</p>
          <div
            onClick={()=>fileRef.current?.click()}
            onDragOver={e=>{e.preventDefault();setDragOver(true);}}
            onDragLeave={()=>setDragOver(false)}
            onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0]);}}
            style={{ border:`2.5px dashed ${dragOver?"#7c3aed":t.border}`, borderRadius:16, padding:imagePreview?14:32, textAlign:"center", cursor:"pointer", background:dragOver?"rgba(124,58,237,0.08)":t.card, transition:"all 0.2s ease", marginBottom:12 }}
          >
            <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp,.heic,.gif,.bmp" style={{ display:"none" }} onChange={e=>handleFile(e.target.files[0])} />
            {imagePreview ? (
              <div>
                <img src={imagePreview} alt="Captura" style={{ maxWidth:"100%", maxHeight:260, borderRadius:12, marginBottom:10 }} />
                <p style={{ color:"#a78bfa", fontSize:14, fontWeight:700 }}>✓ Imagen lista — toca para cambiarla</p>
              </div>
            ) : (
              <>
                <div style={{ fontSize:42, marginBottom:10 }}>📤</div>
                <p style={{ color:t.text, fontWeight:800, fontSize:17, marginBottom:6 }}>Subir captura</p>
                <p style={{ color:t.muted, fontSize:13.5, lineHeight:1.6 }}>Arrastra una imagen o haz clic para elegirla<br/>(JPG, PNG, WEBP, HEIC, GIF, BMP — máx. 15 MB)</p>
              </>
            )}
          </div>
          <p style={{ color:"#ef4444", fontSize:13.5, marginBottom:28, lineHeight:1.6, fontWeight:600 }}>⚠️ La imagen del error es obligatoria para que el administrador pueda revisar el caso</p>

          <button onClick={validarYEnviar} disabled={enviando} style={{ width:"100%", padding:18, background:"linear-gradient(135deg,#7c3aed,#6d28d9)", border:"none", borderRadius:14, color:"#fff", fontWeight:800, fontSize:17, cursor:"pointer", fontFamily:"inherit", opacity:enviando?0.7:1, marginBottom:10 }}>{enviando?"Enviando...":"📧 Enviar reporte"}</button>
          <button onClick={onBack} style={{ width:"100%", padding:15, background:"transparent", border:`1.5px solid ${t.border}`, borderRadius:14, color:t.muted, fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

function Soporte({ onBack, dark }) {
  const [open, setOpen] = useState(null);
  const t = getTheme(dark);
  const items = [
    {icon:"🏠",title:"¿Qué es el Código Hogar de Netflix?",content:"Netflix pide verificación cuando detecta que usas la cuenta desde una red diferente.\n\n1. Netflix envía un código de 4 dígitos al correo del titular.\n2. Escríbenos por WhatsApp — revisamos y te enviamos el código en minutos.\n3. Ingresa el código en tu dispositivo.\n\n⚠️ Este proceso es normal y seguro."},
    {icon:"❌",title:'"Contraseña incorrecta"',content:"Copia la contraseña exactamente como te la enviamos (sin espacios). Si persiste, escríbenos al WhatsApp."},
    {icon:"🔒",title:'"Esta cuenta está bloqueada"',content:"Espera 30 minutos e intenta de nuevo. Si sigue bloqueada, contáctanos."},
    {icon:"📲",title:'"Verificación en dos pasos"',content:"Escríbenos y te enviamos el código de verificación de inmediato."},
    {icon:"🌐",title:'"No se puede conectar"',content:"Verifica tu internet. Prueba con datos móviles en lugar de WiFi. Reinicia la app y el router."},
    {icon:"🚫",title:'"Pantallas al límite"',content:"Otro usuario está activo. Espera unos minutos o escríbenos para coordinarlo."},
    {icon:"🔄",title:'"Tu cuenta fue removida"',content:"Si el acceso se pierde antes de vencer, te reponemos el tiempo sin costo. Escríbenos con captura del error."},
    {icon:"⚠️",title:"No borres el perfil ni cambies la contraseña",content:"Modificar datos puede afectar a otros usuarios. Comunícate primero con nosotros."},
    {icon:"📱",title:'"No compatible con tu dispositivo"',content:"IPTV y WIN+ son exclusivas para Smart TV."},
    {icon:"💬",title:"¿No encontraste tu error? Nuestro soporte responde.",content:"Escríbenos directamente por WhatsApp y te ayudamos de inmediato."},
  ];
  return (
    <div style={{ minHeight:"100vh", width:"100%", background:t.bg, fontFamily:"'Outfit',system-ui,sans-serif", color:t.text }}>
      <div style={{ maxWidth:960, margin:"0 auto", paddingBottom:40 }}>
      <div style={{ padding:"16px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", gap:12, background:t.surface }}>
        <BackButton onClick={onBack} dark={dark} label="" />
        <div><div style={{ fontWeight:800, fontSize:20 }}>🆘 Soporte</div><div style={{ color:t.muted, fontSize:12 }}>Errores comunes y soluciones rápidas</div></div>
      </div>
      <div style={{ padding:16 }}>
        {items.map((it,i)=>(
          <div key={i} style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:14, marginBottom:10, overflow:"hidden" }}>
            <button onClick={()=>setOpen(open===i?null:i)} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"16px", background:"transparent", border:"none", color:t.text, fontSize:14, cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>
              <span style={{ fontSize:22, flexShrink:0 }}>{it.icon}</span>
              <span style={{ flex:1, fontWeight:600 }}>{it.title}</span>
              <span style={{ color:t.muted, fontSize:14, transition:"transform 0.2s", transform:open===i?"rotate(180deg)":"none" }}>▼</span>
            </button>
            {open===i && <div style={{ padding:"0 16px 16px 52px", color:t.muted, fontSize:13, lineHeight:1.7, whiteSpace:"pre-wrap" }}>{it.content}</div>}
          </div>
        ))}
        <button onClick={()=>window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hola! Necesito soporte 🙏")}`,"_blank")} style={{ width:"100%", marginTop:8, padding:16, background:"linear-gradient(135deg,#25d366,#128c7e)", border:"none", borderRadius:14, color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>
          💬 Escribir por WhatsApp
        </button>
      </div>
      </div>
    </div>
  );
}

// ─── SEGUIDORES ───────────────────────────────────────────────────────────────
function Seguidores({ onBack, onAddCart, dark, inline=false }) {
  const t = getTheme(dark);
  const [added, setAdded] = useState({});
  const handleAdd = (pk) => {
    onAddCart(pk);
    setAdded(a=>({...a,[pk.id]:true}));
    setTimeout(()=>setAdded(a=>({...a,[pk.id]:false})),1500);
  };
  const packs = [
    {id:"fb1k",name:"Facebook 1.000 Seguidores",price:38000,img:"/images/seg_facebook.png",color:"#1877F2",red:"Facebook",features:["1.000 seguidores","Entrega en 24-72h","Sin contraseña","Garantía 30 días"]},
    {id:"ig1k",name:"Instagram 1.000 Seguidores",price:38000,img:"/images/seg_instagram.png",color:"#E1306C",red:"Instagram",features:["1.000 seguidores","Perfil público","Entrega progresiva","Alta retención"]},
    {id:"tt1k",name:"TikTok 1.000 Seguidores",price:58000,img:"/images/seg_tiktok.png",color:"#ee1d52",red:"TikTok",features:["1.000 seguidores","Cuenta pública","Impulsa el algoritmo","Entrega rápida"]},
  ];
  const content = (
    <div style={{ padding: inline ? "16px 0" : 16 }}>
        {/* COMO FUNCIONA - VA PRIMERO */}
        <div style={{ background:dark?"linear-gradient(135deg,#0d1f35,#0a1628)":"linear-gradient(135deg,#e8f4fd,#dceefb)", border:`1px solid ${dark?"#1e3a5f":"#90cdf4"}`, borderRadius:16, padding:18, marginBottom:20 }}>
          <p style={{ color:dark?"#60a5fa":"#2b6cb0", fontSize:13, letterSpacing:"0.5px", textTransform:"uppercase", marginBottom:14, fontWeight:700 }}>📋 ¿Cómo funciona?</p>
          {[["1","Elige la red social y agrégala al carrito."],["2","Finaliza tu compra por WhatsApp."],["3","Envíanos el comprobante y tu usuario de la cuenta."],["4","Entrega en 8-24 horas de forma orgánica y gradual."]].map(([n,d],i)=>(
            <div key={i} style={{ display:"flex", gap:12, marginBottom:i<3?12:0, alignItems:"flex-start" }}>
              <div style={{ width:26, height:26, borderRadius:8, background:"linear-gradient(135deg,#3b82f6,#1d4ed8)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:12, flexShrink:0 }}>{n}</div>
              <div style={{ color:t.text, fontSize:14, lineHeight:1.5, paddingTop:3 }}>{d}</div>
            </div>
          ))}
        </div>
        {packs.map(pk=>(
          <div key={pk.id} style={{ background:t.card, border:`1px solid ${pk.color}33`, borderRadius:18, marginBottom:16, overflow:"hidden", display:"flex", gap:0 }}>
            <div style={{ width:"45%", maxWidth:200, flexShrink:0, overflow:"hidden", borderRadius:"18px 0 0 18px" }}>
              <img src={pk.img} alt={pk.red} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"} />
            </div>
            <div style={{ flex:1, padding:"16px 18px", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontWeight:800, fontSize:17, marginBottom:2 }}>{pk.red}</div>
                <div style={{ color:t.muted, fontSize:13, marginBottom:8 }}>1.000 seguidores</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:12 }}>
                  {pk.features.map((f,i)=>(
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:t.muted }}>
                      <span style={{ color:pk.color, fontWeight:700 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <div style={{ color:pk.color, fontWeight:900, fontSize:24, marginBottom:14 }}>{formatPrice(pk.price)}</div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>handleAdd(pk)} style={{ flex:1, padding:"11px 0", background:added[pk.id]?"linear-gradient(135deg,#10b981,#059669)":`linear-gradient(135deg,${pk.color},${pk.color}99)`, border:"none", borderRadius:10, color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", transition:"all 0.3s ease", transform:added[pk.id]?"scale(0.97)":"scale(1)" }}>{added[pk.id]?"✓ Agregado":"🛒 Agregar"}</button>
                <button onClick={()=>window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola! Quiero comprar ${pk.name} por ${formatPrice(pk.price)} 🙏`)}`,"_blank")} style={{ flex:1, padding:"11px 0", background:"linear-gradient(135deg,#25d366,#128c7e)", border:"none", borderRadius:10, color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>💬 WhatsApp</button>
              </div>
            </div>
          </div>
        ))}
      </div>
  );
  if (inline) return content;
  return (
    <div style={{ minHeight:"100vh", background:t.bg, fontFamily:"'Outfit',system-ui,sans-serif", color:t.text, maxWidth:960, margin:"0 auto", paddingBottom:40 }}>
      {content}
    </div>
  );
}

// ─── CHAT ─────────────────────────────────────────────────────────────────────
function Chat({ onBack, dark }) {
  const [messages, setMessages] = useState([{ role:"assistant", text:"¡Hola! 👋 Bienvenido a Digital Market 🚀\nSoy tu asistente virtual. Tenemos cuentas 100% originales.\n\n¿En qué te puedo ayudar hoy?" }]);
  const [input, setInput] = useState(""); const [loading, setLoading] = useState(false);
  const t = getTheme(dark);
  const bottomRef = useRef(null);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior:"smooth" }); },[messages]);
  const send = (text) => {
    if (!text.trim()||loading) return;
    const tx = text.trim(); setInput("");
    setMessages(p=>[...p,{role:"user",text:tx}]);
    setLoading(true);
    const reply = getBotReply(tx);
    const delay = 500 + Math.min(reply.length*8, 1200);
    setTimeout(()=>{
      setMessages(p=>[...p,{role:"assistant",text:reply}]);
      setLoading(false);
    }, delay);
  };
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", width:"100%", background:t.bg, fontFamily:"'Outfit',system-ui,sans-serif", color:t.text }}>
      <div style={{ maxWidth:960, margin:"0 auto", width:"100%", display:"flex", flexDirection:"column", height:"100vh" }}>
      <div style={{ padding:"12px 16px", background:t.surface, borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", gap:11 }}>
        <BackButton onClick={onBack} dark={dark} label="" />
        <div style={{ width:40, height:40, background:"linear-gradient(135deg,#7c3aed,#a78bfa)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🤖</div>
        <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:15 }}>Digital Market · Chat Bot</div><div style={{ fontSize:11, color:"#25d366" }}>● Activo ahora</div></div>
        <button onClick={()=>window.open(`https://wa.me/${WA_NUMBER}`,"_blank")} style={{ background:"#0d1f0d", border:"1px solid #1a3a1a", borderRadius:10, padding:"6px 10px", color:"#25d366", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>WhatsApp →</button>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"14px 16px", display:"flex", flexDirection:"column", gap:10 }}>
        {messages.map((m,i)=>(
          <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", animation:"fadeUp 0.18s ease" }}>
            {m.role==="assistant" && <div style={{ width:32, height:32, background:"linear-gradient(135deg,#7c3aed,#a78bfa)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, marginRight:8, flexShrink:0, alignSelf:"flex-end" }}>🤖</div>}
            <div style={{ maxWidth:"80%", padding:"11px 14px", borderRadius:m.role==="user"?"16px 3px 16px 16px":"3px 16px 16px 16px", background:m.role==="user"?"linear-gradient(135deg,#7c3aed,#6d28d9)":t.card, border:m.role==="user"?"none":`1px solid ${t.border}`, color:m.role==="user"?"#fff":t.text, fontSize:14, lineHeight:1.65, whiteSpace:"pre-wrap" }}>{m.text}</div>
          </div>
        ))}
        {loading && <div style={{ display:"flex", gap:4, paddingLeft:40 }}>{[0,1,2].map(i=><div key={i} style={{ width:8, height:8, background:"#7c3aed", borderRadius:"50%", animation:`blink 1s ease ${i*0.2}s infinite` }}/>)}</div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{ padding:"10px 14px 26px", background:t.surface, borderTop:`1px solid ${t.border}` }}>
        <div style={{ display:"flex", gap:6, marginBottom:9, overflowX:"auto", paddingBottom:2 }}>
          {["¿Qué plataformas?","Precios Netflix","Promo 🎁","Error al entrar","¿Cómo pago?","código ruleta"].map(tx=>(
            <button key={tx} onClick={()=>send(tx)} style={{ flexShrink:0, background:t.card, border:`1px solid ${t.border}`, borderRadius:20, color:t.muted, fontSize:11, padding:"6px 12px", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>{tx}</button>
          ))}
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"flex-end", background:t.card, border:`1px solid ${t.border}`, borderRadius:14, padding:"7px 7px 7px 13px" }}>
          <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send(input);} }} placeholder="Escribe tu mensaje..." rows={1} style={{ flex:1, background:"transparent", border:"none", color:t.text, fontSize:14, resize:"none", fontFamily:"inherit", lineHeight:1.5, paddingTop:3 }}/>
          <button onClick={()=>send(input)} disabled={!input.trim()||loading} style={{ width:38, height:38, background:input.trim()&&!loading?"linear-gradient(135deg,#7c3aed,#6d28d9)":"#1a2535", border:"none", borderRadius:10, color:"#fff", fontSize:16, cursor:input.trim()?"pointer":"default", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.18s" }}>→</button>
        </div>
      </div>
      </div>
    </div>
  );
}

// ─── BUSCADOR AVANZADO ────────────────────────────────────────────────────────
const ALL_ITEMS = [
  ...PANTALLAS,
  ...MESES,
  ...COMBOS,
  ...FAV_COMBOS,
];

const CATEGORIAS = ["Todas","Netflix","Spotify","YouTube","Disney+","HBO","Prime","Paramount","Crunchyroll","ViX","Plex","Jellyfin","IPTV","WIN+","DirecTV","Apple TV","Canva","PlayStation","Office","Combos","Seguidores"];

function Buscador({ dark, onBack, onAddCart, onDetail }) {
  const t = getTheme(dark);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Todas");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [sortBy, setSortBy] = useState("relevancia");

  const results = ALL_ITEMS.filter(item=>{
    const name = (item.name||"").toLowerCase();
    const desc = (item.desc||"").toLowerCase();
    const q = query.toLowerCase().trim();
    const matchQ = !q || name.includes(q) || desc.includes(q);
    const matchC = cat==="Todas" || name.includes(cat.toLowerCase()) || (item.cat||"").toLowerCase().includes(cat.toLowerCase());
    const matchP = item.price <= maxPrice;
    return matchQ && matchC && matchP;
  }).sort((a,b)=>{
    if (sortBy==="precio-asc") return a.price - b.price;
    if (sortBy==="precio-desc") return b.price - a.price;
    if (sortBy==="nombre") return a.name.localeCompare(b.name);
    return 0;
  });

  // Deduplicar por id
  const seen = new Set();
  const unique = results.filter(i=>{ if(seen.has(i.id)) return false; seen.add(i.id); return true; });

  return (
    <div style={{ minHeight:"100vh", width:"100%", background:t.bg, fontFamily:"'Outfit',system-ui,sans-serif", color:t.text }}>
      <div style={{ maxWidth:960, margin:"0 auto", paddingBottom:80 }}>
        {/* Header */}
        <div style={{ padding:"12px 16px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", gap:12, background:t.surface, position:"sticky", top:0, zIndex:10, boxShadow:dark?"0 4px 16px rgba(0,0,0,0.3)":"0 4px 16px rgba(0,0,0,0.05)" }}>
          <BackButton onClick={onBack} dark={dark} label="" />
          <span style={{ fontSize:22 }}>🔍</span>
          <span style={{ fontWeight:800, fontSize:18 }}>Buscar producto</span>
        </div>

        <div style={{ padding:16 }}>
          {/* Campo de búsqueda */}
          <div style={{ display:"flex", alignItems:"center", gap:10, background:t.card, border:`1px solid ${t.border}`, borderRadius:14, padding:"12px 16px", marginBottom:14 }}>
            <span style={{ fontSize:20, opacity:0.5 }}>🔍</span>
            <input
              autoFocus
              value={query}
              onChange={e=>setQuery(e.target.value)}
              placeholder="¿Qué estás buscando? Ej: Netflix, combo, Disney..."
              style={{ flex:1, background:"transparent", border:"none", outline:"none", color:t.text, fontSize:15, fontFamily:"inherit" }}
            />
            {query && <button onClick={()=>setQuery("")} style={{ background:"none", border:"none", color:t.muted, fontSize:18, cursor:"pointer" }}>×</button>}
          </div>

          {/* Filtros */}
          <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
            {/* Ordenar */}
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:10, padding:"8px 12px", color:t.text, fontSize:13, fontFamily:"inherit", cursor:"pointer", outline:"none" }}>
              <option value="relevancia">Relevancia</option>
              <option value="precio-asc">Menor precio</option>
              <option value="precio-desc">Mayor precio</option>
              <option value="nombre">A → Z</option>
            </select>
            {/* Precio máximo */}
            <div style={{ display:"flex", alignItems:"center", gap:8, background:t.card, border:`1px solid ${t.border}`, borderRadius:10, padding:"8px 12px" }}>
              <span style={{ color:t.muted, fontSize:12 }}>Hasta:</span>
              <span style={{ color:"#7c3aed", fontWeight:700, fontSize:13 }}>{formatPrice(maxPrice)}</span>
            </div>
          </div>

          {/* Slider de precio */}
          <div style={{ marginBottom:16, padding:"0 4px" }}>
            <input type="range" min={5000} max={100000} step={1000} value={maxPrice} onChange={e=>setMaxPrice(+e.target.value)}
              style={{ width:"100%", accentColor:"#7c3aed" }} />
            <div style={{ display:"flex", justifyContent:"space-between", color:t.muted, fontSize:11, marginTop:2 }}>
              <span>$5.000</span><span>$100.000</span>
            </div>
          </div>

          {/* Categorías */}
          <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:12, marginBottom:12, scrollbarWidth:"none" }}>
            {CATEGORIAS.map(c=>(
              <button key={c} onClick={()=>setCat(c)} style={{ flexShrink:0, padding:"7px 14px", background:cat===c?"#7c3aed":t.card, border:`1px solid ${cat===c?"#7c3aed":t.border}`, borderRadius:20, color:cat===c?"#fff":t.muted, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s ease" }}>{c}</button>
            ))}
          </div>

          {/* Resultados */}
          <div style={{ color:t.muted, fontSize:12, marginBottom:12 }}>
            {unique.length} resultado{unique.length!==1?"s":""} encontrado{unique.length!==1?"s":""}
          </div>

          {unique.length===0 ? (
            <div style={{ textAlign:"center", padding:"40px 20px", color:t.muted }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🤷</div>
              <div style={{ fontSize:16, fontWeight:600, marginBottom:8, color:t.text }}>Sin resultados</div>
              <div style={{ fontSize:13 }}>Intenta con otra palabra o ajusta el precio</div>
              <button onClick={()=>window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola! Estoy buscando "${query}" y no lo encontré en la página`)}`,"_blank")} style={{ marginTop:16, padding:"12px 24px", background:"linear-gradient(135deg,#25d366,#128c7e)", border:"none", borderRadius:10, color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>💬 Preguntar por WhatsApp</button>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {unique.map((item,i)=>(
                <div key={`${item.id}-${i}`} style={{ background:t.card, border:`1px solid ${item.color?item.color+"33":t.border}`, borderRadius:14, overflow:"hidden", display:"flex", animation:"fadeUp 0.25s ease backwards", animationDelay:`${i*0.03}s` }}>
                  <div style={{ width:90, height:90, flexShrink:0, overflow:"hidden" }}>
                    <Img src={item.img} alt={item.name} size={90} style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:0 }} />
                  </div>
                  <div style={{ flex:1, padding:"10px 14px", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14, marginBottom:2 }}>{item.name}</div>
                      <div style={{ color:t.muted, fontSize:11, marginBottom:4 }}>{item.desc}</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ color:item.color||"#7c3aed", fontWeight:900, fontSize:17 }}>{formatPrice(item.price)}</span>
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={()=>onAddCart(item)} style={{ padding:"6px 12px", background:`linear-gradient(135deg,${item.color||"#7c3aed"},${item.color||"#7c3aed"}88)`, border:"none", borderRadius:8, color:"#fff", fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>🛒</button>
                        <button onClick={()=>onDetail(item)} style={{ padding:"6px 12px", background:t.surface, border:`1px solid ${t.border}`, borderRadius:8, color:t.text, fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>Ver más</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState(()=>{ try{ const s=localStorage.getItem("dm_screen"); return ["home","favoritos","pantallas","combos","meses","seguidores"].includes(s)?s:"home"; }catch(e){ return "home"; } });
  const [activeTab, setActiveTab] = useState(()=>{ try{ return localStorage.getItem("dm_tab")||"favoritos"; }catch(e){ return "favoritos"; } });
  const [dark, setDark] = useState(()=>{ try{ const d=localStorage.getItem("dm_dark"); return d===null?true:d==="true"; }catch(e){ return true; } });
  const [detail, setDetail] = useState(null);
  const [cart, setCart] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showVip, setShowVip] = useState(false);
  const [showRuleta, setShowRuleta] = useState(false);
  const [showClub, setShowClub] = useState(false);
  const [cartAnim, setCartAnim] = useState(false);
  const t = getTheme(dark);

  useEffect(() => {
    const timer = setTimeout(() => setShowVip(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => { try{ localStorage.setItem("dm_screen", screen); }catch(e){} }, [screen]);
  useEffect(() => { try{ localStorage.setItem("dm_tab", activeTab); }catch(e){} }, [activeTab]);
  useEffect(() => { try{ localStorage.setItem("dm_dark", dark); }catch(e){} }, [dark]);

  const addCart = (item) => {
    setCart(p=>[...p,item]);
    setCartAnim(true);
    setTimeout(()=>setCartAnim(false), 400);
  };
  const removeCart = (i) => setCart(p=>p.filter((_,idx)=>idx!==i));

  const navigate = (key) => {
    if (key==="wa") { window.open(`https://wa.me/${WA_NUMBER}`,"_blank"); return; }
    setScreen(key);
  };

  if (screen==="search") return <Buscador dark={dark} onBack={()=>setScreen("home")} onAddCart={addCart} onDetail={(item)=>{ setDetail(item); setScreen("detail"); }} />;
  if (screen==="validar") return <ValidarCodigo onBack={()=>setScreen("home")} dark={dark} />;
  if (screen==="cart") return <Carrito items={cart} onRemove={removeCart} onClear={()=>setCart([])} onBack={()=>setScreen("home")} dark={dark} />;
  if (screen==="soporte") return <SoporteIA onBack={()=>setScreen("home")} dark={dark} onOpenValidador={()=>setScreen("validar")} />;
  if (screen==="reportar") return <ReportarError onBack={()=>setScreen("home")} dark={dark} />;
  if (screen==="chat") return <Chat onBack={()=>setScreen("home")} dark={dark} />;
  if (screen==="detail"&&detail) return <Detail item={detail} onBack={()=>setScreen("home")} onAddCart={(it)=>{ addCart(it); setScreen("home"); }} dark={dark} />;

  // ── PANTALLAS DE TABS ────────────────────────────────────────────────────────
  const TabHeader = ({title, icon}) => (
    <div style={{ minHeight:"100vh", width:"100%", background:t.bg, fontFamily:"'Outfit',system-ui,sans-serif", color:t.text }}>
      <div style={{ maxWidth:1400, margin:"0 auto" }}>
        <div style={{ padding:"12px 16px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", gap:12, background:t.surface, position:"sticky", top:0, zIndex:10, boxShadow:dark?"0 4px 16px rgba(0,0,0,0.3)":"0 4px 16px rgba(0,0,0,0.05)" }}>
          <BackButton onClick={()=>setScreen("home")} dark={dark} label="" />
          <span style={{ fontSize:22 }}>{icon}</span>
          <span style={{ fontWeight:800, fontSize:18, color:t.text }}>{title}</span>
        </div>
      </div>
    </div>
  );

  if (screen==="favoritos") return (
    <div style={{ minHeight:"100vh", width:"100%", background:t.bg, fontFamily:"'Outfit',system-ui,sans-serif", color:t.text }}>
      <style>{getCSS(dark)}</style>
      <div style={{ maxWidth:960, margin:"0 auto", paddingBottom:80 }}>
        <div style={{ padding:"12px 16px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", gap:12, background:t.surface, position:"sticky", top:0, zIndex:10, boxShadow:dark?"0 4px 16px rgba(0,0,0,0.3)":"0 4px 16px rgba(0,0,0,0.05)" }}>
          <BackButton onClick={()=>{ setActiveTab("favoritos"); setScreen("home"); }} dark={dark} label="" />
          <span style={{ fontSize:22 }}>⭐</span>
          <span style={{ fontWeight:800, fontSize:18 }}>Favoritos</span>
        </div>
        <div style={{ padding:"16px" }}>
          <p style={{ color:t.muted, fontSize:13, marginBottom:16 }}>Los combos más populares entre nuestros clientes ⭐</p>
          {FAV_COMBOS.map((c,i)=>(
            <div key={c.id} style={{ background:t.card, border:`1px solid ${c.color}33`, borderRadius:18, marginBottom:14, overflow:"hidden", display:"flex", animation:"fadeUp 0.3s ease backwards", animationDelay:`${i*0.04}s` }}>
              <div style={{ width:"42%", maxWidth:180, flexShrink:0, overflow:"hidden", borderRadius:"18px 0 0 18px", minHeight:120 }}>
                <Img src={c.img} alt={c.name} size={180} style={{ borderRadius:0, width:"100%", height:"100%", objectFit:"cover" }} />
              </div>
              <div style={{ flex:1, padding:"14px 16px", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontWeight:800, fontSize:15, marginBottom:3 }}>{c.name}</div>
                  <div style={{ color:t.muted, fontSize:12, marginBottom:6 }}>{c.desc}</div>
                  <div style={{ color:c.color||"#7c3aed", fontWeight:900, fontSize:20, marginBottom:10 }}>{formatPrice(c.price)}</div>
                </div>
                <div style={{ display:"flex", gap:7 }}>
                  <button onClick={(e)=>{ e.stopPropagation(); addCart(c); }} style={{ flex:1, padding:"9px 0", background:`linear-gradient(135deg,${c.color||"#7c3aed"},${c.color||"#7c3aed"}99)`, border:"none", borderRadius:9, color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>🛒 Agregar</button>
                  <button onClick={(e)=>{ e.stopPropagation(); window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola! Quiero comprar ${c.name} por ${formatPrice(c.price)} 🙏`)}`,"_blank"); }} style={{ flex:1, padding:"9px 0", background:"linear-gradient(135deg,#25d366,#128c7e)", border:"none", borderRadius:9, color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>💬 WhatsApp</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (screen==="pantallas") return (
    <div style={{ minHeight:"100vh", width:"100%", background:t.bg, fontFamily:"'Outfit',system-ui,sans-serif", color:t.text }}>
      <style>{getCSS(dark)}</style>
      <div style={{ maxWidth:1400, margin:"0 auto", paddingBottom:80 }}>
        <div style={{ padding:"12px 16px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", gap:12, background:t.surface, position:"sticky", top:0, zIndex:10, boxShadow:dark?"0 4px 16px rgba(0,0,0,0.3)":"0 4px 16px rgba(0,0,0,0.05)" }}>
          <BackButton onClick={()=>{ setActiveTab("pantallas"); setScreen("home"); }} dark={dark} label="" />
          <span style={{ fontSize:22 }}>📺</span>
          <span style={{ fontWeight:800, fontSize:18 }}>Pantallas</span>
        </div>
        <div style={{ padding:16 }}>
          <div className="product-grid">
            {PANTALLAS.map((item,i)=>(
              <div key={item.id} className="card-hover" onClick={()=>{ setDetail(item); setScreen("detail"); }} style={{ background:t.card, border:`1px solid ${item.badge?item.color+"44":t.border}`, borderRadius:16, overflow:"hidden", cursor:"pointer", position:"relative", animationDelay:`${(i%10)*0.04}s` }}>
                {item.badge && <div style={{ position:"absolute", top:8, left:8, zIndex:1, background:item.color, borderRadius:6, padding:"2px 8px", fontSize:9, fontWeight:700, color:"#fff" }}>{item.badge}</div>}
                <div style={{ width:"100%", aspectRatio:"1/1", overflow:"hidden", background:"#1a2535" }}><Img src={item.img} alt={item.name} size={200} style={{ borderRadius:0, width:"100%", height:"100%", objectFit:"cover" }} /></div>
                <div style={{ padding:"10px 12px 14px" }}>
                  <div style={{ fontWeight:700, fontSize:13, marginBottom:2 }}>{item.name}</div>
                  <div style={{ color:t.muted, fontSize:11, marginBottom:6 }}>{item.desc}</div>
                  <div style={{ color:item.color, fontWeight:800, fontSize:16 }}>{formatPrice(item.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (screen==="combos") return (
    <div style={{ minHeight:"100vh", width:"100%", background:t.bg, fontFamily:"'Outfit',system-ui,sans-serif", color:t.text }}>
      <style>{getCSS(dark)}</style>
      <div style={{ maxWidth:1400, margin:"0 auto", paddingBottom:80 }}>
        <div style={{ padding:"12px 16px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", gap:12, background:t.surface, position:"sticky", top:0, zIndex:10, boxShadow:dark?"0 4px 16px rgba(0,0,0,0.3)":"0 4px 16px rgba(0,0,0,0.05)" }}>
          <BackButton onClick={()=>{ setActiveTab("combos"); setScreen("home"); }} dark={dark} label="" />
          <span style={{ fontSize:22 }}>🔥</span>
          <span style={{ fontWeight:800, fontSize:18 }}>Combos</span>
        </div>
        <div style={{ padding:16 }}>
          <div style={{ background:"linear-gradient(135deg,#1f1200,#2a1800)", border:"1px solid #cccc0022", borderRadius:14, padding:"12px 16px", marginBottom:16 }}>
            <p style={{ color:"#cccc00", fontSize:12, lineHeight:1.6 }}>💡 <strong style={{ color:"#ffff88" }}>Combos = más plataformas por menos.</strong> Las activamos en minutos.</p>
          </div>
          <div className="product-grid">
            {COMBOS.map((c,i)=>(
              <div key={c.id} className="card-hover" onClick={()=>{ setDetail({...c,features:[c.desc,"Activación en minutos","Soporte incluido"]}); setScreen("detail"); }} style={{ background:t.card, border:`1px solid ${c.badge?c.color+"44":t.border}`, borderRadius:16, overflow:"hidden", cursor:"pointer", position:"relative", animationDelay:`${(i%10)*0.04}s` }}>
                {c.badge && <div style={{ position:"absolute", top:8, left:8, zIndex:1, background:c.color, borderRadius:6, padding:"2px 8px", fontSize:9, fontWeight:700, color:"#fff" }}>{c.badge}</div>}
                <div style={{ width:"100%", aspectRatio:"1/1", overflow:"hidden", background:"#1a2535" }}><Img src={c.img} alt={c.name} size={200} style={{ borderRadius:0, width:"100%", height:"100%", objectFit:"cover" }} /></div>
                <div style={{ padding:"10px 12px 14px" }}>
                  <div style={{ fontWeight:700, fontSize:13, marginBottom:2 }}>{c.name}</div>
                  <div style={{ color:t.muted, fontSize:11, marginBottom:6 }}>{c.desc}</div>
                  <div style={{ color:c.color, fontWeight:800, fontSize:16 }}>{formatPrice(c.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (screen==="meses") return (
    <div style={{ minHeight:"100vh", width:"100%", background:t.bg, fontFamily:"'Outfit',system-ui,sans-serif", color:t.text }}>
      <style>{getCSS(dark)}</style>
      <div style={{ maxWidth:1400, margin:"0 auto", paddingBottom:80 }}>
        <div style={{ padding:"12px 16px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", gap:12, background:t.surface, position:"sticky", top:0, zIndex:10, boxShadow:dark?"0 4px 16px rgba(0,0,0,0.3)":"0 4px 16px rgba(0,0,0,0.05)" }}>
          <BackButton onClick={()=>{ setActiveTab("meses"); setScreen("home"); }} dark={dark} label="" />
          <span style={{ fontSize:22 }}>🗓️</span>
          <span style={{ fontWeight:800, fontSize:18 }}>Paquetes por Meses</span>
        </div>
        <div style={{ padding:16 }}>
          {Object.entries(MESES.reduce((acc,item)=>{ (acc[item.cat]=acc[item.cat]||[]).push(item); return acc; },{})).map(([cat,items])=>(
            <div key={cat} style={{ marginBottom:24 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, paddingBottom:8, borderBottom:`1px solid ${t.border}` }}>
                <span style={{ fontWeight:700, fontSize:15, color:items[0].color }}>{cat}</span>
              </div>
              <div className="product-grid">
                {items.map((item,i)=>(
                  <div key={item.id} className="card-hover" onClick={()=>{ setDetail(item); setScreen("detail"); }} style={{ background:t.card, border:`1px solid ${item.badge?item.color+"44":t.border}`, borderRadius:14, overflow:"hidden", cursor:"pointer", position:"relative", animationDelay:`${(i%10)*0.04}s` }}>
                    {item.badge && <div style={{ position:"absolute", top:8, right:8, zIndex:1, background:item.color, borderRadius:5, padding:"2px 6px", fontSize:8, fontWeight:700, color:"#fff" }}>{item.badge}</div>}
                    <div style={{ width:"100%", aspectRatio:"1/1", overflow:"hidden", background:"#1a2535" }}><Img src={item.img} alt={item.name} size={200} style={{ borderRadius:0, width:"100%", height:"100%", objectFit:"cover" }} /></div>
                    <div style={{ padding:"10px 12px 14px" }}>
                      <div style={{ fontWeight:700, fontSize:13, marginBottom:2 }}>{item.name}</div>
                      <div style={{ color:t.muted, fontSize:11, marginBottom:6 }}>{item.desc}</div>
                      <div style={{ color:item.color, fontWeight:800, fontSize:16 }}>{formatPrice(item.price)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (screen==="seguidores") return (
    <div style={{ minHeight:"100vh", width:"100%", background:t.bg, fontFamily:"'Outfit',system-ui,sans-serif", color:t.text }}>
      <style>{getCSS(dark)}</style>
      <div style={{ maxWidth:960, margin:"0 auto", paddingBottom:80 }}>
        <div style={{ padding:"12px 16px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", gap:12, background:t.surface, position:"sticky", top:0, zIndex:10 }}>
          <BackButton onClick={()=>{ setActiveTab("seguidores"); setScreen("home"); }} dark={dark} label="" />
          <span style={{ fontSize:22 }}>👥</span>
          <span style={{ fontWeight:800, fontSize:18 }}>Seguidores</span>
        </div>
        <Seguidores onBack={()=>setScreen("home")} onAddCart={addCart} dark={dark} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:t.bg, fontFamily:"'Outfit',system-ui,sans-serif", color:t.text, maxWidth:1400, margin:"0 auto", paddingBottom:100 }}>
      <style>{getCSS(dark)}</style>

      {showVip && <VipModal onClose={()=>setShowVip(false)} onAdd={(it)=>{ addCart(it); setShowVip(false); }} dark={dark} />}
      {showWelcome && (
        <div onClick={()=>setShowWelcome(false)} style={{ position:"fixed", inset:0, zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.85)", animation:"overlayIn 0.4s ease" }}>
          <div style={{ textAlign:"center", animation:"fadeUp 0.5s ease", padding:32 }}>
            <img src={LOGO_URL} alt="Digital Market" style={{ width:160, height:160, objectFit:"contain", borderRadius:20, marginBottom:20, filter:"drop-shadow(0 0 32px rgba(168,85,247,0.7))" }} />
            <div style={{ fontSize:32, fontWeight:900, marginBottom:8 }}>
              <span style={{ color:"#ff6b35" }}>Digital </span>
              <span style={{ color:"#a855f7" }}>Market</span>
            </div>
            <p style={{ fontSize:16, marginBottom:6, fontWeight:700 }}><span style={{ color:"#60a5fa" }}>Streaming</span> <span style={{ color:"#f87171" }}>Premium</span> 🚀</p>
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>Toca para continuar</p>
          </div>
        </div>
      )}
      {showRuleta && <Ruleta dark={dark} onClose={()=>setShowRuleta(false)} />}
      {showClub && <ClubModal dark={dark} onClose={()=>setShowClub(false)} />}

      <SideMenu open={menuOpen} onClose={()=>setMenuOpen(false)} onNav={navigate} cartCount={cart.length} dark={dark} onToggleTheme={()=>setDark(d=>!d)} />

      {/* HEADER */}
      <div style={{ padding:"12px 16px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", gap:10, position:"sticky", top:0, background:t.surface, zIndex:100, boxShadow:dark?"0 4px 16px rgba(0,0,0,0.35)":"0 4px 16px rgba(0,0,0,0.06)" }}>
        <button onClick={()=>setMenuOpen(true)} className="hdr-btn" style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:10, padding:"8px 10px", cursor:"pointer", display:"flex", flexDirection:"column", gap:3, flexShrink:0 }}>
          <div style={{ width:18, height:2, background:t.text, borderRadius:1 }} />
          <div style={{ width:14, height:2, background:t.muted, borderRadius:1 }} />
          <div style={{ width:18, height:2, background:t.text, borderRadius:1 }} />
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:10, flex:1, minWidth:0 }}>
          <img src={LOGO_URL} alt="Digital Market" style={{ width:46, height:46, objectFit:"contain", borderRadius:10, flexShrink:0, filter:"drop-shadow(0 2px 8px rgba(168,85,247,0.4))" }} onError={e=>{ e.target.style.display="none"; }} />
          <div style={{ display:"flex", flexDirection:"column", minWidth:0 }}>
            <span style={{ fontWeight:900, fontSize:18, letterSpacing:0.3, lineHeight:1.15 }}>
              <span style={{ color:"#ff6b35" }}>Digital </span>
              <span style={{ color:"#a855f7" }}>Market</span>
            </span>
            <span style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", marginTop:4 }}><span style={{ color:"#3b82f6" }}>Streaming</span> <span style={{ color:"#ef4444" }}>Premium</span></span>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
          <button onClick={()=>setScreen("soporte")} className="hdr-btn report-btn" style={{ background:"linear-gradient(135deg,#ef4444,#dc2626)", border:"none", borderRadius:8, padding:"7px 11px", cursor:"pointer", fontSize:11, fontWeight:700, color:"#fff", fontFamily:"inherit", boxShadow:"0 2px 8px rgba(239,68,68,0.4)", whiteSpace:"nowrap" }}><span className="report-text">🚩 Reportar error</span><span className="report-icon-only">🚩</span></button>
          <button onClick={()=>setScreen("search")} className="hdr-btn" style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:8, padding:"7px 10px", cursor:"pointer", fontSize:14 }}>🔍</button>
          <button onClick={()=>setDark(d=>!d)} className="hdr-btn" style={{ background:t.card, border:`1px solid ${t.border}`, borderRadius:8, padding:"7px 10px", cursor:"pointer", fontSize:14 }}>{dark?"☀️":"🌙"}</button>
          <button onClick={()=>setScreen("cart")} className="hdr-btn" style={{ position:"relative", background:t.card, border:`1px solid ${t.border}`, borderRadius:10, padding:"8px 12px", cursor:"pointer", color:t.text, fontSize:18, animation:cartAnim?"cartBounce 0.4s ease":"none" }}>
            🛒{cart.length>0 && <div style={{ position:"absolute", top:-6, right:-6, background:"#E50914", color:"#fff", borderRadius:"50%", width:18, height:18, fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", animation:"fadeUp 0.3s ease" }}>{cart.length}</div>}
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:5, background:"#0d1f0d", border:"1px solid #1a3a1a", borderRadius:16, padding:"5px 10px" }}>
            <div style={{ width:6, height:6, background:"#25d366", borderRadius:"50%", animation:"blink 1.6s ease infinite" }} />
            <span style={{ color:"#25d366", fontSize:10, fontWeight:600 }}>En línea</span>
          </div>
        </div>
      </div>

      {/* ACCESOS RÁPIDOS */}
      <div style={{ padding:"12px 16px 0", display:"flex", gap:8 }}>
        <button onClick={()=>setScreen("validar")} className="quick-access glow-purple" style={{ flex:1, background:"linear-gradient(135deg,#2a1a4a,#1e1235)", border:"1px solid #7c3aed55", borderRadius:12, padding:12, cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontFamily:"inherit" }}>
          <span style={{ fontSize:18 }}>🔐</span>
          <div style={{ textAlign:"left" }}><div style={{ color:"#fff", fontWeight:700, fontSize:12 }}>Validar Código</div><div style={{ color:"#c4b5fd", fontSize:10 }}>Netflix & Disney+</div></div>
        </button>
        <button onClick={()=>window.open(`https://wa.me/${WA_NUMBER}`,"_blank")} className="quick-access glow-green" style={{ flex:1, background:"#0d1f0d", border:"1px solid #1a3a1a", borderRadius:12, padding:12, cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontFamily:"inherit" }}>
          <span style={{ fontSize:18 }}>💬</span>
          <div style={{ textAlign:"left" }}><div style={{ color:"#fff", fontWeight:700, fontSize:12 }}>WhatsApp</div><div style={{ color:"#25d366", fontSize:10 }}>Soporte directo</div></div>
        </button>
      </div>

      <div style={{ padding:"10px 16px 0", display:"flex", gap:8 }}>
        <button onClick={()=>setShowClub(true)} className="quick-access" style={{ flex:1, background:"linear-gradient(135deg,#1a1000,#2a1800)", border:"1px solid #3a2800", borderRadius:12, padding:12, cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontFamily:"inherit" }}>
          <span style={{ fontSize:20 }}>👑</span>
          <div style={{ textAlign:"left" }}><div style={{ color:"#FFD700", fontWeight:700, fontSize:12 }}>Club Digital Market</div><div style={{ color:"#c9a227", fontSize:10 }}>$10.000/mes · Beneficios exclusivos</div></div>
        </button>
        <button onClick={()=>setScreen("soporte")} className="quick-access glow-blue" style={{ flex:1, background:"linear-gradient(135deg,#0a1a2a,#0d2538)", border:"1px solid #3b82f655", borderRadius:12, padding:12, cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontFamily:"inherit" }}>
          <span style={{ fontSize:20 }}>🆘</span>
          <div style={{ textAlign:"left" }}><div style={{ color:"#60a5fa", fontWeight:700, fontSize:12 }}>Soporte</div><div style={{ color:"#93c5fd", fontSize:10 }}>Ayuda y errores comunes</div></div>
        </button>
      </div>

      {/* TABS */}
      <div className="tab-bar" style={{ display:"flex", padding:"14px 16px 10px", gap:8, overflowX:"auto", position:"sticky", top:0, zIndex:20, background:t.bg, backdropFilter:"blur(8px)", boxShadow:dark?"0 4px 12px rgba(0,0,0,0.25)":"0 4px 12px rgba(0,0,0,0.05)" }}>
        {[["favoritos","⭐","Favoritos"],["pantallas","📺","Pantallas"],["combos","🔥","Combos"],["meses","🗓️","Meses"],["seguidores","👥","Seguidores"]].map(([k,icon,label])=>(
          <button key={k} onClick={()=>{ setActiveTab(k); navigate(k); }} className={`tab-btn ${activeTab===k?"tab-active":""}`} style={{ flexShrink:0, padding:"9px 12px", background:t.card, border:`1px solid ${t.border}`, borderRadius:12, color:t.muted, fontWeight:600, cursor:"pointer", fontFamily:"inherit", display:"flex", flexDirection:"column", alignItems:"center", gap:3, minWidth:56 }}>
            <span className="tab-icon">{icon}</span>
            <span className="tab-label">{label}</span>
          </button>
        ))}
      </div>

      {/* CARRUSEL ESTRENOS */}
      <div style={{ marginTop:8 }}><Carrusel dark={dark} /></div>

      {/* CARRUSEL DE PROMOCIONES */}
      <div style={{ marginTop:12 }}><PromoCarrusel dark={dark} /></div>

      {/* PANTALLAS */}
      {activeTab==="pantallas" && (
        <div style={{ padding:"0 16px" }}>
          <div className="product-grid">
            {PANTALLAS.map((item,i)=>(
              <div key={item.id} className="card-hover" onClick={()=>{ setDetail(item); setScreen("detail"); }} style={{ background:t.card, border:`1px solid ${item.badge?item.color+"44":t.border}`, borderRadius:16, overflow:"hidden", cursor:"pointer", position:"relative", animationDelay:`${(i%10)*0.04}s` }}>
                {item.badge && <div style={{ position:"absolute", top:8, left:8, zIndex:1, background:item.color, borderRadius:6, padding:"2px 8px", fontSize:9, fontWeight:700, color:"#fff" }}>{item.badge}</div>}
                <div style={{ width:"100%", aspectRatio:"1/1", overflow:"hidden", background:"#1a2535" }}>
                  <img src={item.img} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} loading="lazy" onError={e=>e.target.style.display="none"} />
                </div>
                <div style={{ padding:"10px 12px" }}>
                  <div style={{ fontWeight:700, fontSize:13, marginBottom:3, color:t.text }}>{item.name}</div>
                  <div style={{ fontWeight:900, fontSize:18, color:item.color }}>{formatPrice(item.price)}</div>
                  <div style={{ color:t.muted, fontSize:11, marginTop:2 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MESES */}
      {activeTab==="meses" && (
        <div style={{ padding:"0 16px" }}>
          {["Netflix","Spotify","YouTube"].map(cat=>{
            const items = MESES.filter(m=>m.cat===cat);
            return (
              <div key={cat} style={{ marginBottom:24 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                  <Img src={items[0].img} alt={cat} size={28} style={{ borderRadius:7 }} />
                  <span style={{ fontWeight:700, fontSize:15, color:items[0].color }}>{cat}</span>
                </div>
                <div className="product-grid">
                  {items.map((item,i)=>(
                    <div key={item.id} className="card-hover" onClick={()=>{ setDetail(item); setScreen("detail"); }} style={{ background:t.card, border:`1px solid ${item.badge?item.color+"44":t.border}`, borderRadius:14, overflow:"hidden", cursor:"pointer", position:"relative", animationDelay:`${(i%10)*0.04}s` }}>
                      {item.badge && <div style={{ position:"absolute", top:8, right:8, zIndex:1, background:item.color, borderRadius:5, padding:"2px 6px", fontSize:8, fontWeight:700, color:"#fff" }}>{item.badge}</div>}
                      <div style={{ width:"100%", aspectRatio:"1/1", overflow:"hidden", background:"#1a2535" }}>
                        <img src={item.img} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} loading="lazy" onError={e=>e.target.style.display="none"} />
                      </div>
                      <div style={{ padding:"10px 12px" }}>
                        <div style={{ color:item.color, fontSize:10, fontWeight:600, marginBottom:3, textTransform:"uppercase" }}>{item.name.replace(item.cat+" ","")}</div>
                        <div style={{ fontWeight:900, fontSize:18, color:t.text }}>{formatPrice(item.price)}</div>
                        <div style={{ color:t.muted, fontSize:10, marginTop:2 }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* COMBOS */}
      {activeTab==="combos" && (
        <div style={{ padding:"0 16px" }}>
          <div style={{ background:"linear-gradient(135deg,#0d0d00,#141400)", border:"1px solid #2a2a00", borderRadius:14, padding:"12px 14px", marginBottom:16 }}>
            <p style={{ color:"#cccc00", fontSize:12, lineHeight:1.6 }}>💡 <strong style={{ color:"#ffff88" }}>Combos = más plataformas por menos.</strong> Las activamos en minutos.</p>
          </div>
          <div className="product-grid">
            {COMBOS.map((c,i)=>(
              <div key={c.id} className="card-hover" onClick={()=>{ setDetail({...c,features:[c.desc,"Activación en minutos","Soporte incluido"]}); setScreen("detail"); }} style={{ background:t.card, border:`1px solid ${c.badge?c.color+"44":t.border}`, borderRadius:16, overflow:"hidden", cursor:"pointer", position:"relative", animationDelay:`${(i%10)*0.04}s` }}>
                {c.badge && <div style={{ position:"absolute", top:8, left:8, zIndex:1, background:c.color, borderRadius:6, padding:"2px 8px", fontSize:9, fontWeight:700, color:"#fff" }}>{c.badge}</div>}
                <div style={{ width:"100%", aspectRatio:"1/1", overflow:"hidden", background:"#1a2535" }}>
                  <img src={c.img} alt={c.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} loading="lazy" onError={e=>e.target.style.display="none"} />
                </div>
                <div style={{ padding:"10px 12px" }}>
                  <div style={{ fontWeight:700, fontSize:13, marginBottom:3, color:t.text }}>{c.name}</div>
                  <div style={{ fontWeight:900, fontSize:18, color:c.color }}>{formatPrice(c.price)}</div>
                  <div style={{ color:t.muted, fontSize:11, marginTop:2 }}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAVORITOS */}
      {activeTab==="favoritos" && (
        <div style={{ padding:"0 16px" }}>
          <div style={{ background:"linear-gradient(135deg,#1a1000,#201500)", border:"1px solid #3a2800", borderRadius:14, padding:"12px 14px", marginBottom:16 }}>
            <p style={{ color:"#FFD700", fontSize:12, lineHeight:1.6, fontWeight:600 }}>⭐ Los combos más vendidos — favoritos de nuestros clientes</p>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {FAV_COMBOS.map(c=>(
              <div key={c.id} className="card-hover" onClick={()=>{ setDetail({...c,features:[c.desc,"Activación en minutos","Soporte incluido"]}); setScreen("detail"); }} style={{ background:t.card, border:`1px solid ${c.color}33`, borderRadius:16, overflow:"hidden", display:"flex", position:"relative" }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${c.color}88,transparent)` }} />
                <div style={{ width:130, height:130, overflow:"hidden", flexShrink:0, background:"#1a2535" }}>
                  <img src={c.img} alt={c.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} loading="lazy" onError={e=>e.target.style.display="none"} />
                </div>
                <div style={{ flex:1, padding:"14px 16px", display:"flex", flexDirection:"column", justifyContent:"center" }}>
                  <div style={{ display:"flex", gap:2, marginBottom:6 }}>{Array.from({length:c.stars}).map((_,i)=><span key={i} style={{ fontSize:12 }}>⭐</span>)}</div>
                  <div style={{ fontWeight:700, fontSize:15, marginBottom:3, color:t.text }}>{c.name}</div>
                  <div style={{ color:t.muted, fontSize:12, marginBottom:6 }}>{c.desc}</div>
                  <div style={{ color:c.color, fontWeight:900, fontSize:20 }}>{formatPrice(c.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab==="seguidores" && (
        <div style={{ padding:"0 16px" }}>
          <Seguidores onBack={()=>setActiveTab("favoritos")} onAddCart={addCart} dark={dark} inline={true} />
        </div>
      )}

      {/* FAB CHAT */}
      <button onClick={()=>setScreen("chat")} className="fab-pulse" style={{ position:"fixed", bottom:24, right:20, width:58, height:58, background:"linear-gradient(135deg,#7c3aed,#6d28d9)", border:"none", borderRadius:"50%", fontSize:26, cursor:"pointer", boxShadow:"0 6px 24px rgba(124,58,237,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:99 }}>🤖</button>

      {/* FAB RULETA */}
      <button onClick={()=>setShowRuleta(true)} style={{ position:"fixed", bottom:24, left:20, width:58, height:58, background:"linear-gradient(135deg,#F59E0B,#D97706)", border:"none", borderRadius:"50%", fontSize:26, cursor:"pointer", boxShadow:"0 6px 24px rgba(245,158,11,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:99, animation:"goldGlow 2s ease infinite" }}>🎰</button>
    </div>
  );
}
