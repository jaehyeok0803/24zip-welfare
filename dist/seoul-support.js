(function(){
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function mount(){
   const app=document.getElementById('app');if(!app||document.body.dataset.page!=='results'||document.getElementById('seoul-rent-support'))return;
   const card=document.createElement('section');card.id='seoul-rent-support';card.className='seoul-support-card';
   const h=typeof state!=='undefined'?state.housing:{};
   card.innerHTML=`<h2>나에게 맞는 월세지원 찾기</h2><p>입력한 예산을 참고하고 서울시 열린데이터광장의 월세 관련 데이터를 조회합니다. 자격 판정은 공식 공고 확인이 필요해요.</p><div class="seoul-support-summary">최대 보증금 <b>${esc(h.deposit||'미입력')}만원</b> · 최대 월세 <b>${esc(h.monthly||'미입력')}만원</b></div><div class="seoul-support-fields"><label>만 나이 <input id="ss-age" type="number" min="0" max="120" placeholder="예: 24"></label><label>연 소득 (만원) <input id="ss-income" type="number" min="0" placeholder="예: 2400"></label><label>무주택 여부 <select id="ss-homeless"><option value="unknown">확인 필요</option><option value="yes">무주택</option><option value="no">주택 소유</option></select></label></div><button type="button" class="ss-search">서울시 월세지원 데이터 조회</button><div class="ss-output" aria-live="polite">서울시 API 서비스명 설정 후 조회할 수 있습니다.</div><p class="ss-disclaimer">서울시 API가 제공하지 않는 공고나 세부 자격 조건은 자동 판정할 수 없습니다. 입력한 개인정보는 이 기능에서 서버로 전송하지 않습니다.</p>`;
   app.appendChild(card);
   card.querySelector('.ss-search').addEventListener('click',async()=>{
     const out=card.querySelector('.ss-output');out.textContent='서울시 데이터를 조회하고 있습니다…';
     try{
       const res=await fetch('/api/seoul-rent-support');const data=await res.json();
       if(!res.ok)throw Error(data.error||'조회에 실패했습니다.');
       const age=card.querySelector('#ss-age').value,income=card.querySelector('#ss-income').value,homeless=card.querySelector('#ss-homeless').value;
       const checks=[age?`만 ${esc(age)}세`:'나이 미입력',income?`연 소득 ${esc(income)}만원`:'소득 미입력',homeless==='yes'?'무주택 입력':homeless==='no'?'주택 소유 입력':'무주택 여부 미확인'];
       out.innerHTML=`<p>조회: ${esc(data.checkedAt)} · 검색된 관련 항목 ${data.items.length}건 (조회 범위 ${data.count}건)</p><p>입력 조건: ${checks.join(' · ')} — 실제 신청 조건과 비교하려면 공식 공고의 자격 기준이 필요합니다.</p>`+(data.items.length?data.items.map(item=>`<article class="ss-item"><h3>${esc(item.name)}</h3><p>${esc(item.summary)}</p><strong>추가 확인 필요</strong>${item.url?` <a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">공식 정보 열기</a>`:''}</article>`).join(''):'<p>해당 데이터 응답에서 월세 관련 항목을 찾지 못했습니다. 다른 데이터셋 연동이 필요할 수 있습니다.</p>');
     }catch(e){out.textContent=e.message;}
   });
 }
 new MutationObserver(mount).observe(document.getElementById('app'),{childList:true});mount();
})();
