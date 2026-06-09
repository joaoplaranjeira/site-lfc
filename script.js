// Session status updater
(function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Session dates
  const sessions = [
    { id: 'session1-badge', date: new Date('2025-11-12') },
    { id: 'session2-badge', date: new Date('2026-02-11') },
    { id: 'session3-badge', date: new Date('2026-05-14') }, // Formação Futebol
    { id: 'session4-badge', date: new Date('2026-06-01') }  // Placeholder for June
  ];
  
  sessions.forEach(session => {
    const badge = document.getElementById(session.id);
    if (badge) {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      
      if (today.getTime() === sessionDate.getTime()) {
        // Today
        badge.className = 'inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold mb-3';
        badge.textContent = 'HOJE';
      } else if (today > sessionDate) {
        // Past
        badge.className = 'inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold mb-3';
        badge.textContent = 'REALIZADA';
      } else {
        // Future
        badge.className = 'inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold mb-3';
        badge.textContent = 'EM BREVE';
      }
    }
  });
})();

// Popup Final Jamor – Final no Jamor (10 Jun 2026)
(function () {
  // Mostrar apenas nos dias 9 e 10 de junho de 2026
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var showFrom  = new Date('2026-06-09'); showFrom.setHours(0, 0, 0, 0);
  var showUntil = new Date('2026-06-11'); showUntil.setHours(0, 0, 0, 0);

  var popup    = document.getElementById('jamor-popup');
  if (!popup) return;

  if (today < showFrom || today >= showUntil) {
    popup.classList.add('hidden');
    return;
  }

  var closeBtn = document.getElementById('jamor-close');
  var ctaBtn   = document.getElementById('jamor-cta');
  var countEl  = document.getElementById('jamor-countdown');
  var progEl   = document.getElementById('jamor-progress');

  var DURATION   = 5;
  var remaining  = DURATION;
  var timer      = null;

  function closePopup() {
    clearInterval(timer);
    popup.classList.add('hidden');
  }

  function tick() {
    remaining--;
    if (remaining <= 0) {
      countEl.textContent = '0';
      progEl.style.width  = '0%';
      closePopup();
      return;
    }
    countEl.textContent = remaining;
    progEl.style.width  = (remaining / DURATION * 100) + '%';
  }

  timer = setInterval(tick, 1000);

  closeBtn.addEventListener('click', closePopup);

  ctaBtn.addEventListener('click', function () {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'jamor_popup_cta_click', {
        event_category: 'engagement',
        event_label: 'Tornar-me Sócio – Final Jamor'
      });
    }
    closePopup();
  });
})();

// Old popup disabled
/*
(function(){
  const e="https://lecafc.pt",t=10;
  let n,o=null,c=!1;
  const d=document.getElementById("countdown"),
        l=document.getElementById("progress"),
        r=document.getElementById("popup"),
        s=document.getElementById("stayBtn"),
        i=document.getElementById("goBtn");
  
  function u(){
    c||(n-=1,n<0&&(n=0),d.textContent=n,l.style.width=n/t*100+"%",0===n&&(a(),window.location.href=e))
  }
  
  function f(){
    c=!1,n=t,d.textContent=n,l.style.width="100%",r.classList.remove("hidden"),o&&clearInterval(o),o=setInterval(u,1e3)
  }
  
  function a(){
    o&&(clearInterval(o),o=null)
  }
  
  s.addEventListener("click",(()=>{c=!0,a(),r.classList.add("hidden")})),
  i.addEventListener("click",(()=>{window.location.href=e})),
  f(),
  window.addEventListener("pageshow",(t=>{
    const n=performance.getEntriesByType&&performance.getEntriesByType("navigation"),
          o=t.persisted||n&&n[0]&&"back_forward"===n[0].type;
    o&&f()
  })),
  window.addEventListener("pagehide",a)
})();
*/
