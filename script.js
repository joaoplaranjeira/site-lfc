// Session status updater
(function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Session dates
  const sessions = [
    { id: 'session1-badge', date: new Date('2025-11-12') },
    { id: 'session2-badge', date: new Date('2026-02-01') }, // Placeholder for February
    { id: 'session3-badge', date: new Date('2026-04-01') }, // Placeholder for April
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

// Popup disabled
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
