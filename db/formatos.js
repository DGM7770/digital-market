// ════════════════════════════════════════════════════════════════════════════
// FORMATOS DE MENSAJE PREDEFINIDOS POR PRODUCTO
// Se usan al mostrar la compra al cliente
// ════════════════════════════════════════════════════════════════════════════

function getFechaCol() {
  return new Date().toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
}

// Perfiles disponibles por plataforma
const PERFILES_POR_PLATAFORMA = {
  'net1': 5, 'net1-p': 5, 'net2p': 5, 'net2m': 5, 'net3m': 5,
  'apple': 6,
  'directv': 4,
  'vix': 5,
  'prime': 6,
  'dis1': 7, 'dis2': 7,
  'hbo': 5,
  'paramount': 6,
  'crunchy': 5,
  'win': 5,
  'dis1': 7, 'dis2': 7,
};

// Plataformas que NO usan perfil
const SIN_PERFIL = ['sp1','sp1-p','sp2','sp3','sp4','sp6','yt1','yt1-p','yt2','yt3','ps','office','plex','jelly','iptv','iptvfull','canva'];

function generarMensaje(productoId, cuenta) {
  const fecha = getFechaCol();
  const u = cuenta.cuenta_usuario || '';
  const p = cuenta.cuenta_password || '';
  const perfil = cuenta.perfil || '';
  const pin = cuenta.pin || '';
  const notas = cuenta.notas || '';
  const servidor = cuenta.servidor || '';
  const pinStr = pin ? `🔒Pin: ${pin}` : '';
  const perfilStr = perfil ? `👤 Perfil: ${perfil}${pin ? ' ' + pinStr : ''}` : '';

  const mensajes = {
    'net1': `🍿NETFLIX 1 MES🍿\n\n📅${fecha}⚠️\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}\n\n${perfilStr}\n\n1 Dispositivo\n\nHas adquirido 1 Pantalla N3tflix en el Plan Premium ULTRA HD por 30 días\n\nActivar SmartTV con Código:\nhttps://www.netflix.com/tv2`,
    'net2p': `🍿NETFLIX 2 PANTALLAS🍿\n\n📅${fecha}⚠️\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}\n\n${perfilStr}\n\n2 Dispositivos\n\nHas adquirido 2 Pantallas N3tflix en el Plan Premium ULTRA HD\n\nActivar SmartTV con Código:\nhttps://www.netflix.com/tv2`,
    'net2m': `🍿NETFLIX 2 MESES🍿\n\n📅${fecha}⚠️\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}\n\n${perfilStr}\n\n1 Dispositivo\n\nHas adquirido 1 Pantalla N3tflix en el Plan Premium ULTRA HD por 60 días\n\nActivar SmartTV con Código:\nhttps://www.netflix.com/tv2`,
    'net3m': `🍿NETFLIX 3 MESES🍿\n\n📅${fecha}⚠️\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}\n\n${perfilStr}\n\n1 Dispositivo\n\nHas adquirido 1 Pantalla N3tflix en el Plan Premium ULTRA HD por 90 días\n\nActivar SmartTV con Código:\nhttps://www.netflix.com/tv2`,
    'dis1': `🎡💫DISNEY ESTÁNDAR🎡💫\n\n📅${fecha}⚠️\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}\n\n${perfilStr}\n\n1 Dispositivo\n\nActivar SmartTV con código:\nhttps://www.disneyplus.com/begin`,
    'dis2': `🔵🟡DISNEY PREMIUM 1 MES🔵🟡\n\n📅${fecha}⚠️\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}\n\n${perfilStr}\n\nHas adquirido 1 Pantalla Disn3y en el Plan Premium.\n\n1 Dispositivo\n\nActivar SmartTV con código:\nhttps://www.disneyplus.com/begin\n\nRecomendaciones:\n1. No cambiar contraseña, ni correo, ni nombre de usuario 🚫\n2. No usar otras pantallas ni crear nuevas ⚠️`,
    'vix': `🟠VIX+ PREMIUM🟠\n\n📅${fecha}⚠️\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}\n\n${perfilStr}\n\n1 Dispositivo\n\nHas adquirido 1 Cuenta Vix en el plan Premium\n\nPara activar su dispositivo SmartTV utilice el siguiente link:\nvix.com/activar e ingrese el código que aparece en su dispositivo.`,
    'plex': `🎫PLEX PREMIUM PLUS🎫\n\n📅${fecha}⚠️\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}\n\nPlan: 1 dispositivo (30 días)\n\nActivar SmartTV con código:\nhttps://www.plex.tv/link/`,
    'directv': `⚽📡DGO+ PLAN ORO🥅🥇🏆\n\n📅${fecha}⚠️\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}\n\n${perfilStr}\n\n1 Dispositivo ⚠️\n\nActivar SmartTV con Código:\nwww.directvgo.com/activar`,
    'jelly': `🟣⚫️🎁JELLYFIN🥅🎁⚽️🍿⚫️🟣\n\n📅${fecha}⚠️\n\n🖥️ Servidor: ${servidor || 'https://cv.mcjelly.com/'}\n👤 Usuario: ${u}\n🔑 Contraseña: ${p}\n📦 Plan: Jellyfin 1 Pantalla * 1 Mes`,
    'crunchy': `🍥CRUNCHYROLL 1 MES🍥\n\n📅${fecha}⚠️\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}\n\n${perfilStr}\n\nInstrucciones: Plan Mega Fan 1 conexión, no hacer modificaciones\n\nwww.crunchyroll.com/activate\n\nRecomendaciones: Solo usar el servicio en 1 dispositivo a la vez, no compartir la cuenta con otras personas, cualquier incumplimiento se procede a activar los dispositivos con código 🔢 (sin contraseña) o se procede a expulsión sin derecho a reposición o garantía.\n\nInmediatamente se entrega la cuenta favor registrar su dispositivo 😁✌`,
    'paramount': `🏔️PARAMOUNT+ 1 MES🏔️\n\n📅${fecha}⚠️\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}\n\n${perfilStr}\n\nHas adquirido 1 Pantalla Param0unt en el Plan Premium * 30 días.\n\nActivar SmartTV con código:\nparamountplus.com/tv\n\n1 Dispositivo ⚠️\n\nRecomendaciones: Solo usar el servicio en 1 dispositivo a la vez, no compartir la cuenta con otras personas 😁✌️`,
    'canva': `🎨CANVA PRO 1 MES🎨\n\n📅${fecha}⚠️\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}`,
    'apple': `⚪APPLE TV+ 1 MES⚪\n\n📅${fecha}⚠️\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}\n\n${perfilStr}\n\nPara activar su SmartTV utilice el siguiente enlace:\nhttps://link.apple.com/`,
    'hbo': `🧙‍♂️HBO MAX🧙‍♂️\n\n📅${fecha}⚠️\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}\n\n${perfilStr}\n\n1 Dispositivo\n\nHas adquirido 1 Pantalla M4X en el Plan Premium.\n\nActivar SmartTV con código:\nhttps://auth.max.com/link`,
    'iptv': `🌐IPTV PREMIUM PLUS🌐\n\n👤Nombre: A1\n📧 Usuario: ${u}\n🔑 Contraseña: ${p}\nhttps://tupdvr24.com/\n🌐IPTV PREMIUM PLUS🌐\n1 Conexión\n📅${fecha}⚠️`,
    'iptvfull': `🌐IPTV PREMIUM PLUS 3 PANTALLAS🌐\n\n👤Nombre: A1\n📧 Usuario: ${u}\n🔑 Contraseña: ${p}\nhttps://tupdvr24.com/\n3 Conexiones\n📅${fecha}⚠️`,
    'sp1': `🎙️SPOTIFY PREMIUM 1 MES🎙️\n\n📅${fecha}⚠️\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}\n\nHas adquirido 1 Cuenta Spotify en el *Plan Premium por 1 Mes*`,
    'sp2': `🎙️SPOTIFY PREMIUM 2 MESES🎙️\n\n📅${fecha}⚠️\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}\n\nHas adquirido 1 Cuenta Spotify en el *Plan Premium por 2 Meses*`,
    'sp3': `🎙️SPOTIFY PREMIUM 3 MESES🎙️\n\n📅${fecha}⚠️\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}\n\nHas adquirido 1 Cuenta Spotify en el *Plan Premium por 3 Meses*`,
    'sp4': `🎙️SPOTIFY PREMIUM 4 MESES🎙️\n\n📅${fecha}⚠️\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}\n\nHas adquirido 1 Cuenta Spotify en el *Plan Premium por 4 Meses*`,
    'sp6': `🎙️SPOTIFY PREMIUM 6 MESES🎙️\n\n📅${fecha}⚠️\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}\n\nHas adquirido 1 Cuenta Spotify en el *Plan Premium por 6 Meses*`,
    'win': `🥅WINN PLAYY🥅⚽\n\n📅${fecha}⚠️\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}\n\n${perfilStr}\n\nWiinn+ 1 Dispositivo\nhttps://winplay.co/activar`,
    'office': `📄OFFICE MICROSOFT 365 1 MES📄\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}\n\nhttps://www.office.com/\n\nPOR CAMBIO DE CLAVE O EMAIL NO HAY SOPORTE\nLA CUENTA ES PERSONAL NO HACER MODIFICACIONES`,
    'yt1': `📽️YOUTUBE PREMIUM 1 MES🎧\n\n📅${fecha}⚠️\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}\n\nInstrucciones: No agregar números telefónicos, si la aplicación los pide busca siempre la opción omitir o cancelar. No hacer modificaciones a la cuenta.\n\nPara activar su SmartTV:\nyt.be/activate e ingrese el código que aparece en su dispositivo.`,
    'yt2': `📽️YOUTUBE PREMIUM 2 MESES🎧\n\n📅${fecha}⚠️\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}\n\nInstrucciones: No agregar números telefónicos. No hacer modificaciones a la cuenta.\n\nPara activar su SmartTV:\nyt.be/activate`,
    'yt3': `📽️YOUTUBE PREMIUM 3 MESES🎧\n\n📅${fecha}⚠️\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}\n\nInstrucciones: No agregar números telefónicos. No hacer modificaciones a la cuenta.\n\nPara activar su SmartTV:\nyt.be/activate`,
    'prime': `🗽PRIME VIDEO 1 MES🗽\n\n📅${fecha}⚠️\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}\n\n${perfilStr}\n\n1 Dispositivo\n\nActivar SmartTV con código:\nhttps://www.primevideo.com/mytv`,
    'ps': `🎮🕹️GAME PASS ULTIMATE 1 MES🎮🕹️\n\n📅${fecha}⚠️\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}`,
  };

  // net1-p y net1-p comparten el mismo formato que net1
  if (!mensajes[productoId]) {
    const base = productoId.replace('-p','').replace('-m','');
    return mensajes[base] || `📦 ${cuenta.producto_nombre}\n\n📅${fecha}⚠️\n\n*USUARIO & CONTRASEÑA:*\n${u}\n${p}${perfil?'\n\n'+perfilStr:''}${notas?'\n\n📝 '+notas:''}`;
  }

  return mensajes[productoId];
}

module.exports = { generarMensaje, PERFILES_POR_PLATAFORMA, SIN_PERFIL };
