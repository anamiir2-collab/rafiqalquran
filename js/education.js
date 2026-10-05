/* رفيق القرآن للأطفال — قسم التعليم الديني */
window.App = window.App || {};
  App.Education = {
    topics: [
      {id:"prayer",title:"تعلم الصلاة",sub:"خطوات الصلاة",icon:"prayer",items:["الوضوء","النية والتكبير","القيام والقراءة","الركوع","السجود","التشهد","السلام"]},
      {id:"islam",title:"أركان الإسلام",sub:"خمسة أركان",icon:"pillars",items:["الشهادتان","الصلاة","الزكاة","الصوم","الحج"]},
      {id:"iman",title:"أركان الإيمان",sub:"ستة أركان",icon:"heart",items:["الإيمان بالله","الملائكة","الكتب","الرسل","اليوم الآخر","القدر"]},
      {id:"wudu",title:"الوضوء",sub:"نتعلم الطهارة",icon:"water",items:["النية","الكفان","المضمضة والاستنشاق","الوجه","اليدان إلى المرفقين","مسح الرأس","الرجلان"]},
      {id:"manners",title:"آداب المسلم",sub:"أخلاق جميلة",icon:"smile",items:["بر الوالدين","الصدق","الأمانة","الرحمة","النظافة","الاستئذان","الشكر"]},
      {id:"adhkar",title:"أذكار يومية",sub:"أذكار قصيرة",icon:"sparkle",items:["بسم الله","الحمد لله","سبحان الله","الله أكبر","أستغفر الله","السلام عليكم"]}
    ],
    art(){
      return '<svg class="edu-cartoon" viewBox="0 0 180 130" aria-label="رسم كرتوني تعليمي"><rect x="8" y="8" width="164" height="114" rx="28" fill="#DFF2E8"/><circle cx="90" cy="58" r="27" fill="#FFF4DE"/><path d="M66 53q24-31 48 0v-8q-24-22-48 0z" fill="#355E50"/><circle cx="80" cy="61" r="3"/><circle cx="100" cy="61" r="3"/><path d="M83 72q7 6 14 0" fill="none" stroke="#253B35" stroke-width="3" stroke-linecap="round"/><path d="M58 108q32-25 64 0" fill="#6A9E7C"/></svg>';
    },
    pageHub(){
      const e=this;
      return {nav:"more",html:'<header class="screen-head"><button class="icon-btn btn-back" data-href="#/more"><span class="ico" data-ico="chevronRight"></span></button><div class="sh-title"><h1>تعلم ديني</h1><p>معلومات مبسطة للطفل</p></div></header><div class="edu-hero">'+e.art()+'<div><h2>نتعلم ونطبق</h2><p>الصلاة والوضوء وأركان الإسلام والإيمان والآداب والأذكار.</p></div></div><div class="edu-grid">'+this.topics.map(t=>'<button class="edu-card" data-href="#/education/'+t.id+'"><span class="edu-art">'+e.art()+'</span><span class="edu-card-body"><strong>'+t.title+'</strong><small>'+t.sub+'</small><span class="edu-open">تعلم الآن</span></span></button>').join("")+'</div>',mount(){}};
    },
    pageTopic(p){
      const t=this.topics.find(x=>x.id===p.id); if(!t)return {nav:"more",html:App.emptyHtml("الدرس غير موجود")};
      return {nav:"more",html:'<header class="screen-head"><button class="icon-btn btn-back" data-href="#/education"><span class="ico" data-ico="chevronRight"></span></button><div class="sh-title"><h1>'+t.title+'</h1><p>'+t.sub+'</p></div></header><div class="edu-topic-hero">'+this.art()+'<h2>'+t.title+'</h2></div><div class="edu-lessons">'+t.items.map((x,i)=>'<article class="edu-lesson"><div class="edu-number">'+App.arDigits(i+1)+'</div><div class="edu-lesson-art">'+this.art()+'</div><div class="edu-lesson-text"><h3>'+x+'</h3><p>تعلم هذا الدرس وتدرب عليه مع والديك.</p></div></article>').join("")+'</div>',mount(){}};
    }
  };
  const es=document.createElement("style");es.textContent=".edu-hero,.edu-topic-hero{display:flex;align-items:center;gap:12px;padding:16px;border-radius:24px;background:#F7FBF8;border:1px solid #DCEBE3;margin-bottom:16px}.edu-cartoon{width:118px;height:90px}.edu-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.edu-card{background:var(--c-white);border:1px solid #E6E2D7;border-radius:20px;overflow:hidden;text-align:right}.edu-art{height:100px}.edu-card-body{display:block;padding:10px}.edu-card-body strong{display:block;color:var(--c-primary-deep)}.edu-card-body small{display:block;color:var(--c-text-soft);font-size:.7rem;margin-top:3px}.edu-open{display:block;color:var(--c-primary);font-size:.7rem;font-weight:800;margin-top:8px}.edu-topic-hero{display:block;text-align:center}.edu-topic-hero .edu-cartoon{width:170px;height:120px}.edu-lessons{display:flex;flex-direction:column;gap:10px}.edu-lesson{display:grid;grid-template-columns:34px 70px 1fr;gap:10px;align-items:center;padding:10px;background:var(--c-white);border:1px solid #E6E2D7;border-radius:20px}.edu-number{width:32px;height:32px;border-radius:11px;background:var(--c-primary-soft);display:flex;align-items:center;justify-content:center;font-weight:900}.edu-lesson-art{width:70px;height:58px;overflow:hidden;border-radius:14px}.edu-lesson-text h3{margin:0;color:var(--c-primary-deep);font-size:.88rem}.edu-lesson-text p{margin:3px 0 0;color:var(--c-text-soft);font-size:.7rem}";
  document.head.appendChild(es);


