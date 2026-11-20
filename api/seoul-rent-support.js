// Server-only Seoul Open Data Plaza proxy. No fabricated policy matches.
module.exports = async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET') return res.status(405).json({error:'GET 요청만 지원합니다.'});
  const key=process.env.SEOUL_API_KEY;
  const service=process.env.SEOUL_RENT_SERVICE_NAME;
  if(!key || !service) return res.status(503).json({error:'서울시 데이터 서비스 설정이 필요합니다.',setup:true});
  if(!/^[A-Za-z][A-Za-z0-9_]{1,100}$/.test(service))return res.status(500).json({error:'서비스명 설정이 올바르지 않습니다.'});
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),10000);
  try {
    const url=`http://openapi.seoul.go.kr:8088/${encodeURIComponent(key)}/json/${service}/1/100`;
    const response=await fetch(url,{signal:controller.signal});
    if(!response.ok)throw Error(`서울시 API HTTP ${response.status}`);
    const data=await response.json();
    const payload=data[service]||Object.values(data).find(v=>v&&typeof v==='object'&&Array.isArray(v.row));
    if(!payload || !Array.isArray(payload.row))return res.status(502).json({error:'API 응답에 목록 데이터가 없습니다. 서비스명과 응답 구조를 확인하세요.'});
    const rows=payload.row;
    const clean=rows.map(row=>{
      const fields=Object.entries(row).filter(([k,v])=>typeof v==='string'||typeof v==='number');
      const text=fields.map(([,v])=>String(v)).join(' ');
      if(!/(월세|월세지원|임차료|주거급여)/.test(text))return null;
      const pick=(regex)=>fields.find(([k])=>regex.test(k))?.[1];
      const name=pick(/(사업명|정책명|서비스명|제목|TITLE|NAME|SJ)/i);
      const url=fields.find(([k,v])=>/(URL|LINK|HMPG|홈페이지|링크)/i.test(k)&&/^https:\/\//.test(String(v)))?.[1];
      return {name:String(name||'월세 관련 데이터 항목'),summary:text.slice(0,450),url:url||null};
    }).filter(Boolean);
    return res.status(200).json({source:'서울 열린데이터광장',service,checkedAt:new Date().toISOString(),count:rows.length,items:clean,notice:'키워드로 선별한 관련 데이터이며 신청 가능 여부를 판정하지 않습니다. 공식 공고를 확인하세요.'});
  }catch(e){return res.status(502).json({error:e.name==='AbortError'?'서울시 API 응답 시간이 초과되었습니다.':'서울시 API 조회 실패: '+e.message});}
  finally{clearTimeout(timeout)}
};
