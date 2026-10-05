/* رفيق القرآن للأطفال — التعليم الديني
   الصور قابلة للاستبدال من مجلد assets/education/
*/
window.App = window.App || {};

App.Education = {
  topics: [
    {
      id:"wudu", title:"الوضوء", sub:"نتعلم الطهارة خطوة بخطوة", image:"./assets/education/wudu.svg",
      intro:"الوضوء طهارة جميلة نستعد بها للصلاة. نتعلمه بهدوء ونطبقه مع أحد الوالدين أو المعلم.",
      items:[
        ["النية","أن تنوي بقلبك أنك تتوضأ للصلاة، والنية محلها القلب.","./assets/education/wudu-01-niyyah.svg"],
        ["غسل الكفين","نغسل الكفين جيدًا إلى الرسغين، ونحرص على وصول الماء بين الأصابع.","./assets/education/wudu-02-hands.svg"],
        ["المضمضة والاستنشاق","نتمضمض بالماء، ثم نستنشقه بلطف وننثره. وإذا كان الطفل صغيرًا فليتعلم ذلك برفق.","./assets/education/wudu-03-mouth-nose.svg"],
        ["غسل الوجه","نغسل الوجه كله من منابت الشعر المعتادة إلى أسفل الذقن ومن الأذن إلى الأذن.","./assets/education/wudu-04-face.svg"],
        ["غسل اليدين إلى المرفقين","نغسل اليد اليمنى ثم اليسرى مع إدخال المرفقين في الغسل.","./assets/education/wudu-05-arms.svg"],
        ["مسح الرأس والأذنين","نمسح الرأس بالماء، ونتعلم مسح الأذنين مع الرأس.","./assets/education/wudu-06-head.svg"],
        ["غسل الرجلين","نغسل الرجل اليمنى ثم اليسرى إلى الكعبين، ونحرص على الماء بين أصابع القدمين.","./assets/education/wudu-07-feet.svg"],
        ["بعد الوضوء","نحمد الله بعد الوضوء ونتعلم الذكر الوارد بعده مع الوالدين أو المعلم.","./assets/education/wudu-08-after.svg"]
      ]
    },
    {
      id:"prayer", title:"تعلم الصلاة", sub:"نتعلم الصلاة خطوة بخطوة", image:"./assets/education/prayer.svg",
      intro:"الصلاة صلة بين العبد وربه. نتعلمها بالتدريج، ونطلب من الوالدين أو المعلم أن يصححوا لنا التطبيق.",
      items:[
        ["الاستعداد للصلاة","نتوضأ، ونلبس ملابس ساترة ونظيفة، ونتأكد من دخول وقت الصلاة ونستقبل القبلة.","./assets/education/prayer-01-ready.svg"],
        ["النية","ننوي في القلب الصلاة التي سنصليها، ولا نحتاج إلى قول النية بصوت مرتفع.","./assets/education/prayer-02-niyyah.svg"],
        ["تكبيرة الإحرام","نقف إن كنا قادرين ونقول: الله أكبر، ونبدأ الصلاة.","./assets/education/prayer-03-takbir.svg"],
        ["القيام والقراءة","نقرأ الفاتحة في الصلاة، ثم نقرأ ما تيسر من القرآن في موضعه.","./assets/education/prayer-04-standing.svg"],
        ["الركوع","نقول الله أكبر ونركع، ونطمئن في الركوع ونسبح الله.","./assets/education/prayer-05-ruku.svg"],
        ["الرفع من الركوع","نرفع حتى نعتدل قائمين ونطمئن قبل الانتقال إلى السجود.","./assets/education/prayer-06-rise.svg"],
        ["السجود","نسجد ونطمئن، ونسبح الله، وندعو بما ورد من الدعاء.","./assets/education/prayer-07-sujud.svg"],
        ["الجلوس بين السجدتين","نرفع من السجود ونجلس مطمئنين، ثم نسجد السجدة الثانية.","./assets/education/prayer-08-between.svg"],
        ["التشهد","في موضع التشهد نجلس ونقرأ التشهد، وفي الصلاة التي فيها تشهد أخير نصلي على النبي ﷺ وندعو.","./assets/education/prayer-09-tashahhud.svg"],
        ["السلام","نختم الصلاة بالتسليم عن اليمين ثم عن اليسار بحسب الصلاة التي نصليها.","./assets/education/prayer-10-salam.svg"],
        ["ملاحظة مهمة","عدد الركعات يختلف بين الصلوات الخمس، لذلك يتعلم الطفل عدد ركعات كل صلاة مع والديه أو معلمه."]
      ]
    },
    {
      id:"islam", title:"أركان الإسلام", sub:"خمسة أركان", image:"./assets/education/islam-pillars.svg",
      intro:"أركان الإسلام خمسة، وهي أساس مهم يتعلمه الطفل ويفهم معناه ببساطة.",
      items:[
        ["الشهادتان","نشهد أن لا إله إلا الله، وأن محمدًا رسول الله ﷺ. ومعناها أن نعبد الله وحده ونتبع رسوله ﷺ."],
        ["إقامة الصلاة","نحافظ على الصلوات المفروضة ونتعلم كيف نصلي ونخشع فيها."],
        ["إيتاء الزكاة","الزكاة عبادة مالية فرضها الله على من تجب عليه، وتُعطى لمستحقيها."],
        ["صوم رمضان","نصوم شهر رمضان كما شرع الله، ويتعلم الطفل الصيام بالتدرج وبحسب قدرته وتوجيه أهله."],
        ["حج البيت","الحج إلى بيت الله الحرام لمن استطاع إليه سبيلًا، وهو عبادة عظيمة لها مناسك نتعلمها."]
      ]
    },
    {
      id:"iman", title:"أركان الإيمان", sub:"ستة أركان", image:"./assets/education/iman-pillars.svg",
      intro:"الإيمان له ستة أركان، نتعلمها ونفهم أن المسلم يؤمن بما أخبر الله ورسوله ﷺ.",
      items:[
        ["الإيمان بالله","نؤمن بالله ربنا وخالقنا، ونعبده وحده ونحبه ونرجوه ونخافه."],
        ["الإيمان بالملائكة","نؤمن بملائكة الله، وهم عباد مكرمون يطيعون الله ولا يعصونه."],
        ["الإيمان بالكتب","نؤمن بالكتب التي أنزلها الله على رسله، ونؤمن أن القرآن كتاب الله الخاتم المحفوظ."],
        ["الإيمان بالرسل","نؤمن بجميع رسل الله، ومنهم نوح وإبراهيم وموسى وعيسى ومحمد عليهم الصلاة والسلام."],
        ["الإيمان باليوم الآخر","نؤمن بالبعث والحساب والجنة والنار وما أخبر الله ورسوله به من أمور الآخرة."],
        ["الإيمان بالقدر","نؤمن أن كل شيء بعلم الله وتقديره، ونأخذ بالأسباب ونسأل الله الخير."]
      ]
    },
    {
      id:"manners", title:"آداب المسلم", sub:"أخلاق جميلة نعيش بها", image:"./assets/education/manners.svg",
      intro:"الإسلام يعلمنا أن نكون طيبين مع أهلنا والناس، وأن تكون أخلاقنا جميلة في البيت والمدرسة ومع أصدقائنا.",
      items:[
        ["بر الوالدين","نحسن إلى والدينا ونسمع كلامهما في المعروف ونساعدهما ونكلمهما بأدب."],
        ["الصدق","نقول الحقيقة ولا نكذب، حتى عندما نخطئ، ونطلب المساعدة لإصلاح الخطأ."],
        ["الأمانة","نحافظ على الأشياء التي اؤتمنّا عليها، ونردها إلى أصحابها ولا نأخذ ما ليس لنا."],
        ["الرحمة","نرحم الصغير ونوقر الكبير ونرفق بالحيوان ونساعد من يحتاج."],
        ["النظافة","نحافظ على نظافة أجسامنا وملابسنا ومكاننا، ونتعلم الطهارة."],
        ["الاستئذان","نستأذن قبل الدخول، ونحترم خصوصية الآخرين ولا نفتح شيئًا ليس لنا."],
        ["الشكر","نشكر الله على نعمه، ونشكر الناس عندما يساعدوننا أو يحسنون إلينا."],
        ["آداب الطعام","نذكر اسم الله، ونأكل باليمين، ولا نسرف، ونحمد الله بعد الطعام."],
        ["آداب الكلام","نتكلم بلطف، ولا نسخر من أحد، ولا نرفع صوتنا على الآخرين بلا حاجة."]
      ]
    },
    {
      id:"adhkar", title:"أذكار يومية", sub:"نذكر الله في يومنا", image:"./assets/education/adhkar.svg",
      intro:"الذكر يعلّم الطفل أن يتذكر الله في يومه. نبدأ بالأذكار القصيرة ونفهم معناها بدل أن نحفظها بسرعة فقط.",
      items:[
        ["بسم الله","نقول بسم الله قبل الأعمال المناسبة، ونتعلم أن نستعين بالله ونبدأ أعمالنا باسمه."],
        ["الحمد لله","نحمد الله على نعمه، ونقول الحمد لله عندما نتذكر فضله علينا."],
        ["سبحان الله","نسبح الله وننزهه عن كل نقص."],
        ["الله أكبر","نعرف أن الله أكبر من كل شيء، فنطمئن إليه ونحبه."],
        ["أستغفر الله","نطلب من الله المغفرة عندما نخطئ، ونتعلم أن نصلح الخطأ ولا نكرره."],
        ["السلام عليكم","نلقي السلام على المسلمين بأدب ومحبة، ونرد السلام بأحسن منه أو بمثله."]
      ]
    }
  ],

  art(t){
    return '<img class="edu-image" src="'+t.image+'" alt="'+App.esc(t.title)+'" loading="lazy">';
  },

  pageHub(){
    return {
      nav:"more",
      html:'<header class="screen-head"><button class="icon-btn btn-back" data-href="#/more"><span class="ico" data-ico="chevronRight"></span></button><div class="sh-title"><h1>تعلم ديني</h1><p>نتعلم ونفهم ونطبق</p></div></header>'+
      '<div class="edu-hero"><img class="edu-hero-image" src="./assets/education/prayer.svg" alt="تعلم الصلاة"><div><h2>نتعلم ونطبق</h2><p>دروس مبسطة للطفل عن الطهارة والصلاة وأركان الإسلام والإيمان والأخلاق والأذكار.</p></div></div>'+
      '<div class="edu-grid">'+this.topics.map(t=>'<button class="edu-card" data-href="#/education/'+t.id+'"><span class="edu-art">'+this.art(t)+'</span><span class="edu-card-body"><strong>'+t.title+'</strong><small>'+t.sub+'</small><span class="edu-open">تعلم الآن</span></span></button>').join("")+'</div>',
      mount(){}
    };
  },

  pageTopic(p){
    const t=this.topics.find(x=>x.id===p.id);
    if(!t) return {nav:"more",html:App.emptyHtml("الدرس غير موجود")};
    return {
      nav:"more",
      html:'<header class="screen-head"><button class="icon-btn btn-back" data-href="#/education"><span class="ico" data-ico="chevronRight"></span></button><div class="sh-title"><h1>'+t.title+'</h1><p>'+t.sub+'</p></div></header>'+
      '<section class="edu-topic-hero">'+this.art(t)+'<h2>'+t.title+'</h2><p>'+t.intro+'</p></section>'+
      '<div class="edu-lessons">'+t.items.map((item,i)=>'<article class="edu-lesson"><div class="edu-number">'+App.arDigits(i+1)+'</div><div class="edu-lesson-art"><img class="edu-step-image" src="'+(item[2]||t.image)+'" alt="'+App.esc(item[0])+'" loading="lazy"></div><div class="edu-lesson-text"><h3>'+item[0]+'</h3><p>'+item[1]+'</p></div></article>').join("")+'</div>'+
      '<div class="edu-note">تعلم خطوة خطوة، واسأل والديك أو معلمك عن أي شيء لا تفهمه.</div>',
      mount(){}
    };
  }
};

