module.exports = (request, response) => {
  response.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end('window.MAP_CONFIG = ' + JSON.stringify({kakaoJavaScriptKey:process.env.KAKAO_MAPS_JAVASCRIPT_KEY || ''}) + ';');
};
