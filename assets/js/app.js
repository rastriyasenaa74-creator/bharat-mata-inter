const $ = (s, root=document) => root.querySelector(s);
const configured = () => window.SCHOOL_CONFIG && window.SCHOOL_CONFIG.apiUrl && window.SCHOOL_CONFIG.apiUrl.startsWith("https://script.google.com/macros/s/");
const api = async (action, payload={}) => {
  if (!configured()) throw new Error("Backend URL configured nahi hai. assets/js/config.js mein Apps Script Web App URL add karein.");
  const response = await fetch(window.SCHOOL_CONFIG.apiUrl, {
    method: "POST",
    headers: {"Content-Type":"text/plain;charset=utf-8"},
    body: JSON.stringify({action, ...payload})
  });
  if (!response.ok) throw new Error("Backend request failed.");
  const data = await response.json();
  if (!data || data.ok !== true) throw new Error(data && data.error ? data.error : "Request complete nahi ho saki.");
  return data;
};
const header = `<header class="site-header"><a class="brand" href="index.html"><span class="brand-mark">BM</span><span><b>Bharat Mata Inter College</b><small>Education • Discipline • Excellence</small></span></a><button class="menu-toggle" aria-label="Open menu" onclick="document.querySelector('.nav').classList.toggle('open')">☰</button><nav class="nav"><a href="index.html">Home</a><a href="about.html">About</a><a href="academics.html">Academics</a><a href="admission.html">Admissions</a><a href="results.html">Results</a><a href="notices.html">Notices</a><a href="gallery.html">Gallery</a><a href="contact.html">Contact</a><a class="nav-login" href="login.html">Portal Login ↗</a></nav></header>`;
const footer = `<footer class="footer"><div><a class="brand footer-brand" href="index.html"><span class="brand-mark">BM</span><span><b>Bharat Mata Inter College</b><small>Education • Discipline • Excellence</small></span></a><p>Building knowledge, confidence and character.</p></div><div><b>Explore</b><a href="about.html">About us</a><a href="academics.html">Academics</a><a href="admission.html">Admissions</a></div><div><b>Quick links</b><a href="notices.html">Notices</a><a href="results.html">Results</a><a href="login.html">Portal login</a></div><div><b>Contact</b><p>Official contact details to be confirmed.</p></div><div class="copyright">© ${new Date().getFullYear()} Bharat Mata Inter College. All rights reserved.</div></footer>`;
if ($("#siteHeader")) $("#siteHeader").outerHTML = header;
if ($("#siteFooter")) $("#siteFooter").outerHTML = footer;
if ($("#year")) $("#year").textContent = new Date().getFullYear();
const message = (el, text, error=false) => { if(el){el.textContent=text;el.style.color=error?"#b34242":"#26785a";} };

const admissionForm = $("#admissionForm");
if (admissionForm) admissionForm.addEventListener("submit", async e => {
  e.preventDefault(); const out=$("#admissionMessage"); const btn=admissionForm.querySelector("button[type=submit]"); btn.disabled=true; btn.textContent="Submitting…";
  try {
    const form=Object.fromEntries(new FormData(admissionForm).entries());
    const result=await api("submitAdmission",{form});
    message(out, `Enquiry submitted. Application number: ${result.applicationNumber || "received"}. Keep this number for reference.`);
    admissionForm.reset();
  } catch(err) { message(out, err.message, true); }
  finally {btn.disabled=false;btn.textContent="Submit enquiry";}
});

const loginForm=$("#loginForm");
if(loginForm) loginForm.addEventListener("submit",async e=>{
  e.preventDefault(); const out=$("#loginMessage"); const btn=loginForm.querySelector("button"); btn.disabled=true;btn.textContent="Signing in…";
  try{
    const data=Object.fromEntries(new FormData(loginForm).entries());
    const result=await api("login",data);
    if(!result.token || !["admin","teacher","student"].includes(result.role)) throw new Error("Backend ne valid session return nahi kiya.");
    sessionStorage.setItem("schoolSession",JSON.stringify({token:result.token,role:result.role,displayName:result.displayName||""}));
    location.href=result.role==="admin"?"admin.html":result.role==="teacher"?"teacher.html":"student.html";
  }catch(err){message(out,err.message,true);}
  finally{btn.disabled=false;btn.textContent="Sign in securely";}
});

const resultForm=$("#resultForm");
if(resultForm) resultForm.addEventListener("submit",async e=>{e.preventDefault();message($("#resultMessage"),"Result lookup ko backend mein configure karna abhi zaroori hai.",true);});

const portalHeader=$("#portalHeader");
if(portalHeader){
 const sess=(()=>{try{return JSON.parse(sessionStorage.getItem("schoolSession")||"null")}catch(e){return null}})();
 const expected=location.pathname.endsWith("admin.html")?"admin":location.pathname.endsWith("teacher.html")?"teacher":"student";
 if(!sess || sess.role!==expected){location.replace("login.html");}
 else portalHeader.innerHTML=`<header class="portal-top"><a class="brand" href="index.html"><span class="brand-mark">BM</span><span><b>Bharat Mata Inter College</b><small>School Management Portal</small></span></a><div class="portal-right">Signed in as <b>${String(sess.displayName||sess.role).replace(/[<>&"]/g,"")}</b> · <a href="index.html">Public website ↗</a></div></header>`;
}
const logout=$("#logoutButton");
if(logout) logout.addEventListener("click",async()=>{
 const sess=(()=>{try{return JSON.parse(sessionStorage.getItem("schoolSession")||"null")}catch(e){return null}})();
 try{if(sess&&sess.token&&configured()) await api("logout",{token:sess.token});}catch(e){}
 sessionStorage.removeItem("schoolSession");location.href="login.html";
});
const refresh=$("#refreshAdmin");
if(refresh) refresh.addEventListener("click",async()=>{
 const box=$("#adminDataMessage"); message(box,"Loading dashboard…");
 try{
  const sess=JSON.parse(sessionStorage.getItem("schoolSession")||"null");
  const data=await api("adminSummary",{token:sess.token});
  $("#studentCount").textContent=data.summary.students;
  $("#teacherCount").textContent=data.summary.teachers;
  $("#admissionCount").textContent=data.summary.admissions;
  $("#noticeCount").textContent=data.summary.notices;
  const tbody=$("#admissionRows");tbody.replaceChildren();
  (data.recentAdmissions||[]).forEach(row=>{const tr=document.createElement("tr");[row.applicationNumber,row.studentName,row.applyingClass,row.status].forEach(v=>{const td=document.createElement("td");td.textContent=v||"—";tr.appendChild(td)});tbody.appendChild(tr)});
  message(box,"Dashboard data loaded from Google Sheets.");
 }catch(err){message(box,err.message,true);}
});