const es=document.createElement("style");
es.textContent=".edu-hero,.edu-topic-hero{display:flex;align-items:center;gap:14px;padding:16px;border-radius:24px;background:#F7FBF8;border:1px solid #DCEBE3;margin-bottom:16px}.edu-hero-image{width:120px;height:92px;object-fit:cover;border-radius:18px}.edu-image,.edu-step-image{width:100%;height:100%;object-fit:cover;display:block}.edu-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.edu-card{background:var(--c-white);border:1px solid #E6E2D7;border-radius:20px;overflow:hidden;text-align:right;padding:0}.edu-art{display:block;height:105px}.edu-card-body{display:block;padding:10px}.edu-card-body strong{display:block;color:var(--c-primary-deep)}.edu-card-body small{display:block;color:var(--c-text-soft);font-size:.7rem;margin-top:3px}.edu-open{display:block;color:var(--c-primary);font-size:.7rem;font-weight:800;margin-top:8px}.edu-topic-hero{display:block;text-align:center}.edu-topic-hero .edu-image{width:180px;height:125px;margin:0 auto 10px;border-radius:20px}.edu-topic-hero h2{margin:0;color:var(--c-primary-deep)}.edu-topic-hero p{color:var(--c-text-soft);line-height:1.8;margin:7px 0 0}.edu-lessons{display:flex;flex-direction:column;gap:10px}.edu-lesson{display:grid;grid-template-columns:34px 70px 1fr;gap:10px;align-items:center;padding:10px;background:var(--c-white);border:1px solid #E6E2D7;border-radius:20px}.edu-number{width:32px;height:32px;border-radius:11px;background:var(--c-primary-soft);display:flex;align-items:center;justify-content:center;font-weight:900}.edu-lesson-art{width:70px;height:58px;overflow:hidden;border-radius:14px}.edu-lesson-text h3{margin:0;color:var(--c-primary-deep);font-size:.88rem}.edu-lesson-text p{margin:5px 0 0;color:var(--c-text-soft);font-size:.74rem;line-height:1.75}.edu-note{margin:14px 0;padding:14px;border-radius:18px;background:#FFF8E7;border:1px solid #F1DEAD;color:#6B5530;font-size:.78rem;line-height:1.8}@media(max-width:380px){.edu-grid{grid-template-columns:1fr}.edu-lesson{grid-template-columns:30px 58px 1fr}.edu-lesson-art{width:58px;height:52px}}";
document.head.appendChild(es);
