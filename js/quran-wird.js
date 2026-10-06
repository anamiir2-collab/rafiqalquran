/* رفيق القرآن — ورد اليوم في مدينة القرآن */
window.App=window.App||{};
(function(){
"use strict";
function getWird(){
  var q=App.Quran;
  if(!q||!q.data)return null;
  var range=App.Range&&App.Range.isValid&&App.Range.isValid()?App.Range.get():null;
  if(range&&range.surah){
    var s=q.surah(range.surah);
    if(s)return{surah:s.number,from:range.from,to:Math.min(range.to,s.ayahsCount),source:"saved"};
  }
  var s=q.suggestNext();
  if(!s)return null;
  return{surah:s.number,from:1,to:Math.min(5,s.ayahsCount),source:"suggested"};
}
App.actions["wird-tilawah"]=function(){
  var w=getWird();if(!w)return;
  App.Storage.setLastAyah(w.surah,w.from);App.Storage.touchToday();
  App.Router.go("#/mushaf/"+w.surah+"/"+w.from);
};
App.actions["wird-hifz"]=function(){
  var w=getWird();if(!w)return;
  if(App.Range&&App.Range.set)App.Range.set(w.surah,w.from,w.to);
  App.Storage.touchToday();App.Router.go("#/journey/"+w.surah);
};
App.actions["wird-range"]=function(){App.Router.go("#/range");};

var originalCity=App.Quran.pageQuranCity;
App.Quran.pageQuranCity=function(){
  if(!App.Quran.data)return originalCity.call(App.Quran);
  var q=App.Quran,w=getWird();
  if(!w)return originalCity.call(q);
  var s=q.surah(w.surah),last=App.Storage.state.lastAyah,lastS=last&&last.s?q.surah(last.s):null;
  var rangeText=w.from===w.to?"الآية "+App.arDigits(w.from):"من الآية "+App.arDigits(w.from)+" إلى "+App.arDigits(w.to);
  var html=""
  +"<header class='screen-head'><div class='sh-title'><h1>مدينة القرآن</h1><p>"+App.arDigits(q.all().length)+" سورة · "+App.arDigits(q.data.meta.ayahsCount)+" آية</p></div></header>"
  +"<section class='quran-wird' aria-label='ورد اليوم'>"
  +"<div class='quran-wird-head'><div><div class='quran-wird-title'>ورد اليوم</div><div class='quran-wird-sub'>وقت قصير ثابت كل يوم يصنع فرقًا كبيرًا</div></div><span class='quran-wird-icon'><span class='ico' data-ico='bookmarkCheck'></span></span></div>"
  +"<div class='quran-wird-range'><strong>سورة "+App.esc(s.name)+"</strong><span>"+rangeText+" · "+App.arDigits(w.to-w.from+1)+" آيات</span></div>"
  +"<div class='quran-wird-actions'>"
  +"<button class='wird-action tilawah' data-action='wird-tilawah' aria-label='ابدأ التلاوة'><span class='wa-icon'><span class='ico' data-ico='headphones'></span></span><span class='wa-text'><span class='wa-title'>التلاوة</span><span class='wa-sub'>اقرأ واستمع للآيات من المصحف</span></span></button>"
  +"<button class='wird-action hifz' data-action='wird-hifz' aria-label='ابدأ الحفظ'><span class='wa-icon'><span class='ico' data-ico='brain'></span></span><span class='wa-text'><span class='wa-title'>الحفظ</span><span class='wa-sub'>ابدأ رحلة حفظ وردك اليومي</span></span></button>"
  +"</div><button class='quran-wird-edit' data-action='wird-range'>تعديل ورد اليوم واختيار السورة والآيات</button></section>"
  +"<button class='quran-city-card btn-block mt-16' data-href='#/mushaf' aria-label='افتح المصحف'><div class='qcc-bg' aria-hidden='true'><div class='qcc-pattern'></div><div class='qcc-ornament'>۞</div></div><div class='qcc-content'><span class='qcc-icon'><span class='ico' data-ico='bookOpen'></span></span><span class='qcc-title'>القرآن الكريم</span><span class='qcc-sub'>مصحف تفاعلي</span>"
  +(lastS?"<span class='qcc-resume'><span class='ico' data-ico='bookmark'></span> آخر قراءة: سورة "+App.esc(lastS.name)+" — الآية "+App.arDigits(last.a)+"</span>":"<span class='qcc-resume'><span class='ico' data-ico='sparkle'></span> ابدأ من الفاتحة</span>")
  +"</div></button><p class='center tiny text-faint mt-16'>"+q.bismillah()+"</p>";
  return{nav:"quran",html:html,mount:function(){}};
};
})();