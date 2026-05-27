// ===== 工具函数 =====
function $(id){return document.getElementById(id);}
function weekday(y,m,d){return ['日','一','二','三','四','五','六'][new Date(y,m-1,d).getDay()];}
function fmtDate(y,m,d){return y+'年'+m+'月'+d+'日';}
function dateKey(y,m,d){return y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');}
function isWeekend(y,m,d){var w=new Date(y,m-1,d).getDay();return w===0||w===6;}
function daysInMonth(y,m){if(m===2)return(y%4===0&&(y%100!==0||y%400===0))?29:28;return [31,28,31,30,31,30,31,31,30,31,30,31][m-1];}

var ATTR={health:'健康',happiness:'幸福',wisdom:'悟性',charm:'魅力',glory:'荣耀',money:'金钱',singing:'歌唱能力',pengyuanBalance:'鹏远余额',gfFavor:'好感度',hanpengHaoGan:'韩鹏好感',teacherFavor:'教师好感',classmateFavor:'同学好感',taniaFavor:'Tania好感',shijianmingFavor:'史鉴明好感',zhouruiFavor:'周蕊好感'};
var ICON={health:'❤️',happiness:'😊',wisdom:'📖',charm:'✨',glory:'🏆',money:'💰',singing:'🎤',pengyuanBalance:'💳',gfFavor:'💕',hanpengHaoGan:'🤝',teacherFavor:'👨‍🏫',classmateFavor:'👥',taniaFavor:'👩‍🏫',shijianmingFavor:'👨‍🔬',zhouruiFavor:'👩‍🏫'};

var COURSE_NAMES={academicLang:'学术语言交流与沟通（中级）',cppProg:'C++程序设计基础',advancedMath:'高等数学建模A',pe:'体育',moralLaw:'思想道德法制',dataAnalysis:'智能数据分析导论',mentalHealth:'心理健康教育',careerPlan:'大学生职业生涯规划'};
var TEACHER_NAMES={hanpeng:'韩鹏',tania:'Tania',shijianming:'史鉴明',zhourui:'周蕊'};

var HOLIDAY_ROUTES={
  home:{name:'返乡回家过节',dailyEffects:{money:-180,happiness:12,health:8},skipMeal:true,gfMod:{favorDecay:5}},
  campus:{name:'留守东秦校园',dailyEffects:{},skipMeal:false,gfMod:{},hasCampusEvents:true},
  couple:{name:'与女友短途出游',dailyEffects:{money:-160,happiness:15},skipMeal:false,gfMod:{favorBonus:18,specialChance:0.35},requiresGf:true},
  internship:{name:'前往鸟爷控股短期实习',dailyEffects:{money:100,health:-10},skipMeal:false,gfMod:{rejectExtra:5}},
  dorm:{name:'宿舍摆烂躺平',dailyEffects:{health:10,happiness:14,wisdom:-12},skipMeal:false,gfMod:{acceptPenalty:2}}
};

// ===== 游戏状态 =====
var GS;
function defaultState(){
  return {
    year:2024,month:8,day:15,
    health:100,happiness:100,wisdom:100,charm:100,
    glory:0,money:3700,singing:0,
    hasPengyuanCard:false,hasPhoneCard:false,
    talentPerformed:false,talentSuccess:false,wonElection:false,
    tuanxiaoApplied:false,tuanxiaoAccepted:false,
    dachuangJoined:false,hanpengHaoGan:0,
    cet4Applied:false,deskBought:false,
    clubApplied:false,clubType:'',
    keChuangUnlocked:false,sheTuanUnlocked:false,tuanxiaoWeekBan:0,
    gfUnlocked:false,gfName:'',gfFavor:0,
    inventory:[],phase:'title',currentNode:null,currentDay:null,currentPhaseIdx:0,
    pengyuanBalance:0,tuanxiaoWisdomPending:false,
    teacherFavor:80,classmateFavor:80,
    lastMealDay:'',
    breakupProb:0,
    courseGrades:{academicLang:80,cppProg:80,advancedMath:80,pe:80,moralLaw:80,dataAnalysis:80,mentalHealth:80,careerPlan:80},
    taniaFavor:80,shijianmingFavor:80,zhouruiFavor:80,
    hanpengUnlocked:false,taniaUnlocked:false,shijianmingUnlocked:false,zhouruiUnlocked:false,
    weekendEventReduction:0,
    holidayRoute:null
  };
}

function doEffects(eff){
  var ch={};
  for(var k in eff){
    if(eff.hasOwnProperty(k)&&GS.hasOwnProperty(k)&&typeof GS[k]==='number'){
      var old=GS[k];
      GS[k]=Math.max(0,GS[k]+eff[k]);
      ch[k]=GS[k]-old;
    }
  }
  return ch;
}

function updatePanel(){
  $('date-display').textContent=fmtDate(GS.year,GS.month,GS.day);
  $('weekday-display').textContent='星期'+weekday(GS.year,GS.month,GS.day);
  $('val-health').textContent=GS.health;
  $('val-happy').textContent=GS.happiness;
  $('val-wisdom').textContent=GS.wisdom;
  $('val-charm').textContent=GS.charm;
  $('val-glory').textContent=GS.glory;
  $('val-money').textContent=GS.money;
  $('val-singing').textContent=GS.singing;
  $('val-pengyuan').textContent=GS.pengyuanBalance;
  $('val-teacher-favor').textContent=GS.teacherFavor;
  $('val-classmate-favor').textContent=GS.classmateFavor;
  if(GS.gfUnlocked){
    $('love-row').style.display='flex';
    $('gf-name').textContent=GS.gfName||'女友';
    $('gf-favor').textContent=GS.gfFavor;
  }else{$('love-row').style.display='none';}
  var b=['🐯虎爷:考试+10%','🍼奶扣:月末健康-5','🏅京爷:竞赛+10%'];
  if(GS.hasPengyuanCard)b.push('💳鹏远余额:'+GS.pengyuanBalance);
  if(GS.hasPhoneCard)b.push('📶电话卡(-49/月)');
  if(GS.wonElection)b.push('🎖️班委');
  if(GS.keChuangUnlocked)b.push('🔬科创');
  if(GS.sheTuanUnlocked)b.push('🎭社团');
  if(GS.tuanxiaoAccepted&&GS.tuanxiaoWeekBan>0){
    if(GS.month<10)b.push('⚠️团校集训(10月起，剩'+GS.tuanxiaoWeekBan+'周)');
    else if(GS.tuanxiaoWisdomPending)b.push('📖团校进行中('+GS.tuanxiaoWeekBan+'周)·悟性+100待领');
    else b.push('⚠️团校周末禁闭('+GS.tuanxiaoWeekBan+'周)');
  }
  if(GS.clubType)b.push('📋已报社团:'+GS.clubType);
  if(GS.gfUnlocked)b.push('💕恋爱中');
  if(GS.weekendEventReduction>0)b.push('🗳️周末事件-'+GS.weekendEventReduction);
  $('buff-row').innerHTML=b.map(function(x){return'<span>'+x+'</span>';}).join('');
}

// ===== 弹窗 =====
function showPopup(title,resultText,changes,hiddenInfo,callback){
  var overlay=document.createElement('div');overlay.className='popup-overlay';
  var chgHtml='';
  if(changes&&Object.keys(changes).length>0){
    chgHtml='<div class="popup-changes">';
    for(var k in changes){
      if(changes.hasOwnProperty(k)&&changes[k]!==0){
        var cls=changes[k]>0?'pos':'neg';
        var sign=changes[k]>0?'+':'';
        chgHtml+='<span class="chg-item '+cls+'">'+(ICON[k]||'')+' '+(ATTR[k]||k)+' '+sign+changes[k]+'</span>';
      }
    }
    chgHtml+='</div>';
  }
  var hh=hiddenInfo?'<div class="popup-hidden">🔍 '+hiddenInfo+'</div>':'';
  var rt=resultText?resultText.replace(/\n/g,'<br>'):'';
  overlay.innerHTML='<div class="popup-box"><div class="popup-title">'+title+'</div>'+(rt?'<div class="popup-result">'+rt+'</div>':'')+chgHtml+hh+'<button class="popup-btn" id="popup-ok">确定</button></div>';
  document.body.appendChild(overlay);
  $('popup-ok').onclick=function(){overlay.remove();if(callback)callback();};
  overlay.onclick=function(e){if(e.target===overlay){overlay.remove();if(callback)callback();}};
}

// ===== 渲染入口 =====
function setPhase(p){
  GS.phase=p;
  $('attr-panel').style.display=(p==='story'||p==='daily')?'block':'none';
  $('bottom-bar').style.display=(p==='story'||p==='daily')?'flex':'none';
  $('choices-area').innerHTML='';
  $('main-area').innerHTML='';
}

function renderBottomBar(){
  $('bottom-bar').innerHTML='<button onclick="saveGame()">💾 保存</button><button onclick="loadGame()">📂 读取</button><button onclick="openSupermarket()">🏪 利生超市</button><button onclick="showGrades()">📊 成绩</button><button onclick="showTeacherFavors()">👨‍🏫 教师好感</button><button onclick="resetToTitle()">🏠 标题</button>';
}

// ===== 利生超市 =====
var SUPERMARKET_REGULAR=[
  {id:'qiaolezi',name:'巧乐兹',desc:'经典巧克力脆皮雪糕，一口甜蜜治愈疲惫',cost:8,effects:{happiness:5}},
  {id:'kaochang',name:'烤肠',desc:'热腾腾的烤肠，外焦里嫩，课间必备',cost:5,effects:{happiness:3}},
  {id:'gaozhi',name:'东秦草稿纸',desc:'印有东秦校徽的优质草稿纸，学习好帮手',cost:3,effects:{wisdom:3}}
];
var SUPERMARKET_MYSTERY_POOL=[
  {id:'myst1',name:'神秘零食大礼包',desc:'随机搭配的进口零食组合',cost:12,effects:{happiness:8,health:2}},
  {id:'myst2',name:'东秦纪念笔记本',desc:'限量版烫金硬壳笔记本，东秦校训印制',cost:15,effects:{wisdom:6,happiness:3}},
  {id:'myst3',name:'好运红牛',desc:'据说考试前喝一罐能带来好运',cost:10,effects:{health:5,charm:3}},
  {id:'myst4',name:'学霸二手教材',desc:'不知哪位学霸留下的珍贵专业课教材',cost:20,effects:{wisdom:10}},
  {id:'myst5',name:'校园风景明信片套装',desc:'手绘东秦十景，收藏或寄给远方好友',cost:8,effects:{happiness:4,charm:3}},
  {id:'myst6',name:'暖宝宝贴',desc:'冬日神器，贴在衣服里暖和一整天',cost:6,effects:{health:4,happiness:3}}
];

function isMysteryDay(){var d=GS.day;return d===1||d===10||d===20||d===30;}

function openSupermarket(){
  var overlay=document.createElement('div');overlay.className='supermarket-overlay';
  var html='<div class="supermarket-box">';
  html+='<div class="sm-title">🏪 利生超市</div>';
  html+='<div class="sm-subtitle">校园生活便利店 · 刷现金或鹏远卡均可支付</div>';
  html+='<div class="sm-payment"><span style="font-weight:600;">支付方式：</span>';
  html+='<label><input type="radio" name="sm-pay" value="money" checked> 💰 现金（余额：'+GS.money+'）</label>';
  if(GS.hasPengyuanCard){
    html+='<label><input type="radio" name="sm-pay" value="pengyuan"> 💳 鹏远卡（余额：'+GS.pengyuanBalance+'）</label>';
  }
  html+='</div>';
  html+='<div style="font-weight:600;color:#1a3a5c;margin-bottom:8px;">📦 常驻商品</div>';
  for(var i=0;i<SUPERMARKET_REGULAR.length;i++){
    html+=buildSmItemHtml(SUPERMARKET_REGULAR[i],false);
  }
  if(isMysteryDay()){
    var seed=GS.year*10000+GS.month*100+GS.day;
    var idx=seed%SUPERMARKET_MYSTERY_POOL.length;
    var mItem=SUPERMARKET_MYSTERY_POOL[idx];
    html+='<div style="font-weight:600;color:#c9a96e;margin:12px 0 8px;">🎁 今日神秘商品 <span style="font-size:.75em;font-weight:400;">（每月1/10/20/30日限时上架）</span></div>';
    html+=buildSmItemHtml(mItem,true);
  }
  html+='<button class="sm-close" id="sm-close-btn">关闭超市</button></div>';
  overlay.innerHTML=html;
  document.body.appendChild(overlay);
  $('sm-close-btn').onclick=function(){overlay.remove();};
  overlay.onclick=function(e){if(e.target===overlay)overlay.remove();};
  var buyBtns=overlay.querySelectorAll('.sm-buy-btn');
  for(var j=0;j<buyBtns.length;j++){
    (function(btnEl){
      btnEl.onclick=function(){
        var payMethod=overlay.querySelector('input[name="sm-pay"]:checked').value;
        var cost=parseInt(btnEl.getAttribute('data-cost'));
        var effStr=btnEl.getAttribute('data-effects');
        var name=btnEl.getAttribute('data-name');
        var effects=JSON.parse(effStr);
        if(payMethod==='money'&&GS.money<cost){showToast('现金不足！需要'+cost+'元，当前余额：'+GS.money+'元');return;}
        if(payMethod==='pengyuan'&&GS.pengyuanBalance<cost){showToast('鹏远余额不足！需要'+cost+'元，当前余额：'+GS.pengyuanBalance+'元');return;}
        if(payMethod==='money'){effects.money=(effects.money||0)-cost;}
        else{effects.pengyuanBalance=(effects.pengyuanBalance||0)-cost;}
        var changes=doEffects(effects);updatePanel();
        overlay.remove();
        showPopup('利生超市','你购买了【'+name+'】。'+(payMethod==='money'?'使用现金支付'+cost+'元。':'使用鹏远卡支付'+cost+'元。'),changes,null,null);
      };
    })(buyBtns[j]);
  }
}

function buildSmItemHtml(item,isMystery){
  var effStrs=[];
  for(var k in item.effects){
    if(item.effects.hasOwnProperty(k)){
      var sign2=item.effects[k]>0?'+':'';
      effStrs.push((ICON[k]||'')+' '+sign2+item.effects[k]);
    }
  }
  var cls=isMystery?'sm-item mystery':'sm-item';
  var tag=isMystery?'<span class="sm-mystery-tag">神秘</span>':'';
  return '<div class="'+cls+'"><div class="sm-info"><div class="sm-name">'+tag+item.name+'</div><div class="sm-desc">'+item.desc+'</div><div class="sm-effects">'+effStrs.join(' · ')+'</div></div><div class="sm-cost">¥'+item.cost+'</div><button class="sm-buy-btn" data-cost="'+item.cost+'" data-effects=\''+JSON.stringify(item.effects)+'\' data-name="'+item.name+'">购买</button></div>';
}

function showGrades(){
  var overlay=document.createElement('div');overlay.className='grades-overlay';
  var html='<div class="grades-box">';
  html+='<div class="grades-title">📊 课程成绩</div>';
  html+='<div class="grades-subtitle">当前学期课程预估成绩（满分100）</div>';
  var courses=['academicLang','cppProg','advancedMath','pe','moralLaw','dataAnalysis','mentalHealth','careerPlan'];
  for(var i=0;i<courses.length;i++){
    var key=courses[i];
    var score=GS.courseGrades[key]||80;
    var cls=score>=90?'high':(score>=70?'medium':'low');
    html+='<div class="grade-item"><span class="grade-name">'+COURSE_NAMES[key]+'</span><span class="grade-val '+cls+'">'+score+' 分</span></div>';
  }
  html+='<button class="grades-close" id="grades-close-btn">关闭</button></div>';
  overlay.innerHTML=html;
  document.body.appendChild(overlay);
  $('grades-close-btn').onclick=function(){overlay.remove();};
  overlay.onclick=function(e){if(e.target===overlay)overlay.remove();};
}

function showTeacherFavors(){
  var overlay=document.createElement('div');overlay.className='teacher-favor-overlay';
  var html='<div class="teacher-favor-box">';
  html+='<div class="tf-title">👨‍🏫 教师好感度</div>';
  html+='<div class="tf-subtitle">已解锁教师的好感度一览</div>';
  var unlocked=[];
  if(GS.hanpengUnlocked)unlocked.push({key:'hanpeng',name:TEACHER_NAMES.hanpeng,favor:GS.hanpengHaoGan});
  if(GS.taniaUnlocked)unlocked.push({key:'tania',name:TEACHER_NAMES.tania,favor:GS.taniaFavor});
  if(GS.shijianmingUnlocked)unlocked.push({key:'shijianming',name:TEACHER_NAMES.shijianming,favor:GS.shijianmingFavor});
  if(GS.zhouruiUnlocked)unlocked.push({key:'zhourui',name:TEACHER_NAMES.zhourui,favor:GS.zhouruiFavor});
  if(unlocked.length===0){
    html+='<div class="tf-empty">暂无已解锁的教师<br><span style="font-size:.8em;">随剧情推进逐步解锁</span></div>';
  }else{
    for(var i=0;i<unlocked.length;i++){
      var t=unlocked[i];
      html+='<div class="tf-item"><span class="tf-name">'+t.name+' 老师</span><span class="tf-val">'+t.favor+' 好感度</span></div>';
    }
  }
  html+='<button class="tf-close" id="tf-close-btn">关闭</button></div>';
  overlay.innerHTML=html;
  document.body.appendChild(overlay);
  $('tf-close-btn').onclick=function(){overlay.remove();};
  overlay.onclick=function(e){if(e.target===overlay)overlay.remove();};
}

function renderTitle(){
  setPhase('title');
  $('attr-panel').style.display='none';
  $('bottom-bar').style.display='none';
  $('main-area').innerHTML='<div id="title-screen"><h1>东秦校园人生</h1><div class="subtitle">—— 文字养成 · 大学生涯模拟 ——</div><div class="desc">你是一名东秦大学2024级本科新生。<br>从收到录取通知书的那一刻起，<br>你将在校园中度过充满选择与成长的四年时光。<br>每一次选择，都将塑造独一无二的你。</div><button onclick="startNewGame()">开始新游戏</button><div style="margin-top:20px;"><button style="background:#8b7d6b;font-size:.85em;padding:10px 28px;" onclick="loadGame()">读取存档</button></div><div style="margin-top:14px;font-size:.75em;color:#aaa;">存档自动保存至浏览器本地</div></div>';
}

function startNewGame(){
  GS=defaultState();
  GS.phase='allocation';
  GS.health=30;GS.happiness=30;GS.wisdom=30;GS.charm=30;
  renderAllocation();
}

// ===== 属性分配 =====
function renderAllocation(){
  setPhase('title');
  $('attr-panel').style.display='none';
  $('bottom-bar').style.display='none';
  var rem=400-GS.health-GS.happiness-GS.wisdom-GS.charm;
  var attrs=[
    {key:'health',icon:'❤️',name:'健康',desc:'体魄与精力'},
    {key:'happiness',icon:'😊',name:'幸福',desc:'情绪与满足感'},
    {key:'wisdom',icon:'📖',name:'悟性',desc:'学习与理解力'},
    {key:'charm',icon:'✨',name:'魅力',desc:'社交与表达力'}
  ];
  var html='<div id="allocation-screen"><h2>📋 初始属性分配</h2>';
  html+='<div class="alloc-desc">四项核心属性初始总和为400点，请自由分配（单项最低30点）</div>';
  html+='<div class="remaining">剩余可分配点数：<span id="remain-pts">'+rem+'</span></div>';
  for(var i=0;i<attrs.length;i++){
    var a=attrs[i];
    html+='<div class="alloc-row">';
    html+='<div class="info"><span class="icon">'+a.icon+'</span><div><div class="name">'+a.name+'</div><div class="desc">'+a.desc+'</div></div></div>';
    html+='<div class="controls">';
    html+='<button id="minus-'+a.key+'" onclick="adjustAttr(\''+a.key+'\',-5)"'+(GS[a.key]<=30?' disabled':'')+'>−</button>';
    html+='<span class="val" id="val-'+a.key+'">'+GS[a.key]+'</span>';
    html+='<button id="plus-'+a.key+'" onclick="adjustAttr(\''+a.key+'\',5)"'+(rem<=0?' disabled':'')+'>+</button>';
    html+='</div></div>';
  }
  html+='<button class="confirm-btn" id="confirm-alloc" onclick="confirmAllocation()"'+(rem!==0?' disabled':'')+'>确认分配 · 开始大学生涯</button>';
  html+='</div>';
  $('main-area').innerHTML=html;
}

function adjustAttr(key,delta){
  var rem=400-GS.health-GS.happiness-GS.wisdom-GS.charm;
  var nv=GS[key]+delta;
  if(delta>0&&rem<=0)return;
  if(delta<0&&nv<30)return;
  if(delta>0&&rem<delta)return;
  GS[key]=nv;
  renderAllocation();
}

function confirmAllocation(){
  if((GS.health+GS.happiness+GS.wisdom+GS.charm)!==400)return;
  GS.phase='story';GS.currentNode='prologue';
  GS.year=2024;GS.month=8;GS.day=15;
  $('attr-panel').style.display='block';
  $('bottom-bar').style.display='flex';
  updatePanel();
  renderStoryNode(STORY_NODES.prologue);
  renderBottomBar();
  saveGame();
}

// ==================== 故事节点 9.7 ====================
var STORY_NODES={
prologue:{date:[2024,8,15],title:'神秘邮件',text:'2024年8月，你的邮箱收到一封无发件人的EMA神秘邮件。\n\n带着疑惑拆开邮件后，一封烫金的东秦大学录取通知书静静躺在文件中。\n\n通知书清晰标注：2024年9月7日前往东秦大学指定地点完成新生入学报到。\n\n你的大学生涯，自此拉开序幕。',choices:[],autoNext:'sep7_stage1',dateJump:[2024,9,7]},
sep7_stage1:{date:[2024,9,7],title:'校园报到 · 鹏远卡办理',text:'2024年9月7日，你怀揣录取通知书踏入东秦大学校园，按照通知书指引前往东操场完成新生统一报到。\n\n完成基础信息登记后，在校志愿者一对一带领下，你前往校内鹏远公寓办理入住手续。抵达公寓服务中心后，工作人员提示你可以自愿办理官方鹏远一卡通。',choices:[
  {text:'办理鹏远通行卡（扣除1200元）',effects:{money:-1200,pengyuanBalance:700},flags:{hasPengyuanCard:true},result:'你选择办理鹏远通行卡，支付1200元后获得了通行卡一张、卡内余额700元、公寓专属水票100元。',next:'sep7_stage2'},
  {text:'不办理鹏远通行卡',effects:{},result:'你决定不办理。后续公寓出入、日常用水需自行临时付费，但并无大碍。',next:'sep7_stage2'}
]},
sep7_stage2:{date:[2024,9,7],title:'宿舍电话卡选择',text:'完成公寓入住手续后，你独自行走在校园主干道上，一名热心的高年级志愿者学长主动上前，向你介绍校园专属宿舍电话卡套餐，该套餐为宿舍唯一官方网络来源。',choices:[
  {text:'购买宿舍鹏远电话卡（每月自动扣费49元）',effects:{},flags:{hasPhoneCard:true},result:'你购买了宿舍鹏远电话卡。每月自动扣除49元，宿舍全屋高速网络已解锁。',next:'sep7_stage3'},
  {text:'拒绝购买电话卡',effects:{},result:'你婉拒了学长的推荐。宿舍暂无网络，但每月省下了这笔固定开销。',next:'sep7_stage3'}
]},
sep7_stage3:{date:[2024,9,7],title:'宿舍入住 · 三位室友',text:'办理完所有入住相关事宜，你正式入住鹏远公寓四人间宿舍。\n\n宿舍现阶段暂未安装空调，后续可通过校园事件、赚取荣耀值解锁空调安装权限。\n\n你正式认识了三位朝夕相处的室友：\n\n🛏️ 虎爷 —— 学习氛围极强。被动buff：你所有科目考试成绩永久提升10%\n\n🛏️ 奶扣 —— 作息不规律，熬夜习惯严重。被动debuff：每月月底自动扣除5点健康值\n\n🛏️ 京爷 —— 竞赛经验丰富。被动buff：你所有校园竞赛参与成功率永久提升10%\n\n这三位室友的被动buff/debuff将全程覆盖你的整个大学生涯。',choices:[],autoNext:'sep7_stage4'},
sep7_stage4:{date:[2024,9,7],title:'新生见面会 · 才艺展示',text:'当晚，学院助导统一组织全体新生前往教学楼开展新生见面会，流程依次为全员自我介绍、自愿才艺展示、班委竞选宣讲。\n\n自我介绍环节顺利结束后，主持人开启自愿才艺展示通道。台下同学们的目光纷纷投向舞台，你心中微动——要不要上去展示一下自己？',choices:[
  {text:'上台进行才艺展示',prob:true,probAttr:'charm',probDiv:200,probCap:0.9,sEffects:{charm:8},sText:'你在台上落落大方，才艺展示引来台下同学与助导的热烈掌声和欢呼！',fEffects:{charm:-5},fText:'表演中途出现了小失误，台下传来几声善意的笑声。你略显尴尬地鞠躬下台。',setFlagsOnAny:{talentPerformed:true},next:'sep7_stage5'},
  {text:'放弃才艺展示，安静在台下观看',effects:{},result:'你选择安静坐在台下，为上台表演的同学鼓掌喝彩。低调完成这一环节。',next:'sep7_stage5'}
]},
sep7_stage5:{date:[2024,9,7],title:'新生见面会 · 班委竞选',text:'才艺展示环节结束后，班级三大班委负责人（班长、团支书、学习委员）公开竞选环节正式开启。\n\n竞选结果完全取决于你的个人魅力与表达能力。你是否有足够的自信站上讲台？',choices:[
  {text:'报名参与班委负责人竞选',cond:true,condAttr:'charm',condTh:120,sEffects:{glory:10},sText:'凭借出色的表达能力与个人气质，你在竞选中脱颖而出，成功当选班委负责人！荣耀值+10。',sFlags:{wonElection:true},fEffects:{charm:-6},fText:'尽管你努力表达了自己的想法，但人气不足，最终遗憾落选。自信心小幅受挫。',next:'sep7_stage6'},
  {text:'放弃竞选班委负责人',effects:{},result:'你决定不参与竞选，专注于自身的大学生活。',next:'sep7_stage6'}
]},
sep7_stage6:{date:[2024,9,7],title:'晚间宿舍活动',text:'新生见面会正式结束，夜幕降临，你回到四人间宿舍。\n\n今晚没有晚自习，你可以自由安排睡前时间。三位室友各自在做自己的事情。',choices:[
  {text:'和三位室友一起出门散步、休闲游玩',effects:{charm:6,happiness:10},result:'你和室友们一起在校园里散步，吹着晚风聊着各自的高中趣事和对大学的憧憬。',next:'sep7_end'},
  {text:'留在宿舍独自自习学习',effects:{wisdom:12},result:'你翻开从家里带来的专业入门书籍，沉浸在知识的海洋中。',next:'sep7_end'}
]},
sep7_end:{date:[2024,9,7],title:'入学第一天 · 完结',text:'忙碌而充实的入学第一天画上了句号。\n\n你躺在床上，回顾今天的种种经历——报到、办卡、认识室友、新生见面会……每一件事都历历在目。\n\n这是你大学生涯的起点。从明天开始，你将正式开启在东秦大学的每一天。\n\n晚安，东秦。',choices:[],enterDaily:true}
};

function renderStoryNode(node){
  if(node.date){GS.year=node.date[0];GS.month=node.date[1];GS.day=node.date[2];}
  updatePanel();
  $('main-area').innerHTML='<div id="story-title">'+node.title+'</div><div id="story-text">'+node.text.replace(/\n/g,'<br>')+'</div>';
  $('choices-area').innerHTML='';
  if(node.choices.length===0){
    var btn=document.createElement('button');btn.className='primary';btn.textContent='继续';
    btn.onclick=function(){
      if(node.dateJump){GS.year=node.dateJump[0];GS.month=node.dateJump[1];GS.day=node.dateJump[2];}
      if(node.enterDaily){enterScriptedDays();return;}
      if(node.autoNext){renderStoryNode(STORY_NODES[node.autoNext]);saveGame();}
    };
    $('choices-area').appendChild(btn);
  }else{
    node.choices.forEach(function(c,i){
      var btn=document.createElement('button');btn.textContent=c.text;
      btn.onclick=function(){processSep7Choice(node,i);};
      $('choices-area').appendChild(btn);
    });
  }
}

function processSep7Choice(node,ci){
  var c=node.choices[ci],eff={},rt='',hiddenInfo=null;
  if(c.prob){
    var pv=GS[c.probAttr]||100;
    var prob=Math.min(c.probCap||0.9,(pv+(c.probBase||0))/(c.probDiv||200));
    if(Math.random()<prob){eff=Object.assign({},c.sEffects||{});rt=c.sText;GS.talentSuccess=true;}
    else{eff=Object.assign({},c.fEffects||{});rt=c.fText;GS.talentSuccess=false;}
    if(c.setFlagsOnAny)Object.assign(GS,c.setFlagsOnAny);
  }else if(c.cond){
    if((GS[c.condAttr]||0)>=c.condTh){eff=Object.assign({},c.sEffects||{});rt=c.sText;if(c.sFlags)Object.assign(GS,c.sFlags);}
    else{eff=Object.assign({},c.fEffects||{});rt=c.fText;}
  }else{eff=Object.assign({},c.effects||{});rt=c.result||'';}
  if(c.flags)Object.assign(GS,c.flags);
  var changes=doEffects(eff);
  showPopup(node.title,rt,changes,hiddenInfo,function(){
    updatePanel();
    if(c.next&&STORY_NODES[c.next]){renderStoryNode(STORY_NODES[c.next]);saveGame();}
    else if(node.choices[0].next&&STORY_NODES[node.choices[0].next]){renderStoryNode(STORY_NODES[node.choices[0].next]);saveGame();}
  });
}

// ==================== 随机事件池 ====================
var RP={
sep8:[
  {title:'偶遇同班同学搭话',text:'你在回宿舍的路上偶遇了一位同班同学，对方热情地向你打招呼，想和你聊聊天。',choices:[
    {text:'热情闲聊',effects:{charm:7,happiness:4,health:-3},result:'你们聊得很投机，从家乡聊到高考，又聊到对大学生活的憧憬。虽然聊得口干舌燥，但彼此的距离拉近了许多。'},
    {text:'礼貌拒绝',effects:{happiness:6,charm:-3},result:'你有礼貌地表示自己还有事，对方也表示理解。虽然避免了社交消耗，但错过了拉近关系的机会。'}
  ]},
  {title:'校园二手书摆摊',text:'路过校园主干道时，你看到有大四学长学姐在摆摊卖二手教材和参考书。',choices:[
    {text:'买书',effects:{money:-40,wisdom:10},result:'你挑选了几本专业相关的二手参考书，学长还附送了一些课堂笔记。'},
    {text:'不买',effects:{},result:'你看了看就离开了。虽然省了钱，但错过了性价比极高的学习资料。'}
  ]},
  {title:'操场夜跑邀约',text:'傍晚时分，室友虎爷换上了运动装备，问你要不要一起去操场夜跑。',choices:[
    {text:'答应跑步',effects:{health:9,happiness:3,wisdom:-2},result:'你和虎爷在操场跑了几圈，出了一身汗，整个人都精神了。'},
    {text:'拒绝邀约',effects:{},result:'你婉拒了虎爷，选择留在宿舍。'}
  ]},
  {title:'班委经验分享会旁听',text:'路过教学楼时，你看到一间教室里有高年级优秀班委在分享学生工作经验，门口写着"欢迎旁听"。',choices:[
    {text:'驻足倾听',effects:{wisdom:6,glory:2,happiness:-3},result:'你悄悄走进教室后排坐下，听了几位优秀学长学姐的分享。'},
    {text:'直接离开',effects:{},result:'你对班委工作兴趣不大，径直走过了教室。'}
  ]}
],
sep9:[
  {title:'食堂三餐选择',text:'到了饭点，你来到食堂。今天有健康轻食窗口和人气炸鸡窗口。',choices:[
    {text:'健康餐',effects:{health:8,happiness:-4},result:'你选择了清淡健康的蒸菜套餐，营养均衡。'},
    {text:'高热量餐',effects:{happiness:9,health:-5},result:'你选了炸鸡套餐配可乐，外酥里嫩，吃得非常满足！'}
  ]},
  {title:'图书馆自习',text:'下午有空闲时间，你决定去图书馆自习。',choices:[
    {text:'坚持自习',effects:{wisdom:12,health:-4},result:'你专注地学了整整一个下午，完成了不少预习任务。'},
    {text:'提前离场',effects:{happiness:6,wisdom:-5},result:'学了一个多小时后你觉得有些坐不住，收拾东西提前离开了。'}
  ]},
  {title:'校园短时志愿者招募',text:'校园公告栏前围了不少人，原来是学校在招募下午活动的临时志愿者。',choices:[
    {text:'报名志愿',effects:{glory:6,charm:4,happiness:-5},result:'你报名参加了志愿者服务，帮忙引导来访人员。获得了服务证书。'},
    {text:'拒绝志愿',effects:{},result:'你看了看招募通知，默默走开了。'}
  ]},
  {title:'宿舍小游戏邀请',text:'回到宿舍，奶扣正在招呼大家一起来玩一局桌游。',choices:[
    {text:'一起玩游戏',effects:{happiness:8,charm:3,wisdom:-4},result:'你们四个人玩得不亦乐乎，笑声引来了隔壁宿舍的同学围观。'},
    {text:'拒绝游戏',effects:{},result:'你表示想自己看会儿书，奶扣没再劝你。'}
  ]}
],
sep10:[
  {title:'同学请教学习难题',text:'课间休息时，一位同班同学拿着课本走过来，说有一道题不太明白。',choices:[
    {text:'耐心解答',effects:{wisdom:5,charm:4,health:-3},result:'你耐心地给对方讲解了两遍。教学相长，你自己对这道题的理解也更深刻了。'},
    {text:'委婉推脱',effects:{},result:'你委婉地表示自己也还在消化，建议对方去问老师。'}
  ]},
  {title:'小卖部零食促销',text:'路过宿舍楼下小卖部，看到门口贴着"新学期特惠"的海报。',choices:[
    {text:'购买零食',effects:{money:-35,happiness:7},result:'你买了一大袋零食和饮料，拎回宿舍和室友们分享。'},
    {text:'拒绝消费',effects:{},result:'你克制住了购物的冲动，默默走过了小卖部。'}
  ]},
  {title:'傍晚操场散步邀约',text:'京爷发消息问你要不要一起去操场散散步。',choices:[
    {text:'结伴散步',effects:{health:6,happiness:5,wisdom:-3},result:'你和京爷一边绕操场散步一边听他聊竞赛的趣事。'},
    {text:'独自散步',effects:{health:5},result:'你表示想一个人走走。独自在操场上吹着晚风也是一种享受。'}
  ]},
  {title:'查看校园公告栏',text:'路过校园公告栏时，你注意到上面贴满了各种通知。',choices:[
    {text:'仔细浏览',effects:{glory:3,wisdom:4,health:-2},result:'你从头到尾仔细看了一遍，记下了几个感兴趣的活动时间。'},
    {text:'直接路过',effects:{},result:'你匆匆瞥了一眼就继续赶路了。'}
  ]}
],
sep12:[
  {title:'咨询科创竞赛问题',text:'参观完双创基地后，你注意到韩鹏老师在旁边回答学生的问题。',choices:[
    {text:'主动咨询',effects:{wisdom:8,glory:3,happiness:-4},result:'你主动上前向韩鹏老师请教科创竞赛问题。韩鹏老师很耐心地解答。'},
    {text:'旁观路过',effects:{},result:'你在旁边听了一会儿别人的提问，便默默离开了。'}
  ]},
  {title:'和新生交流参观心得',text:'参观结束后，一群新生聚在一起讨论刚才看到的科创项目。',choices:[
    {text:'积极交流',effects:{charm:6,happiness:4},result:'你加入了讨论，分享了自己的想法。大家聊得很投机，还互加了微信。'},
    {text:'沉默倾听',effects:{charm:-2},result:'你默默站在旁边听了一会儿，没有发言。你感觉自己有些不合群。'}
  ]},
  {title:'参观后疲惫小憩',text:'走了一上午，你感到有些疲惫。回宿舍的路上经过学校的小花园。',choices:[
    {text:'原地休息',effects:{health:7,wisdom:-4},result:'你在长椅上坐下，闭目养神了半小时。温暖的阳光和微风让你恢复了不少精力。'},
    {text:'直接返校',effects:{},result:'你忍着疲惫直接走回了宿舍。'}
  ]},
  {title:'拍摄科创作品发朋友圈',text:'在双创基地里看到了几个非常酷的学生科创作品。',choices:[
    {text:'拍照分享',effects:{happiness:5},result:'你拍了几张照片发到朋友圈，很快收到了不少点赞和评论。'},
    {text:'专心学习',effects:{wisdom:6},result:'你收起手机，认真阅读每个作品旁边的介绍说明。'}
  ]}
],
sep14:[
  {title:'提前打探社团招新',text:'参观完一站式服务中心后，你注意到走廊里已经贴出了各社团的招新海报。',choices:[
    {text:'逐一咨询',effects:{charm:7,wisdom:3,health:-3},result:'你一个摊位一个摊位地咨询，拿了一大把宣传单，收获满满。'},
    {text:'简单观望',effects:{},result:'你粗略扫了一遍海报，心里大概有了数。'}
  ]},
  {title:'服务中心引导新生',text:'在一站式服务中心里，你看到有几位新生找不到方向。',choices:[
    {text:'主动帮忙',effects:{glory:5,charm:4,happiness:-3},result:'你主动上前帮忙指引，几位新生连声道谢。'},
    {text:'自顾办事',effects:{},result:'你办好自己的事情后就离开了。'}
  ]},
  {title:'购买社团相关书籍',text:'路过校园书店，橱窗里摆着一些社团推荐的入门书籍。',choices:[
    {text:'买书',effects:{money:-45,wisdom:9},result:'你挑了一本自己感兴趣方向的书。提前了解相关知识。'},
    {text:'不购买',effects:{},result:'你觉得等正式加入社团后再根据需要购买也不迟。'}
  ]},
  {title:'观察校园办事流程',text:'在一站式服务中心大厅里，你注意到每个窗口办理的业务类型都不一样。',choices:[
    {text:'认真观察',effects:{wisdom:6,glory:2},result:'你仔细记下了各个窗口的功能和办理时间。以后办事就知道该去哪了。'},
    {text:'直接离开',effects:{happiness:4,wisdom:-2},result:'你觉得以后需要的时候再来问就行。'}
  ]}
]
};

// ===== 合唱模板 =====
var CHORUS={
  title:'晚间统一合唱活动',tag:'晚间固定',type:'evening',
  text:'每日晚间开展班级合唱排练，为闭幕式汇演做准备。你如何选择？',
  choices:[
    {text:'准时参加合唱排练',effects:{happiness:-5,singing:8},result:'你准时到达排练场地，认真跟随指挥练习每一段旋律。虽然辛苦，但歌唱水平在稳步提升。'},
    {text:'请假回宿舍打游戏',effects:{happiness:7},result:'你跟助导请了假，回到宿舍打开游戏。难得的放松时光让你心情大好。'},
    {text:'请假回宿舍自主学习',effects:{wisdom:8},result:'你跟助导请了假，回到宿舍翻开课本。利用这段时间默默提升自己的学业水平。'}
  ]
};

// ===== 晚间宿舍模板 =====
var EVENING_DORM={
  title:'晚间宿舍活动',tag:'晚间固定',type:'evening',
  text:'夜幕降临，你回到宿舍。三位室友各自忙着自己的事情——虎爷在看书，奶扣在打游戏，京爷在研究资料。',
  choices:[
    {text:'和室友游玩',effects:{charm:5,happiness:8},result:'你和室友们一起度过了愉快的晚间时光，宿舍氛围更加融洽。'},
    {text:'独自学习',effects:{wisdom:9},result:'你翻开书本，沉浸在知识的海洋中。利用晚间时间提升自己，感觉很充实。'}
  ]
};

// ==================== 帮助函数 ====================
function makeAutoPhase(title,text,effects,flags){
  var p={type:'auto',tag:'军训基础',title:title,text:text,effects:effects||{}};
  if(flags)p.setFlags=flags;
  return p;
}
function makeMainPhase(tag,title,text,choices){
  return {type:'main',tag:tag,title:title,text:text,choices:choices};
}
function makeEveningPhase(){
  return {type:'evening',tag:'晚间固定',title:CHORUS.title,text:CHORUS.text,choices:CHORUS.choices};
}
function makeDormEvening(){
  return {type:'evening',tag:'晚间固定活动',title:EVENING_DORM.title,text:EVENING_DORM.text,choices:EVENING_DORM.choices};
}
function makeGfEvent(title,text,choice1text,choice1eff,choice1gf,choice1result,choice2text,choice2eff,choice2result){
  return {
    title:title,text:text,
    choices:[
      {text:choice1text,effects:choice1eff||{},gfEffects:choice1gf||{},result:choice1result},
      {text:choice2text,effects:choice2eff||{},result:choice2result}
    ]
  };
}

// ==================== 故事日 9.8-9.29 ====================
var STORY_DAYS={};

// 9.8
STORY_DAYS['2024-09-08']={title:'入学第二天',phases:[
  makeMainPhase('日间主线','新生知识讲座','今天是入学第二天，学院为全体新生组织了一场新生知识讲座，内容涵盖校规校纪、学分制度和校园资源使用指南。\n\n讲座在学术报告厅举行，助导在班级群里发了通知，要求全体新生参加。',[
    {text:'A. 参加讲座',effects:{wisdom:8},result:'你按时到达报告厅，认真听完了整场讲座。讲座内容很实用，你对学校的各项制度有了清晰的认识。'},
    {text:'B. 逃离讲座',effects:{happiness:7,health:5},risk:{chance:0.6,effects:{glory:-4},desc:'被辅导员点名发现，荣耀-4'},result:'你悄悄溜出了报告厅，在校园里自由自在地逛了一下午。不过辅导员在点名时发现有人缺席……'}
  ]),
  {type:'random',tag:'随机事件',pool:'sep8'},
  makeDormEvening()
]};
// 9.9
STORY_DAYS['2024-09-09']={title:'全天自由活动日',phases:[{type:'random',tag:'随机事件',pool:'sep9'}],noEvening:true};
// 9.10
STORY_DAYS['2024-09-10']={title:'自由活动日+团校报名',phases:[
  {type:'random',tag:'随机事件',pool:'sep10'},
  makeMainPhase('当日主线','团校报名选择','班级群里发来通知：东秦大学团校新一期学员开始报名。团校是培养优秀学生骨干的重要平台。\n\n报名截止时间为今晚12点，录取结果将于明天统一公示。',[
    {text:'是：报名团校',effects:{},flags:{tuanxiaoApplied:true},result:'你郑重地填写了团校报名表并提交。'},
    {text:'否：放弃报名',effects:{},result:'你决定不报名团校。'}
  ])
]};
// 9.11
STORY_DAYS['2024-09-11']={title:'清晨体检+团校结果+开学第一课',phases:[
  makeAutoPhase('固定剧情','清晨集体体检','凌晨5点，天还没亮，全体新生在鹏远公寓假山前集合，统一乘车前往南校区进行入学体检。\n\n虽然起得太早让人有些烦躁，但体检过程很顺利，各项指标正常。',{happiness:-5,health:5}),
  {type:'conditional',tag:'概率判定',title:'团校报名结果公示',condFlag:'tuanxiaoApplied',
   text_applied:'团校录取结果在公告栏和班级群同步公示。你紧张地滑动手机屏幕寻找自己的名字……',
   text_not:'团校录取结果在公告栏公示了。你因为没有报名，对此并不关心。',
   prob:0.2,sText:'恭喜！你在众多报名者中脱颖而出，被团校正式录取！\n\n通知中注明：团校学员需在十月的连续4个教学周末参加集训，完成全部集训后悟性将获得大幅提升（+100）。\n\n⚠️ 注意：集训期间周末随机事件全部关闭。',
   sEffects:{},sHidden:'⚠️ 10月起连续4个周末禁闭 · 完成后悟性+100',sFlags:{tuanxiaoAccepted:true,tuanxiaoWeekBan:4,tuanxiaoWisdomPending:true},
   fText:'很遗憾，你在团校录取中落选了。\n\n不过这也意味着你的周末时间完全自由。',fEffects:{}},
  makeMainPhase('主线剧情','史鉴明老师开学第一课','上午10点，史鉴明老师走进教室，为新生带来开学第一课。\n\n史老师讲课深入浅出，将枯燥的理论讲得生动有趣。课后，史老师拿出三样小礼品——U盘、水杯、钢笔，告诉同学们可以任选其一作为开学纪念。',[
    {text:'A. U盘',effects:{wisdom:5},result:'你选择了U盘。史老师笑着说："存知识，也存回忆。"'},
    {text:'B. 水杯',effects:{health:5},result:'你选择了水杯。史老师点点头："多喝水，保持健康。"'},
    {text:'C. 钢笔',effects:{happiness:5},result:'你选择了钢笔。握着这支钢笔，你感到一种莫名的仪式感和满足。'}
  ])
]};
// 9.12
STORY_DAYS['2024-09-12']={title:'参观双创基地+下午自由活动',phases:[
  makeMainPhase('主线剧情','参观大学生创新创业基地','学院组织全体新生参观东秦大学大学生创新创业基地。\n\n基地里陈列着历年学生的科创获奖作品——智能机器人、环保新材料、互联网+获奖项目……令人目不暇接。\n\n参观结束后，工作人员展示了一个微信群二维码："这是大创交流群，感兴趣的同学可以加一下，韩鹏老师也在群里。"',[
    {text:'添加大创群聊',effects:{wisdom:-20},hidden:{desc:'解锁科创系统，韩鹏老师好感度+10，教师好感度面板中韩鹏已解锁',flags:{dachuangJoined:true,keChuangUnlocked:true,hanpengUnlocked:true},effects:{hanpengHaoGan:10}},result:'你扫码加入了群聊。群里消息瞬间99+，各种竞赛通知、项目招募铺天盖地。'},
    {text:'不添加群聊',effects:{},result:'你决定暂时不加群。科创竞赛的事以后再说。'}
  ]),
  {type:'random',tag:'下午随机事件',pool:'sep12'}
]};
// 9.13
STORY_DAYS['2024-09-13']={title:'洗脑讲座+四六级报名+晚间活动',phases:[
  makeMainPhase('日间主线','校方教育讲座','学校组织了一场关于大学生理想信念教育的讲座，全体新生必须参加。',[
    {text:'A. 参加讲座',effects:{wisdom:8},result:'你认真听完了整场讲座。确实让你对大学的意义有了更多思考。'},
    {text:'B. 逃离讲座',effects:{happiness:7,health:5},risk:{chance:0.6,effects:{glory:-4},desc:'被巡查老师发现，荣耀-4'},result:'你趁人多悄悄溜了出去。自由的感觉真好，但你注意到有位老师在远处看了你一眼……'}
  ]),
  makeMainPhase('日间主线','英语四六级考试报名','班级群里发来通知：2024年下半年全国大学生英语四六级考试开始报名。报名费30元。',[
    {text:'报名（金钱-30）',effects:{money:-30},flags:{cet4Applied:true},result:'你缴纳了30元报名费，成功报名了英语四级考试。'},
    {text:'不报名',effects:{},result:'你决定这次先不报名。可以等下次再考。'}
  ]),
  makeDormEvening()
]};
// 9.14
STORY_DAYS['2024-09-14']={title:'参观一站式服务中心+社团解锁+宿舍改造',phases:[
  makeAutoPhase('主线剧情','参观一站式服务社区','学院组织全体新生参观学校一站式学生服务中心。推开玻璃大门，宽敞明亮的大厅映入眼帘——左手边是教务窗口，几个学长正在咨询选课问题；右手边是学工窗口，辅导员们在新生资料前忙碌；正前方是后勤服务区，校园卡充值、宿舍报修、水电缴费一字排开。\n\n你随队伍缓步走过一个个窗口，耳边是此起彼伏的叫号声和键盘敲击声。空气中飘着淡淡的咖啡香——大厅角落里有一台自助咖啡机，几个高年级学生正端着纸杯低声交谈。\n\n走到宣传区时，你的目光被一面巨大的社团海报墙吸引住了。色彩斑斓的海报几乎铺满了整面墙——体育社团的运动掠影、学院组织的活动剪影、图书管理员的静谧阅览室、文艺部的舞台聚光灯……每一张海报都讲述着不同的青春故事。\n\n你驻足良久，心中开始勾勒属于自己的大学生活蓝图。\n\n🎭 社团系统已永久解锁！\n📅 社团报名截止日期：2024年9月25日\n📋 可选社团：体育社团、学院组织、图书管理员、文艺部',{},{sheTuanUnlocked:true}),
  {type:'random',tag:'下午随机事件',pool:'sep14'},
  makeMainPhase('宿舍改造','宿舍改造·购买书桌','回到宿舍后，你发现宿舍里只有公共的桌子。学长在群里发了一个链接：有毕业生在出售二手电脑桌，九成新，只要90元。',[
    {text:'购买书桌（金钱-90）',effects:{money:-90},flags:{deskBought:true},hidden:{desc:'解锁电脑永久使用权限'},result:'你花了90元买下了这张书桌。从此在宿舍也有了属于自己的学习空间。'},
    {text:'不购买书桌',effects:{},result:'你决定暂时不买。公共桌子虽然不太方便，但也能凑合用。'}
  ])
]};

// ===== 9.15 军训第一天(中秋) =====
STORY_DAYS['2024-09-15']={title:'军训第一天·中秋节',phases:[
  makeAutoPhase('军训基础','军训第一天','清晨6:30，刺耳的起床哨划破了宿舍楼的宁静。你揉着惺忪的睡眼套上迷彩服，和室友们一起朝着东操场小跑而去。操场上已经集合了数百名新生，黑压压一片迷彩绿在晨光中晃动。\n\n教官身材挺拔、面容严肃，一口洪亮的东北口音让口令格外有穿透力。"全体都有——立正！"你下意识地挺直了腰板。\n\n今天恰逢中秋佳节，太阳依旧毒辣，汗水沿着额头滑落，浸湿了衣领。但教官在中场休息时难得地露出笑容，说了一句"中秋节快乐"，让整个连队的气氛一下子柔软了许多。你抬头看了看蓝天白云，心想——中秋在军训中度过，也许别有一番味道。\n\n（健康+12，幸福-10）',{health:12,happiness:-10}),
  makeMainPhase('请假选项','请假选择','你是否花费荣耀找李心瑶老师请假躲避今日军训？',[
    {text:'是：荣耀-15，幸福+12（不获得军训健康加成）',effects:{glory:-15,happiness:12,health:-12},result:'李心瑶老师批准了你的请假。你躲在宿舍里享受了一天的清闲，虽然避开了烈日，但也错过了和同学们一起过中秋的机会。'},
    {text:'否：正常参与全天军训',effects:{},result:'你决定不请假，和同学们一起完成军训。虽然辛苦，但这是大学生活的一部分。'}
  ]),
  makeMainPhase('下午剧情','中秋晚会合唱负责人选举','中秋当日下午无军训，班级QQ群开启中秋晚会合唱负责人公开选举，你是否报名参选？\n\n（判定标准：魅力+荣耀总值）',[
    {text:'是：报名参选',cond:true,condAttr:'charmPlusGlory',condTh:180,sEffects:{glory:12},sText:'凭借出色的魅力和荣耀积累，你成功当选中秋晚会合唱负责人！荣耀值+12。',fEffects:{charm:-6},fText:'你的魅力和荣耀总值不足，竞选失败。自信心小幅受挫，魅力-6。'},
    {text:'否：不报名参选',effects:{},result:'你选择不参选，安静地做一个参与者也不错。'}
  ]),
  makeMainPhase('晚间活动','中秋月圆之夜','忙碌一天结束，恰逢中秋月圆之夜，你今晚打算如何度过？',[
    {text:'和室友一起前往海边散步赏月、外出聚餐',effects:{happiness:10,health:6,money:-65},result:'你们一行四人去了学校附近的海边，吹着海风吃着月饼，看着圆月倒映在海面上。这是你在大学度过的第一个中秋，虽然远离家乡，但有朋友相伴，心里暖暖的。'},
    {text:'留在宿舍躺平打游戏放松',effects:{happiness:9},result:'你躺在宿舍床上打了一晚上游戏，放松了紧绷了一天的神经。简单的快乐，未尝不可。'},
    {text:'留在宿舍安静自习学习',effects:{wisdom:10},result:'你翻开课本，趁着中秋夜的安静氛围认真学习。月亮透过窗户洒在书页上，学习效率意外地高。'}
  ])
]};

// ===== 通用军训日生成函数 =====
function makeTrainingDay(key,title,autoTitle,autoText,evt1title,evt1text,evt1choices,evt2title,evt2text,evt2choices,gfEvt){
  var phases=[
    makeAutoPhase('军训基础',autoTitle,autoText,{health:10,happiness:-8}),
    makeMainPhase('随机事件①',evt1title,evt1text,evt1choices),
    makeMainPhase('随机事件②',evt2title,evt2text,evt2choices),
    makeEveningPhase()
  ];
  var day={title:title,phases:phases};
  if(gfEvt)day.gfEvent=gfEvt;
  STORY_DAYS[key]=day;
}

// 9.16
makeTrainingDay('2024-09-16','军训第二天','日间固定军训','第二天的起床哨响起时，你发现自己比昨天快了半分钟——身体已经开始适应这个节奏了。晨光中，操场上回荡着整齐的脚步声和各连此起彼伏的口号。\n\n教官今天主训队列基础：立正、稍息、跨立、停止间转法。每一个看似简单的动作都要重复无数遍，直到肌肉形成记忆。汗水顺着脊背流下，迷彩服的后背已经湿透了一大片。\n\n（健康+10，幸福-8）',
  '烈日补水','正午烈日高悬，长时间站军姿让你口干舌燥、浑身燥热，你可以举手向教官申请短暂休息补水。',[
    {text:'举手申请休息补水',effects:{health:5,glory:-3},result:'你举手向教官申请休息。教官看了你一眼，点头同意了。虽然补充了水分，但在全排面前显得不够坚韧。'},
    {text:'咬牙坚持全程训练不休息',effects:{wisdom:4,glory:2,health:-2},result:'你咬紧牙关，全程没有申请休息。教官注意到你的坚持，在总结时点名表扬了你。'}
  ],
  '拉歌对抗赛','军训休息间隙，连队之间开展拉歌对抗赛，全场氛围热烈，需要同学主动起身领唱带动氛围。',[
    {text:'主动起身领唱带动班级氛围',effects:{singing:5,charm:6,happiness:-3},result:'你鼓起勇气站了起来，用嘹亮的歌声带领全班一起唱。虽然有些紧张，但全场气氛被推向了高潮！'},
    {text:'跟随集体一起合唱，不主动出头',effects:{singing:2},result:'你跟着大家的节奏一起唱，虽然不出彩，但也不出错。轻松无压力。'}
  ]
);

// 9.17
makeTrainingDay('2024-09-17','军训第三天','日间固定军训','第三天清晨，你发现自己已经不需要闹钟了——生物钟自动调到了军训模式。走出宿舍楼，清晨的凉风拂过脸颊，是九月里难得的舒适时刻。\n\n今天的训练重点是齐步走的步伐统一。教官吹着哨子，一排一排地纠正摆臂高度和步幅大小。"前后对正，左右标齐！"你在队列中努力调整着自己的节奏，试图和身边的同学踩在同一个拍子上。\n\n（健康+10，幸福-8）',
  '方阵标兵竞选','教官开始挑选身姿挺拔、动作标准的同学担任方阵前排标兵，前排标兵会被全校师生看到，训练强度也会更大。',[
    {text:'主动报名竞选军训标兵',effects:{glory:7,charm:4,health:-4},result:'你主动迈出一步报名竞选。凭借标准的动作和挺拔的身姿，你成功入选前排标兵！虽然训练量加倍，但你将成为全校师生目光的焦点。'},
    {text:'安稳留在队伍后排，不参与竞选',effects:{},result:'你选择留在后排。虽然少了曝光机会，但训练压力也小了很多。'}
  ],
  '帮忙整理内务','室友内务能力较差，叠出来的军被始终达不到豆腐块标准，眼看内务检查临近，室友请求你帮忙整理被子。',[
    {text:'热心帮忙室友整理内务',effects:{charm:3,happiness:2,wisdom:-3},result:'你花了半小时帮室友把被子叠成了标准的豆腐块。室友连声道谢，但你自己少了一些休息时间。'},
    {text:'委婉拒绝，专注自己休息',effects:{},result:'你表示自己也需要休息，室友有些失望但表示理解。'}
  ]
);

// 9.18
makeTrainingDay('2024-09-18','军训第四天','日间固定军训','第四天的太阳像发了狠似的，才上午九点地面就已经滚烫。操场边缘的几棵小树投下的阴影成了全连最奢侈的休息区。\n\n你已经连续四天高强度训练，小腿隐隐发酸，脚底磨出了薄薄的茧子。身边的同学们脸上也都写满了疲惫——有人偷偷揉腰，有人在喝水间隙长出一口气。但没有人退缩。教官说这是"疲劳期"，撑过去就好了。\n\n（健康+10，幸福-8）',
  '身体不适','长时间保持立正姿势，你体力不支，出现头晕、眼前发黑的轻微不适症状。',[
    {text:'原地蹲下短暂休整恢复体力',effects:{health:6,glory:-2},result:'你果断蹲下休息了几分钟，喝了口水。身体症状很快缓解，但教官在训练记录上标注了"体能待加强"。'},
    {text:'强忍身体不适，坚持完成训练',effects:{glory:3,health:-3},result:'你咬紧牙关坚持到了最后。教官注意到你脸色发白却没有倒下，对你竖起了大拇指。不过身体确实透支了不少。'}
  ],
  '班级破冰游戏','休息期间班委组织班级破冰小游戏，帮助新生之间互相熟悉，拉近同学关系。',[
    {text:'积极参与集体小游戏',effects:{charm:5,happiness:4,wisdom:-2},result:'你全身心投入到游戏中，和同学们笑成一团。大家对你的印象分大大提升，不过欢乐的时光总是飞快。'},
    {text:'坐在一旁闭目休息，旁观即可',effects:{health:3},result:'你选择坐在一旁闭目养神。看着大家玩得开心也是一种享受，而且恢复了体力。'}
  ]
);

// 9.19
makeTrainingDay('2024-09-19','军训第五天','日间固定军训','第五天，正步走训练正式开始。教官把动作拆解成了四个步骤——抬腿、绷脚、定位、落地，每一步都要悬在空中保持三秒。"一！"你的右腿悬在半空，大腿肌肉微微颤抖；"二！"脚背绷直，汗珠从额头滚落。\n\n这是最考验核心力量的训练科目。练了一上午，你的腹肌和大腿都在抗议。但当全班整齐划一地踢出正步时，那"啪"的一声齐响，让你觉得一切都值了。\n\n（健康+10，幸福-8）',
  '宿舍内务大检查','学校开展宿舍突击内务大检查，严查床铺、地面、桌面卫生，不合格宿舍会被全院通报批评。',[
    {text:'认真打扫宿舍每一处卫生',effects:{glory:5,wisdom:2,happiness:-4},result:'你花了一个多小时把宿舍的每个角落都擦得干干净净。检查顺利通过，室友们对你感激不尽。'},
    {text:'简单打扫敷衍应付检查',effects:{},result:'你简单扫了扫地面，擦了擦桌面。好在检查老师没有太仔细，勉强过关。'}
  ],
  '助导巡查','本班助导来到操场巡查全体新生军训状态，观察每位同学的参训态度与精神面貌。',[
    {text:'身姿端正认真参训，主动上前问好',effects:{glory:4,charm:3},result:'你保持标准的军姿，在休息时主动向助导问好。助导对你印象深刻，在班级日志上写了你的名字。'},
    {text:'正常参训，不刻意上前打招呼',effects:{},result:'你按部就班地完成训练，不想刻意表现。助导巡查了一圈就离开了。'}
  ]
);

// 9.20
makeTrainingDay('2024-09-20','军训第六天','日间固定军训','军训第六天，为期两周的军训即将过半。你对着手机前置摄像头看了一眼自己——脸和脖子已经不是一个色号了，手臂上也晒出了一条清晰的袖口分界线。这大概是军训最真实的"勋章"。\n\n但变化远不止肤色。你的站姿比一周前挺拔了许多，走路时下意识地挺胸收腹，连室友都说你"看起来精神了"。教官在训练间隙难得夸了一句"有点样子了"，全排都嘿嘿笑了起来。\n\n（健康+10，幸福-8）',
  '军训感悟征文','班委面向全班征集军训感悟短文，优质稿件将会刊登在校官方公众号，获得公开表彰。',[
    {text:'认真撰写走心感悟并按时上交',effects:{wisdom:6,glory:4,happiness:-3},result:'你花了一个晚上认真写了一篇800字的军训感悟，字字真情。第二天得知你的文章被选中了！'},
    {text:'敷衍上交或者直接不参与征集',effects:{},result:'你随便写了两句话交上去，或者干脆没交。省下来的时间做了别的事。'}
  ],
  '借用防晒霜','同行同学忘记携带防晒霜，连日暴晒皮肤已经严重晒伤，开口向你借用防晒用品。',[
    {text:'大方出借自己的防晒用品',effects:{charm:4,happiness:3,health:-2},result:'你毫不犹豫地借出了自己的防晒霜。同学非常感激，但你自己的防晒霜用得更快了。'},
    {text:'借口自身用量不足，拒绝对方请求',effects:{},result:'你委婉表示自己的防晒霜也快用完了。对方有些失望地走开了。'}
  ]
);

// 9.21 - 关键节点：恋爱解锁
STORY_DAYS['2024-09-21']={title:'军训第七天·关键节点',phases:[
  makeAutoPhase('军训基础','日间固定军训','军训第七天，一周的汗水没有白流。你的站姿笔直如松，正步踢得干净利落，连最难熬的站军姿也变得轻松了许多。\n\n更重要的是——你发现自己的意志力变强了。以前觉得做不到的事情，现在咬咬牙就扛过去了。教官说这就是军训的意义所在：不是为了折磨你们，而是为了让你们知道自己比想象中更强大。\n\n不过今天的气氛有些微妙——你注意到班里有个女生似乎总在休息时偷偷看你。\n\n（健康+10，幸福-8）',{health:10,happiness:-8}),
  makeMainPhase('随机事件①','教官单独指导','教官发现你队列动作存在细微瑕疵，特意留下你一人，单独手把手纠正动作细节。',[
    {text:'认真听从指导，反复练习打磨动作',effects:{glory:5,wisdom:3,happiness:-4},result:'你虚心接受教官的指导，一遍又一遍地练习，直到动作完美。教官满意地点了点头，在训练手册上给你加了分。'},
    {text:'快速改正动作，想要尽快结束训练休息',effects:{glory:2},result:'你快速调整了动作，教官检查后放你离开了。虽然节省了时间，但动作的细节没有打磨到最好。'}
  ]),
  makeMainPhase('随机事件②','小型才艺表演','休息时段班级自发举办小型才艺表演，缓解连日军训的疲惫，活跃现场氛围。',[
    {text:'主动上台进行才艺展示',effects:{charm:9,singing:3,happiness:-2},result:'你大方地上台展示了自己的才艺。歌声/表演引来阵阵掌声和欢呼，不少同学拿出手机录像。你在班级里的人气直线上升！'},
    {text:'安静坐在台下，观看他人表演',effects:{},result:'你坐在台下欣赏同学们的表演。有人唱歌、有人说相声，现场笑声不断。做一个观众也很惬意。'}
  ]),
  {type:'conditional',tag:'强制判定',title:'恋爱系统解锁判定',condCustom:function(){return GS.charm>130;},
   text_applied:'经过多日军训相处，你的外在气质和言行举止被班里一位女生悄悄关注。\n\n休息时间，一名同班女生红着脸走向你，羞涩地想要添加你的QQ联系方式。\n\n她叫苏小暖，扎着马尾辫，笑起来有两个浅浅的酒窝。',
   text_not:'经过多日军训相处，你在班里默默无闻。今天没有特别的社交事件发生。',
   isSpecial:true,specialType:'loveUnlock',
   sText:'你微笑着掏出手机，扫了她的二维码。苏小暖开心地笑了，说"以后可以一起上自习呀"。\n\n💕 恋爱系统已解锁！\n👤 女友：苏小暖\n❤️ 初始好感度：80\n📌 主页新增好感面板，每日固定-1好感\n⚠️ 好感低于30将触发分手风险',
   sHidden:'💕 恋爱系统解锁：每月被动魅力+20',sFlags:{gfUnlocked:true,gfName:'苏小暖',gfFavor:80},
   fText:'你委婉表示现在想专心军训，暂时不方便加好友。苏小暖有些失落地离开了。',
   fEffects:{charm:-5}},
  makeEveningPhase()
]};

// 9.22
makeTrainingDay('2024-09-22','军训第八天','日间固定军训','进入军训第二周，你发现一切变得不一样了。早起已经不需要挣扎，穿上迷彩服的动作行云流水，集合时第一个到达操场的人里总有你。\n\n身体已经完全适应了训练强度——小腿不再酸痛，呼吸不再急促，站军姿半小时也能纹丝不动。你甚至开始享受这种规律而充实的生活：每一个动作都有标准，每一天都在进步。\n\n（健康+10，幸福-8）',
  '冰镇饮料','操场门口小卖部售卖冰镇饮料、冰水，能够快速缓解军训带来的燥热疲惫。',[
    {text:'花钱购买冰水降温解暑',effects:{money:-25,health:7,happiness:5},result:'你买了一瓶冰镇矿泉水，冰凉的水流入喉咙，浑身舒畅！训练的疲惫一扫而空。'},
    {text:'忍住燥热，不花钱购买饮品',effects:{},result:'你忍住了消费冲动。虽然又热又渴，但省下了一笔钱。'}
  ],
  '帮忙拍摄照片','班委需要同学帮忙拍摄班级军训日常照片，留存班级军训纪念素材。',[
    {text:'主动帮忙来回走动拍摄照片',effects:{charm:4,glory:3,health:-3},result:'你拿着手机在操场上来回跑动，从不同角度抓拍了同学们训练的身影。班委对你的热心表示感谢。'},
    {text:'留在原地休息，拒绝帮忙拍照',effects:{},result:'你表示自己需要休息。班委找了其他同学帮忙。'}
  ],
  makeGfEvent('女友每日事件','女友军训一天身心疲惫，想要你陪她聊天开导心情。',
    '耐心陪伴聊天安慰',{money:-18},{gfFavor:6},'你耐心地听她倾诉了一天的烦恼，温柔地开导她。苏小暖的心情明显好转，发了一个可爱的表情包给你。',
    '借口疲惫拒绝陪伴',{happiness:-7},'你自己也很累，便找借口推掉了。苏小暖回复了一个"好吧"，你感觉心里有些愧疚。')
);

// 9.23
makeTrainingDay('2024-09-23','军训第九天','日间固定军训','分列式训练进入关键阶段！今天上午，所有连队第一次合在一起彩排闭幕式的完整流程。操场上的气氛明显紧张了起来——毕竟闭幕式那天，校长和全体师生都在主席台上看着。\n\n你的方阵排在第四个出场。从入场到整队到正步通过主席台，整套流程走下来要七八分钟。第一次彩排出了不少差错——有人抢拍、有人掉队、有人正步踢得歪歪扭扭。教官虽然皱着眉，但只是说"再来一遍"。\n\n（健康+10，幸福-8）',
  '分列式加练','分列式彩排正式开始，动作不标准的同学需要留在操场单独加练队列。',[
    {text:'主动留下来加练，完善自身动作',effects:{glory:6,wisdom:2,happiness:-5},result:'你主动留了下来，在教官的指导下反复练习。虽然比其他人晚了一个小时才吃上饭，但你的动作已经无可挑剔。'},
    {text:'跟随大部队准时结束训练离场',effects:{},result:'你的动作勉强过关，跟随大部队一起解散了。虽然轻松，但总觉得自己还可以做得更好。'}
  ],
  '闲聊大学规划','休息间隙，身边同学和你闲聊大学四年规划、选课学习、竞赛备考相关内容。',[
    {text:'主动交流，互换大学学习心得',effects:{wisdom:5,charm:3},result:'你们聊得很投机，交换了不少有用的信息。对方分享了一个超好用的学习资源网站，你也分享了自己的选课心得。'},
    {text:'闭目养神，不想参与闲聊',effects:{health:4},result:'你闭上眼睛靠在背包上休息。保存体力也是一种明智的选择。'}
  ],
  makeGfEvent('女友每日事件','女友想要和你一起拍军训合照留作纪念。',
    '花钱冲洗双人合照',{money:-26},{gfFavor:7},'你们在操场边拍了一张合照，你花了26元冲洗了两份。一人一张放在钱包里，苏小暖开心得眼睛眯成了月牙。',
    '拒绝拍照',{happiness:-6},'你推脱说今天太累了改天再拍。苏小暖收起了手机，默默走开了。')
);

// 9.24
STORY_DAYS['2024-09-24']={title:'军训第十天·社团报名',phases:[
  makeAutoPhase('军训基础','日间固定军训','军训第十天。现在的方阵和十天前简直判若两队——步伐整齐划一，口号震天响，连最难统一的正步节奏都磨合得天衣无缝。教官站在队列前，嘴角难得地微微上扬："这才像个样子。"\n\n但今天也是社团报名的最后一天。训练间隙，你不时看到有同学偷偷掏出手机查看社团信息。社团是大学生活的重要组成部分——错过了报名，就只能等下个学期了。\n\n（健康+10，幸福-8）',{health:10,happiness:-8}),
  makeMainPhase('随机事件①','军训慰问物资','学院为全体参训新生发放牛奶、面包等军训慰问物资，补充体能。',[
    {text:'正常领取属于自己的慰问物资',effects:{happiness:5,health:3},result:'你领到了牛奶和面包。一口牛奶一口面包，训练后的疲惫瞬间被治愈了。'},
    {text:'将物资让给身体不适的同学',effects:{charm:5,glory:4,happiness:-2},result:'你将物资让给了旁边脸色发白的一位同学。对方感激得差点哭出来，周围同学纷纷投来敬佩的目光。'}
  ]),
  makeMainPhase('随机事件②','口号比拼','全校各班开展军训口号比拼，比拼口号音量、气势与整齐度。',[
    {text:'用尽全身力气大声喊口号',effects:{singing:4,glory:3,health:-2},result:'你铆足了劲喊出最响亮的口号，嗓子都快冒烟了。你们班获得了全连第二名的好成绩！'},
    {text:'跟随队伍正常喊口号即可',effects:{},result:'你按正常音量喊了口号。不算出彩但也不拖后腿，安稳通过。'}
  ]),
  makeMainPhase('强制剧情','社团最终报名（今日截止，选定不可更改）','⚠️ 社团报名截止日期为今日！请从以下四个社团中选择一个报名，也可放弃报名。所有社团统一在9月29日晚间面试。\n\n1. 体育社团（面试考核：健康+魅力）\n2. 学院组织（面试考核：荣耀+悟性）\n3. 图书管理员（面试考核：悟性+幸福）\n4. 文艺部（面试考核：魅力+歌唱能力）\n5. 放弃所有社团报名',[
    {text:'1. 体育社团',effects:{},flags:{clubApplied:true,clubType:'体育社团'},result:'你正式报名了体育社团。面试将在9月29日晚间进行，考核项目：健康+魅力。'},
    {text:'2. 学院组织',effects:{},flags:{clubApplied:true,clubType:'学院组织'},result:'你正式报名了学院组织。面试将在9月29日晚间进行，考核项目：荣耀+悟性。'},
    {text:'3. 图书管理员',effects:{},flags:{clubApplied:true,clubType:'图书管理员'},result:'你正式报名了图书管理员。面试将在9月29日晚间进行，考核项目：悟性+幸福。'},
    {text:'4. 文艺部',effects:{},flags:{clubApplied:true,clubType:'文艺部'},result:'你正式报名了文艺部。面试将在9月29日晚间进行，考核项目：魅力+歌唱能力。'},
    {text:'5. 放弃所有社团报名',effects:{},flags:{clubApplied:false,clubType:''},result:'你选择不报名任何社团。大学不止社团一条路，你有自己的规划。'}
  ]),
  makeEveningPhase()
]};
STORY_DAYS['2024-09-24'].gfEvent=makeGfEvent('女友每日事件','女友军训晒伤，皮肤泛红刺痛，需要修护护肤品。',
  '花钱购买芦荟胶修护',{money:-30},{gfFavor:8},'你去学校超市买了一支芦荟胶送给她。苏小暖接过芦荟胶，感动得眼眶泛红，说你是最贴心的人。',
  '拒绝帮忙',{happiness:-7},'你表示晒伤过几天自己就好了。苏小暖沉默了一会儿，说了句"没事"就没有再提了。');

// 9.25
makeTrainingDay('2024-09-25','军训第十一天','日间固定军训','倒数第四天。也许是看出了大家的疲惫，教官今天的训练强度明显降低了——站军姿从半小时缩短到十五分钟，正步走练了三遍就让休息。\n\n更多的时间被分配给了闭幕式彩排。你站在方阵中，看着操场上各连队来来往往地走位、定点、合练，恍惚间意识到——这段每天流汗、喊口号、踢正步的日子，真的要结束了。\n\n（健康+10，幸福-8）',
  '清洗迷彩服','连日军训让迷彩服沾满汗水灰尘，衣服异味很重，你打算什么时候清洗衣物？',[
    {text:'晚上熬夜抽空清洗全套迷彩服',effects:{happiness:4,wisdom:-4},result:'你熬夜把迷彩服洗得干干净净。虽然牺牲了睡眠时间，但穿着清爽的衣服训练确实舒服多了。'},
    {text:'积攒衣物，等到休息日再统一清洗',effects:{},result:'你把脏衣服堆在一起，打算休息日再处理。虽然衣服有些味道，但忍一忍就过去了。'}
  ],
  '教官分享军旅经历','教官利用休息时间，分享自己真实的军旅经历和成长感悟，传授自律与坚持的意义。',[
    {text:'认真聆听教官分享，有所感悟',effects:{wisdom:7,glory:2},result:'教官的故事真挚感人。你第一次真正理解了军训的意义——不仅是体能的锻炼，更是意志的磨炼。'},
    {text:'低头玩手机，无心倾听分享',effects:{happiness:3,wisdom:-3},result:'你低头刷着手机，错过了教官精彩的分享。虽然短暂地放松了一下，但和周围认真听讲的同学形成了反差。'}
  ],
  makeGfEvent('女友每日事件','女友觉得食堂军训餐食口味太差，想要加餐。',
    '花钱点外卖加餐',{money:-42},{gfFavor:10},'你花42元点了一份丰盛的外卖。看着苏小暖吃得津津有味，你觉得这钱花得太值了。',
    '拒绝加餐',{happiness:-8},'你表示食堂的饭菜已经很好了。苏小暖有些失落，默默啃完了食堂的饭菜。')
);

// 9.26
makeTrainingDay('2024-09-26','军训第十二天','日间固定军训','军训进入倒计时第三天。操场边的倒计时牌上写着"距闭幕式还有3天"，每次路过都让人心里一紧。\n\n教官今天开始为闭幕式汇演挑选表演人员。除了分列式之外，闭幕式上还有合唱、军体拳、队列操等表演项目。教官在队列前踱步，目光从每个人脸上扫过，偶尔停下来说一句"你，出列"——被选中的人又兴奋又紧张，毕竟这意味着额外的排练。\n\n（健康+10，幸福-8）',
  '闭幕式汇演报名','学校开始筛选闭幕式汇演表演人员，入选后每天需要额外排练，晚会进行公开演出。',[
    {text:'主动报名闭幕式汇演排练',effects:{singing:10,charm:6,happiness:-6},result:'你报名参加了闭幕式汇演！虽然每天要额外排练两小时，但当聚光灯打在身上的那一刻，一切都值得。'},
    {text:'不报名汇演，正常参与日常军训',effects:{},result:'你选择不报名。并非所有人都适合站在聚光灯下，把日常训练做好也是一种选择。'}
  ],
  '搬运物资','班委招募志愿者，帮忙搬运军训横幅、饮用水、表演道具等沉重物资。',[
    {text:'主动报名帮忙搬运物资',effects:{glory:5,charm:3,health:-4},result:'你撸起袖子加入了搬运队伍。虽然汗流浃背，但看到物资整齐地摆放到位，满满的成就感。'},
    {text:'拒绝体力劳动，原地休息',effects:{},result:'你选择原地休息。体力活确实不是每个人都适合干的。'}
  ],
  makeGfEvent('女友每日事件','女友想听你唱歌缓解军训压力。',
    '温柔唱歌安抚对方',{money:-20},{gfFavor:6,singing:2},'你轻声哼唱了一首温柔的歌。苏小暖在电话那头安静地听完了整首歌，说这是她听过的最好听的声音。',
    '拒绝唱歌',{happiness:-6},'你推脱说嗓子不舒服不方便唱。苏小暖有些失望地挂了电话。')
);

// 9.27
makeTrainingDay('2024-09-27','军训第十三天','日间固定军训','倒数第二天，全流程模拟彩排。这一次所有方阵按照正式流程从头到尾走一遍，没有任何中断。\n\n天还没亮你就到了操场。晨雾中，各连队已经在各自的位置上列队完毕。当进行曲响起的那一刻，操场上所有人不约而同地屏住了呼吸——正步的齐响、口号的共鸣、转体的整齐划一，一切都流畅得不可思议。\n\n教官在彩排结束后难得地露出了笑容："明天保持这个状态，没问题。"全排掌声雷动。\n\n（健康+10，幸福-8）',
  '模拟彩排','军训开展闭幕式全流程模拟彩排，教官会针对每一位同学的表现打分记录。',[
    {text:'全神贯注认真完成全部彩排',effects:{glory:8,wisdom:3,happiness:-5},result:'你把这次彩排当作正式演出对待，每一个动作都力求完美。教官给你的评分是A+，在全排名列前茅！'},
    {text:'放松心态敷衍完成彩排流程',effects:{happiness:4,glory:-3},result:'你觉得不过是彩排而已，不用太认真。动作有些随意，教官皱了皱眉但没有说什么。'}
  ],
  '家人来电','远方家人打来电话，关心你近期军训是否辛苦、生活是否适应。',[
    {text:'耐心和家人长时间谈心沟通',effects:{happiness:8,wisdom:-2},result:'你在电话里和妈妈聊了很久，把这段时间的经历都分享了一遍。听到家人的声音，所有的疲惫都化作了温暖。'},
    {text:'简单寒暄后快速挂断电话',effects:{},result:'你简单说了几句就挂了。有些话电话里说不清，你打算等军训结束后再好好聊。'}
  ],
  makeGfEvent('女友每日事件','女友心情低落，想要晚间校园散步散心。',
    '陪同散步并购买小礼品',{money:-22},{gfFavor:6},'你陪她在校园里慢慢走着，路过小卖部时买了一个小发卡送给她。苏小暖惊喜地戴上了发卡，笑容重新回到了脸上。',
    '拒绝陪同散步',{happiness:-7},'你表示今晚合唱排练后太累了。苏小暖回复了"没关系，我自己去吧"，但你总觉得她有些失落。')
);

// 9.28
makeTrainingDay('2024-09-28','军训第十四天','日间固定军训','军训最后一个正式训练日。明天就是闭幕式，空气中弥漫着一种奇特的情绪——紧张、不舍、期待，全都搅在一起。\n\n上午的训练更像是最后的叮嘱：教官让大家把最容易出错的动作又练了三遍，然后集合全排围坐成一圈，第一次用轻松的语气和大家聊天。他讲了自己当年新兵连的故事，讲为什么军训不只是一门课，还讲了他对你们的期望——"好好做人，好好读书，别给咱们排丢脸。"\n\n你坐在地上，膝盖上满是操场上的碎草屑，听着教官的话，心里涌起一股暖流。\n\n（健康+10，幸福-8）',
  '军训优秀个人评选','班级开启军训优秀个人评选，结合日常参训表现、同学投票选出班级军训榜样。',[
    {text:'主动参与军训优秀个人竞选',effects:{charm:5,happiness:-3},result:'你鼓起勇气站上了竞选讲台，简短而有力地向全班同学陈述了自己两周来的努力。不论结果如何，你都已经证明了自己。'},
    {text:'直接放弃竞选，不争荣誉',effects:{},result:'你把机会让给了其他同学。有时候不争不抢也是一种智慧。'}
  ],
  '交流军训感悟','距离军训结束仅剩最后两天，身边同学纷纷感慨军训的辛苦与成长，交流内心感受。',[
    {text:'走心和同学交流军训感悟',effects:{charm:4,happiness:3},result:'你们围坐在一起，分享着两周来的酸甜苦辣。有人说军训这辈子不想再经历，但也不想忘记。大家都笑了，然后都沉默了——因为都懂。'},
    {text:'毫无感触，只想尽快结束军训',effects:{happiness:5,charm:-2},result:'你懒洋洋地表示军训终于要结束了。旁边的同学有些诧异地看着你，觉得你有些冷漠。'}
  ],
  makeGfEvent('女友每日事件','女友想要可爱小挂件当做军训纪念。',
    '花钱购买挂件',{money:-36},{gfFavor:9},'你挑了一个可爱的小兔子挂件送给她。苏小暖开心地把它挂在了书包上，说这是军训最美好的纪念。',
    '拒绝购买',{happiness:-6},'你说军训结束了就是最好的纪念。苏小暖没有反驳，但你看到她收起了期待的表情。')
);

// ===== 9.29 军训最后一天 =====
STORY_DAYS['2024-09-29']={title:'军训最后一天·闭幕式',phases:[
  makeAutoPhase('军训基础','日间固定军训','为期两周的军训，终于走到了最后一天。\n\n清晨6:30，你最后一次以军训学员的身份穿上迷彩服。看着镜中晒黑却精神十足的自己，你几乎认不出这是两周前那个站十分钟军姿就腿软的青涩新生。\n\n操场上，各连队已经列队完毕。阳光洒在迷彩绿上，反射出一片耀眼的光芒。空气中弥漫着一种庄严而神圣的气氛——今天，你们将用两周的汗水为这段青春记忆画上句号。\n\n（健康+10，幸福-8）',{health:10,happiness:-8}),
  makeMainPhase('随机事件①','闭幕式正式汇演','全校举办军训闭幕式最终正式汇演，全体新生上场展示两周军训成果，校方领导现场观看。',[
    {text:'全力以赴，完美完成最终汇演',effects:{glory:10,charm:4,health:-5},result:'你把两周来所有的汗水、坚持和成长都倾注在了最后的正步和口号中。走过主席台的那一刻，你清晰地听到了整齐的脚步声——那是你们共同的节奏。全场掌声雷动！'},
    {text:'正常发挥完成汇演即可',effects:{glory:4},result:'你稳稳地完成了汇演。虽然没有特别出彩的瞬间，但你为自己两周的坚持感到骄傲。'}
  ]),
  makeMainPhase('随机事件②','合影留念','军训彻底落幕，同学们互相拍照留念，记录为期两周的军训时光。',[
    {text:'主动和多位同学合影留念',effects:{charm:6,happiness:5},result:'你热情地和大家合影，留下了许多珍贵的照片。这些照片将成为你大学记忆中最珍贵的一部分。'},
    {text:'只和室友合影，不进行多余社交',effects:{happiness:3},result:'你和三位室友拍了一张四人合照。虽然不是最多照片的人，但和室友的兄弟情谊无需多说。'}
  ]),
  makeEveningPhase(),
  {type:'conditional',tag:'晚间②',title:'社团正式面试',condFlag:'clubApplied',
   text_applied:'晚间合唱结束后，你按照通知前往面试地点。轮到你了，面试官让你做自我介绍并回答专业问题。',
   text_not:'你没有报名任何社团，晚间合唱结束后直接回了宿舍。社团面试与你无关。',
   isSpecial:true,specialType:'clubInterview',
   sText:'面试官对你非常满意！所有问题你都对答如流，展现出了扎实的基础和良好的素养。恭喜通过面试！',sBonus:true,
   fText:'面试官感谢了你的参与，但认为现在的你还需要一些积累。虽然没有通过，但这次面试经历本身就是一种收获。',fEffects:{}}
]};
STORY_DAYS['2024-09-29'].gfEvent=makeGfEvent('女友最后一次军训事件','女友感慨军训结束，不舍这段一起相处的时光。',
  '用心安抚陪伴',{money:-45},{gfFavor:11},'你用心地陪她回忆了两周来的点点滴滴——第一次并肩站军姿、偷偷交换眼神、休息时一起喝水的瞬间……苏小暖靠在你肩上，轻声说这是她人生中最难忘的九月。',
  '敷衍回应',{happiness:-9},'你随口说了几句就回了宿舍。苏小暖站在原地，看着你离开的背影，久久没有离开。');

// 9.30 开学第一课·多系统解锁
STORY_DAYS['2024-09-30']={
  title:'开学第一课·多系统解锁',
  phases:[
    makeMainPhase('上午课程','学术语言交流与沟通（中级）·任课教师：Tania',
      '今天是正式上课第一天。你早早来到教室，发现讲台上站着一位金发碧眼的外教——Tania老师用流利的中文向全班问好。\n\n课堂伊始，Tania要求每位新生依次上台做英文自我介绍，快速互相认识。同学们陆续上台，眼看就要轮到你了……',
      [
        {text:'主动上台进行自我介绍',effects:{charm:-4,wisdom:6},
         flags:{taniaUnlocked:true},
         result:'你大方地走上讲台，用流利的英语介绍了自己的家乡和兴趣爱好。Tania对你微笑点头，在花名册上你的名字旁打了个勾。\n\n📌 系统提示：Tania 教师好感度系统已解锁，可在【教师好感度】面板查看。'},
        {text:'安静坐在座位上，放弃自我介绍',effects:{},
         flags:{taniaUnlocked:true},
         result:'你选择安静地坐在座位上。Tania的目光扫过你，但没有说什么。自我介绍环节在掌声中结束。\n\n📌 系统提示：Tania 教师好感度系统已解锁，可在【教师好感度】面板查看。'}
      ]),
    makeMainPhase('课间休息','第一节课下课·自由安排',
      '第一节课结束，距离下节课还有20分钟课间。你打算如何安排这段自由时间？',
      [
        {text:'返回宿舍补觉休息',effects:{health:7},
         result:'你回到宿舍，一头倒在床上。20分钟的短暂小憩让你恢复了精力，醒来后精神焕发地走向下一间教室。'},
        {text:'回宿舍打开游戏放松',effects:{happiness:8},
         result:'你打开手机游戏打了两局。虽然时间不长，但游戏带来的快乐实实在在地驱散了早起的困意。'},
        {text:'留在教室继续自习',effects:{wisdom:9},
         result:'你没有离开座位，翻开课本继续预习下一节的内容。高效利用了碎片时间，感觉收获满满。'},
        {text:'前往大创中心拜访交流',effects:{},
         cond:true,condFlag:'keChuangUnlocked',condTh:true,
         sEffects:{hanpengHaoGan:5},sText:'你来到大创中心，韩鹏老师正在整理项目材料。看到你来了，他热情地招呼你坐下，聊了聊最近的科创比赛动向。韩鹏老师对你的主动性非常欣赏。',
         fText:'你来到大创中心门口，发现门锁着。看来今天韩鹏老师不在。也许下次再来吧。',
         result:'你来到大创中心门口，发现门锁着。看来今天韩鹏老师不在。也许下次再来吧。'}
      ]),
    makeMainPhase('下午课程①','智能数据分析导论·任课教师：史鉴明',
      '下午第一节课，史鉴明老师走进教室。和开学第一课时的亲切不同，今天的史老师显得格外严肃。\n\n他在黑板上写下一道关于伪代码的思考题，随后开始分发空白纸条："请每位同学在纸条上写下你的答案，写上名字，下课前上交。这是今天的课堂作业。"',
      [
        {text:'按要求认真作答并上交答题纸条',effects:{},
         flags:{shijianmingUnlocked:true},
         result:'你仔细阅读了黑板上的伪代码，经过短暂思考后在纸条上写下了自己的答案。史老师收纸条时对你点了点头。\n\n📌 系统提示：史鉴明 教师好感度系统已解锁。'},
        {text:'没有写纸条，未上交',effects:{},
         flags:{shijianmingUnlocked:true},
         hidden:{desc:'课程预估成绩-10，史鉴明好感度下降',effects:{shijianmingFavor:-5},gEffects:{dataAnalysis:-10}},
         result:'你觉得这道题太难，犹豫了半天还是没有下笔。下课时史老师收走了其他同学的纸条，看了你一眼，眼神中闪过一丝失望。\n\n⚠️ 智能数据分析导论 预估成绩 -10\n⚠️ 史鉴明好感度下降\n📌 系统提示：史鉴明 教师好感度系统已解锁。'}
      ]),
    makeMainPhase('下午课程②','高等数学建模A·任课教师：周蕊',
      '下午第二节课，年轻干练的周蕊老师走进教室。她推了推眼镜，在黑板上写下一道线性代数基础题：\n\n"已知向量 a=(2,1)，向量 b=(1,3)，求两个向量的数量积。"\n\n周蕊老师环顾教室，最终目光落在你身上："这位同学，你来回答一下。"',
      [
        {text:'起身作答：2×1 + 1×3 = 5',effects:{wisdom:5},
         flags:{zhouruiUnlocked:true},
         result:'"2×1 + 1×3 = 2 + 3 = 5。"你清晰地说出答案。周蕊老师满意地点了点头："完全正确。数量积的计算公式掌握得很好。"\n\n📌 系统提示：周蕊 教师好感度系统已解锁。'},
        {text:'起身作答：2×3 + 1×1 = 7',effects:{glory:-2},
         flags:{zhouruiUnlocked:true},
         result:'"7。"你说出了错误的答案。周蕊老师顿了顿："不对。数量积是横坐标乘横坐标加纵坐标乘纵坐标，应该是5。"几位同学偷偷笑了起来，你感到脸上有些发烫。\n\n📌 系统提示：周蕊 教师好感度系统已解锁。'}
      ]),
    makeMainPhase('晚间剧情','班级正式班委选举',
      '晚自习结束后，辅导员走进教室宣布：班级正式班委选举现在开始。本次竞选共有三个核心岗位——班长、团支书、学习委员。\n\n竞选成功者将获得荣耀+50的奖励，且在校期间周末随机事件永久减少一次。\n\n请选择你想要参选的岗位：',
      [
        {text:'参选班长（判定核心：魅力≥150）',cond:true,condAttr:'charm',condTh:150,
         sEffects:{glory:50},sFlags:{wonElection:true,weekendEventReduction:1},
         sHidden:'竞选成功！周末随机事件永久-1',
         sText:'你自信地走上讲台，用富有感染力的演讲阐述了自己的竞选理念。同学们报以热烈的掌声。投票环节结束，你以高票当选班长！荣耀+50。',
         fText:'尽管你努力表达了自己，但魅力和人气还不足以服众。竞选失败，但你从这次经历中学到了很多。'},
        {text:'参选团支书（判定核心：荣耀≥150）',cond:true,condAttr:'glory',condTh:150,
         sEffects:{glory:50},sFlags:{wonElection:true,weekendEventReduction:1},
         sHidden:'竞选成功！周末随机事件永久-1',
         sText:'你以丰富的履历和扎实的工作经验征服了全班同学。投票结果公布，你成功当选团支书！荣耀+50。',
         fText:'你的荣耀积累还不够。竞选失败，但班级同学认可了你的勇气。'},
        {text:'参选学习委员（判定核心：悟性≥150）',cond:true,condAttr:'wisdom',condTh:150,
         sEffects:{glory:50},sFlags:{wonElection:true,weekendEventReduction:1},
         sHidden:'竞选成功！周末随机事件永久-1',
         sText:'你以优异的学术素养和清晰的学业规划赢得了全班同学的信任。成功当选学习委员！荣耀+50。',
         fText:'你的悟性还不足以胜任。竞选失败，但同学们记住了你认真的态度。'},
        {text:'放弃参选，不参与本次班委竞选',effects:{},
         result:'你选择不参选。做一个普通同学也有普通同学的自在。你安静地坐在座位上，为每一位竞选者鼓掌加油。'}
      ])
  ],
  gfEvent:makeGfEvent('女友当选宣传委员',
    '竞选结果公布后，你的女友苏小暖也参加了竞选并成功当上了班级宣传委员！她开心地跑来告诉你这个好消息，脸颊因为激动泛起了红晕。',
    '给她一个大大的拥抱，真心为她高兴',{},{gfFavor:10},
    '你给了她一个大大的拥抱。"我们都要加油啊。"苏小暖笑靥如花，用力点了点头。',
    '淡淡地说"恭喜"，没有过多表示',{happiness:-5},
    '你随口说了句"恭喜"就低头看手机了。苏小暖的笑容僵了一瞬，然后默默走开了。')
};

// ==================== 国庆七天假期 ====================
var HOLIDAY_DAYS={};

HOLIDAY_DAYS['2024-10-01']={
  dayNum:1,isSelection:true,
  bgText:'十月一日举国欢庆，学校东操场举办新生国庆升旗仪式，全体留校师生到场参加，面向国旗行注目礼、齐唱国歌。全校课程、团校活动全面暂停，七天长假正式开启。',
  campusEvents:[
    {title:'国庆红色主题大创项目征集',text:'学校结合国庆节点，开启红色科创专项赛道征集，贴合爱国主题的项目立项通过率更高。',choices:[
      {text:'A. 修改方案适配红色主题立项',effects:{wisdom:10,glory:5,health:-4,hanpengHaoGan:3},result:'你连夜修改项目方案，融入红色科创元素。虽然熬夜改方案很累，但看到焕然一新的项目计划书，成就感满满。'},
      {text:'B. 坚持原有项目方向，不参与专项征集',effects:{},result:'你决定坚持原有项目方向。不参与专项征集意味着少了额外支持，但保持了自己的研究节奏。'}
    ]},
    {title:'大创小组国庆线上团建+项目研讨',text:'小组借着国庆契机开展线上云团建，同时同步对接假期项目进度。',choices:[
      {text:'A. 全程参与团建与研讨',effects:{charm:4,wisdom:6,happiness:-3},result:'你全程参与了线上团建和项目研讨。增进了组员感情，项目进度也顺利推进，但占用了不少休闲时间。'},
      {text:'B. 只参与工作研讨，拒绝闲聊团建',effects:{wisdom:4},result:'你只参与了工作研讨部分，高效同步了项目进度。虽然没有参与闲聊，但项目工作一点没落下。'}
    ]}
  ],
  gfEvents:{
    home:makeGfEvent('异地思念','校园举办国庆升旗仪式，女友独自前往观礼。看着身边皆是结伴同行的同学，她倍感孤单，拍完国旗现场照片发给你，希望你发国庆红包安慰情绪。',
      '转账40元红包并耐心安慰',{money:-40},{gfFavor:10},'你立刻转账了40元红包，并附上大段安慰的话语。女友收到红包和消息后心情好了很多，回复了一连串可爱的表情包。',
      '仅口头安慰，不发红包',{happiness:-3},{},'你只回了句"别难过啦"却没有实际行动。女友看了看手机屏幕上你敷衍的回复，嘴角的笑容慢慢消失。'),
    campus:makeGfEvent('国旗打卡','清晨你们一同参加升旗仪式，结束后女友想在国旗打卡点合影留念，记录国庆首日。',
      '耐心配合拍照、修整图片',{charm:2},{gfFavor:7},'你耐心地帮她找了最佳角度，拍了十几张照片，还帮她修图调色。女友翻看着照片，开心地在朋友圈发了九宫格。',
      '觉得拍照麻烦，拒绝合影',{happiness:-6},{},'你觉得拍来拍去太麻烦，摆摆手说不想拍。女友收起手机，脸上的笑容消失了。'),
    couple:makeGfEvent('海边亲密合影','二人一同前往海边观看国庆升旗仪式，海风拂动红旗氛围感十足，女友希望在国旗旁拥抱合影。',
      '温柔配合亲密合影',{charm:3},{gfFavor:12},'你温柔地揽住她的肩膀，两人在国旗和朝阳的映衬下拍下了甜蜜的合照。海风拂过她的发梢，画面美得像电影海报。',
      '碍于路人目光，委婉拒绝亲密动作',{},{gfFavor:-3},'你觉得周围人太多有些不好意思，轻轻推开了她的手。女友虽然表示理解，但眼中闪过一丝失落。'),
    internship:makeGfEvent('错过升旗','你一早通勤上班错过升旗，女友分享现场画面，希望你下班之后陪她聊天解闷。',
      '承诺下班抽空陪伴聊天',{},{gfFavor:6},'你回复说下班后一定好好陪她。虽然工作很累，但想到有人等着自己，心里也暖暖的。',
      '上班劳累，直接拒绝',{happiness:-5},{},'你说太累了不想聊天。女友看着你冷淡的回复，沉默了很久没有再发消息过来。'),
    dorm:makeGfEvent('错过升旗','你睡懒觉错过升旗仪式，女友发来现场消息，想约你出门逛校园。',
      '起床陪同外出闲逛',{},{gfFavor:5},'你揉了揉眼睛从床上爬起来，陪她在校园里逛了一圈。虽然困意未消，但看到她开心的样子也值了。',
      '赖床不起，拒绝出门',{happiness:-4},{},'你翻了个身继续睡。女友等了半天没等到回复，一个人默默在校园里走了一圈。')
  }
};

HOLIDAY_DAYS['2024-10-02']={
  dayNum:2,
  bgText:'国庆出游迎来客流峰值，秦皇岛各大景区、商圈人潮涌动、道路拥堵。大部分学生已返乡或外出游玩，校园愈发安静。',
  campusEvents:[
    {title:'国庆主题调研问卷发放',text:'小组计划借助景区人流，线下发放国庆相关社会调研问卷。',choices:[
      {text:'A. 前往景区线下发放问卷',effects:{glory:6,charm:5,health:-4},result:'你带上问卷前往景区，在人流中穿行发放。虽然人群拥挤、奔波劳累，但回收了大量有效问卷，数据质量超出预期。'},
      {text:'B. 选择线上发放电子问卷',effects:{wisdom:5},result:'你选择在线上平台发放电子问卷，虽然样本量不如线下丰富，但效率更高、也更省力。'}
    ]},
    {title:'韩鹏老师留校值守·科创答疑',text:'韩鹏老师国庆留校值班，面向留校科创学生提供一对一项目答疑。',choices:[
      {text:'A. 预约线下当面答疑',effects:{hanpengHaoGan:6,wisdom:9,happiness:-4},result:'你预约了韩鹏老师的时间，当面请教了许多项目中遇到的难题。韩老师耐心解答，你收获满满。'},
      {text:'B. 仅线上简单提问',effects:{hanpengHaoGan:2},result:'你在微信上简单提了几个问题。韩老师很快回复了，但很多细节问题没来得及深入讨论。'}
    ]}
  ],
  gfEvents:{
    home:makeGfEvent('异地奶茶','校外景区人山人海，女友刷到朋友圈全是情侣出游动态，触景生情十分想念你，希望你帮忙点奶茶外卖送到宿舍。',
      '下单奶茶外卖',{money:-40},{gfFavor:10},'你立刻下单了她最爱的口味。半小时后外卖送到，女友捧着奶茶发来一张自拍，笑得像朵花。',
      '拒绝帮忙点单，让她自行购买',{happiness:-3},{},'你说"你自己点不就行了"。女友看着消息，默默打开外卖App自己下单了一杯便宜点的。'),
    campus:makeGfEvent('纪念徽章','校外游客太多，二人选择留在校内闲逛。路过校园文创小摊，女友想要一枚国庆纪念徽章。',
      '花钱买下徽章赠予对方',{money:-28},{gfFavor:8},'你掏钱买下了那枚精致的国庆纪念徽章，亲手别在她的衣领上。女友低头看着徽章，笑得眼睛弯弯的。',
      '认为饰品无用，拒绝购买',{happiness:-5},{},'你说"这种小东西买了也是浪费钱"。女友默默放下了手中的徽章，脸上的期待消失了。'),
    couple:makeGfEvent('排队买挂件','商圈内摆满国庆限定周边，女友想要收集全套国庆小挂件。',
      '排队买下全套挂件',{money:-50,charm:2},{gfFavor:15},'你陪她排了将近半小时的队，终于集齐了全套挂件。女友抱着挂件袋子开心得像个孩子，不停比划着要挂在哪里。',
      '不愿长时间排队，只选购一件',{},{gfFavor:5},'你看着长长的队伍皱起了眉头，最终只买了一件。女友虽然有点小失望，但还是把那一件小心地收进了包里。'),
    internship:makeGfEvent('下班接送','女友独自逛商圈，人多嘈杂心生不安，希望你下班之后接她回校。',
      '下班第一时间前往接送',{},{gfFavor:7},'你下班后一刻没耽搁，赶到商圈接上了她。看到她站在人群中的身影，你快步走过去牵起了她的手。',
      '身心疲惫，拒绝前往',{happiness:-6},{},'你说太累了不想再出门。女友在喧闹的人群中独自打车回了学校，一路上沉默不语。'),
    dorm:makeGfEvent('逛街邀约','女友想去校外国庆商圈游玩，邀约你一同出门。',
      '放下游戏陪同逛街',{},{gfFavor:5},'你关掉了游戏，换好衣服陪她出了门。虽然商场人很多，但两个人一起逛吃逛吃还挺开心的。',
      '不愿走动，留在宿舍',{happiness:-5},{},'你说不想出门，头也不回地继续打游戏。女友在宿舍楼下等了十分钟，最后一个人去了商圈。')
  }
};

HOLIDAY_DAYS['2024-10-03']={
  dayNum:3,
  bgText:'假期过半，中秋余温仍在。海边、校园湖畔开启双节主题花灯展，灯火连绵、光影璀璨，节日氛围达到顶峰。',
  campusEvents:[
    {title:'拍摄花灯夜景用作项目宣传素材',text:'夜晚花灯景色优美，适合拍摄实拍素材，丰富大创项目展示内容。',choices:[
      {text:'A. 夜晚外出拍摄素材',effects:{charm:5,wisdom:4,health:-3},result:'你带着相机来到湖边，花灯倒映在水面上，光影交错美不胜收。你拍下了大量高质量素材，项目的宣传材料有了着落。'},
      {text:'B. 仅白天室内拍摄，夜晚不外出',effects:{},result:'你选择白天在室内简单拍了几张。虽然没有花灯夜景的加持，但基本的素材也够用了。'}
    ]},
    {title:'观看国庆科技创新主题纪录片',text:'大创群组转发国家级科创发展纪录片，可供学习行业知识。',choices:[
      {text:'A. 完整观看并记录知识点',effects:{wisdom:11,glory:2},result:'你花了一个多小时认真看完了整部纪录片，做了满满三页笔记。国家科技发展的历程让你对自己的项目有了更深的思考。'},
      {text:'B. 跳过视频刷取娱乐内容',effects:{happiness:4,wisdom:-4},result:'你看了五分钟就关掉了，打开短视频App刷了一晚上。虽然当下很爽，但事后想起觉得自己浪费了不少时间。'}
    ]}
  ],
  gfEvents:{
    home:makeGfEvent('视频通话','女友独自前往海边观看花灯展，看着周围成双成对的游客内心落寞，想要和你长时间视频通话分享夜景。',
      '接通视频全程陪伴',{money:-40},{gfFavor:10},'你接通了视频电话，把手机支在桌前，陪她看了整整两个小时的花灯展。虽然异地相隔，但屏幕里的她笑容灿烂，仿佛你就在身旁。',
      '借口忙碌，简短挂断通话',{happiness:-4},{},'你说"现在有点忙"就匆匆挂断了。女友看着手机屏幕上不到两分钟的通话记录，心里一阵酸涩。'),
    campus:makeGfEvent('花灯长廊','校园湖畔花灯长廊景色迷人，女友邀约你夜晚一同散步赏灯。',
      '欣然陪同漫步赏灯',{health:3},{gfFavor:8},'夜晚的湖畔被花灯点缀得如同梦境。你们并肩漫步在花灯长廊下，五彩的灯光映在她的脸庞上，美得让人心动。',
      '不愿夜间出门，留在宿舍',{happiness:-6},{},'你说晚上不想出门。女友一个人走在花灯长廊下，身旁的位置空落落的，看着别人成双成对，心里很不是滋味。'),
    couple:makeGfEvent('花灯下的牵手','二人共赏海边大型花灯秀，灯火与红旗交相辉映，氛围暧昧，女友主动牵手，希望并肩看完整场演出。',
      '牵手陪伴全程',{charm:5},{gfFavor:16},'你紧紧牵住她的手，十指相扣。海风吹拂、花灯闪烁，你们并肩看完了整场花灯秀。她靠在你肩上，轻声说这是她度过的最浪漫的国庆节。',
      '人群喧闹保持距离，不愿牵手',{},{gfFavor:-2},'你觉得周围人太多，默默把手抽了回去，和她保持着一点距离。女友没有说什么，但整场演出下来，她的目光更多停留在你身上而不是花灯上。'),
    internship:makeGfEvent('下班陪伴','花灯展热闹非凡，女友独自观赏倍感孤单，希望你下班赶来陪伴。',
      '下班后赴约陪伴赏灯',{},{gfFavor:8},'你加班到八点，但还是赶去了湖边。远远看到她独自站在花灯旁的背影，你加快脚步跑了过去。她回头看见你，疲惫的脸上终于绽开了笑容。',
      '疲惫不堪，拒绝外出',{happiness:-7},{},'你说实在走不动了。女友在花灯展的人群中独自拍了张照片，发给你后你很久才回复了一个表情。'),
    dorm:makeGfEvent('花灯分享','女友发来花灯夜景照片，想和你聊天分享感受。',
      '放下游戏认真聊天',{},{gfFavor:4},'你暂时退出了游戏，认真回复她的每一张照片和每一条消息。聊着聊着竟也聊了一个多小时，感觉比打游戏充实多了。',
      '专注游戏，敷衍回复',{happiness:-3},{},'你一边打游戏一边随口回了几个"好看""嗯"。女友看着你越来越短的回复，发消息的频率也越来越低。')
  }
};

HOLIDAY_DAYS['2024-10-04']={
  dayNum:4,
  bgText:'假期进入倦怠阶段，出游疲惫、居家无聊成为常态，校园人流量小幅回升，节日热闹氛围逐步回落。',
  campusEvents:[
    {title:'项目代码出现漏洞',text:'组员分散各地，项目代码突发BUG，无法线下求助。',choices:[
      {text:'A. 独自熬夜排查修复代码',effects:{wisdom:12,happiness:-5},result:'你一个人对着屏幕排查到凌晨三点，终于在无数次的尝试后找到了BUG根源。代码重新跑通的那一刻，疲惫中涌起一阵难以言喻的满足。'},
      {text:'B. 搁置问题，等待开学再处理',effects:{wisdom:-5},result:'你决定暂时搁置。虽然现在轻松了，但问题不会自己消失，开学后还得花时间解决。'}
    ]},
    {title:'申请国庆专属独立实验室',text:'学校开放假期专属独立实验室，环境安静适合攻坚项目。',choices:[
      {text:'A. 提交申请使用专属工位',effects:{hanpengHaoGan:4,wisdom:7,happiness:-3},result:'你填写了申请表，如愿拿到了独立实验室的钥匙。安静的环境让工作效率翻倍，韩鹏老师也对你主动申请的态度表示赞赏。'},
      {text:'B. 使用公共工位，不申请专属房间',effects:{},result:'你觉得申请流程太麻烦，继续在公共工位工作。虽然人多嘈杂，但凑合也能用。'}
    ]}
  ],
  gfEvents:{
    home:makeGfEvent('敏感多疑','双方聊天频次减少，女友变得敏感多疑，认为你疏于关心，情绪低落，希望你发红包哄她开心。',
      '发红包安抚情绪',{money:-40},{gfFavor:10},'你发了一个红包并附上暖心的话。女友收到后情绪明显好转，回复的语气也轻快了许多。异地不易，一个红包换一份安心，值得。',
      '认为对方无理取闹，拒绝安抚',{happiness:-4},{},'你觉得她在无理取闹，回了句"你想多了"。女友看着你的消息，删掉了已经打好的大段倾诉，只回了一个"嗯"。'),
    campus:makeGfEvent('团圆餐','二人都陷入假期倦怠，女友邀约你去食堂品尝国庆限定团圆餐。',
      '陪同共进晚餐',{money:-30},{gfFavor:7},'你们一起去了食堂，点了两份国庆限定团圆餐。红烧肉的香气、热腾腾的米饭、对面坐着的人，简单的晚餐却吃出了家的味道。',
      '懒得走动，拒绝一同就餐',{happiness:-5},{},'你说不想动。女友一个人去了食堂，坐在角落里默默地吃完了那份本该两个人分享的团圆餐。'),
    couple:makeGfEvent('宅居追剧','连日旅途奔波身心俱疲，女友不想外出，只想和你在住处追剧休息。',
      '留下来安静陪伴追剧',{happiness:5},{gfFavor:10},'你依偎在她身边，两人窝在沙发上看了一整天的剧。没有景区的喧嚣和排队的疲惫，这种安静的陪伴反而更加珍贵。',
      '想出门闲逛，拒绝宅居',{},{gfFavor:-4},'你说闷在屋里太无聊，非要出门转转。女友虽然跟着你出了门，但一路上兴致不高，你们没逛多久就各自回了住处。'),
    internship:makeGfEvent('耐心沟通','你连日加班心态烦躁，回复消息愈发敷衍，女友希望和你认真沟通一次。',
      '耐心抽出时间沟通',{},{gfFavor:6},'你放下手头的工作，认真地和她通了一次长长的电话。聊完后两个人都轻松了很多——原来很多问题，只要愿意沟通就不是问题。',
      '心情烦躁，直接拒绝交流',{happiness:-8},{},'你说"我现在很烦，别来添乱"。女友默默挂掉了电话。这一晚，你们谁也没有再给对方发一条消息。'),
    dorm:makeGfEvent('认真回应','你作息混乱、回复消息拖沓，女友积攒委屈，希望你认真回应她的消息。',
      '放下游戏安抚对方',{},{gfFavor:4},'你放下手柄，给她打了一个电话。虽然只是简单的几句安慰，但电话那头她的声音明显放松了下来。',
      '依旧敷衍回复',{happiness:-4},{},'你继续打游戏，隔很久才回一两个字。女友看着对话框里你越来越敷衍的回复，把打好的话一行一行地删掉了。')
  }
};

HOLIDAY_DAYS['2024-10-05']={
  dayNum:5,
  bgText:'部分游客、学生提前返程，车站、高速迎来返程小高峰，返校人数增多，校园逐步恢复人气。',
  campusEvents:[
    {title:'返校学长分享国赛备赛经验',text:'参与国家级科创赛事的学长提前返校，可请教备赛技巧。',choices:[
      {text:'A. 主动上前请教经验',effects:{wisdom:10,glory:3},result:'你主动上前和学长攀谈，学长非常热情地分享了他的备赛经历和评委偏好。这些经验不是书本上能学到的，含金量极高。'},
      {text:'B. 擦肩而过，不予交流',effects:{},result:'你犹豫了一下没有上前。学长匆匆走过，一段潜在的学习机会就这样错过了。'}
    ]},
    {title:'完成假期项目初稿撰写',text:'小组要求在假期尾声提交完整项目初稿。',choices:[
      {text:'A. 用心打磨初稿内容',effects:{wisdom:8,glory:4},result:'你花了整整一天反复打磨初稿，从逻辑框架到数据呈现都力求完美。提交后组员纷纷点赞，说这是组里最用心的一份。'},
      {text:'B. 敷衍完成应付检查',effects:{wisdom:-3},result:'你随便拼凑了一篇交了上去。虽然暂时应付过去了，但自己心里清楚这份初稿的水分有多大。'}
    ]}
  ],
  gfEvents:{
    home:makeGfEvent('返程忙碌','返程车流拥堵，你忙于赶路迟迟不回消息，女友内心缺乏安全感，希望你发红包弥补冷落。',
      '发红包道歉安抚',{money:-40},{gfFavor:10},'你把车靠边停了一下，给她发了一个红包，附上一句"路上太堵了，回去好好陪你"。女友的焦虑被这句话瞬间化解。',
      '自认忙碌无需解释，拒绝道歉',{happiness:-4},{},'你说"路上堵车又不是我的错"。女友没有回复，但你已经能感受到屏幕那头传来的低气压。'),
    campus:makeGfEvent('超市采购','大批同学返校，女友邀约你去校园超市采购零食囤货。',
      '陪同采购零食',{money:-35},{gfFavor:7},'你们推着购物车在货架间穿梭，她往车里扔了一堆零食，你笑着帮她拎袋子。采购完回宿舍的路上，两个人各抱着一袋零食，边走边吃。',
      '不愿出门，直接拒绝',{happiness:-5},{},'你说"你自己去就行了"。女友只好一个人去了超市，结账时看着前面帮女朋友拎袋子的男生，轻轻叹了口气。'),
    couple:makeGfEvent('人群守护','景区人流再度拥挤，女友害怕人群冲撞，希望你全程牵住她保护她。',
      '全程贴身守护牵手同行',{charm:4},{gfFavor:13},'你牢牢牵住她的手，在人流中为她开辟出一条安全通道。她把你的手握得很紧，偶尔抬头看你的眼神里全是依赖和信任。',
      '自顾行走，无法时刻照看',{},{gfFavor:-3},'你专心看导航找路，没有注意到她在人群中好几次被挤得踉跄。她抿着嘴跟在你身后，一路沉默。'),
    internship:makeGfEvent('加班道歉','公司临时加班，你延后下班，错过了和女友的约定见面时间。',
      '主动道歉并购买小礼物赔罪',{money:-25},{gfFavor:7},'你在下班的路上买了一束小花，见到她时郑重地道了歉。女友接过花，脸上的委屈慢慢化成了笑意。',
      '认为加班身不由己，不作道歉',{happiness:-6},{},'你说"加班又不是我乐意的"。女友等了你两个小时，听到这句话后转身就走了。'),
    dorm:makeGfEvent('出门散步','室友陆续返校，女友看到他人成双成对心生羡慕，约你出门散步。',
      '出门陪同散步',{},{gfFavor:5},'你伸了个懒腰从床上起来，陪她在校园里走了一圈。夕阳下的操场很安静，你们一边走一边聊，感觉还不错。',
      '坚守宿舍，拒绝外出',{happiness:-5},{},'你说不想动。女友在操场边等了又等，最后发了一条消息："算了，我回去了。"')
  }
};

HOLIDAY_DAYS['2024-10-06']={
  dayNum:6,
  bgText:'假期临近尾声，绝大多数学生结束出行、返乡，陆续返回校园。大家开始收拾行李、调整心态，为恢复上课做准备。',
  campusEvents:[
    {title:'大创项目中期复盘会议',text:'开展假期项目中期复盘，总结七日工作进度与问题。',choices:[
      {text:'A. 认真整理资料、参与复盘',effects:{wisdom:9,glory:4},result:'你整理了假期所有的工作记录，在会上条理清晰地汇报了项目进展。组员们对你的总结能力刮目相看，团队协作效率明显提升。'},
      {text:'B. 敷衍应对，快速结束会议',effects:{wisdom:-3},result:'你随便说了几句就催着大家散会。会议草草结束，许多问题没有讨论清楚，给后续工作埋下了隐患。'}
    ]},
    {title:'归档假期科创资料',text:'需要将假期调研数据、学习文件统一分类归档。',choices:[
      {text:'A. 细心整理归档',effects:{wisdom:6},result:'你把假期所有资料分门别类整理好，建立了清晰的目录结构。韩鹏老师在群里看到后点了赞，说这是做科创项目应有的态度。'},
      {text:'B. 随意堆放，不做整理',effects:{},result:'你把资料随手塞进了文件夹。虽然现在省了一点时间，但开学后找资料时估计要头疼了。'}
    ]}
  ],
  gfEvents:{
    home:makeGfEvent('规划未来','假期即将结束，女友开始规划开学后的相处日常，滔滔不绝和你分享想法，希望你认真倾听回应，并准备一份心意红包。',
      '耐心倾听并发放心意红包',{money:-40},{gfFavor:10},'你认真听她一条一条地讲开学后的计划，然后发了一个红包，说"开学后每天都能见到你了"。女友开心地收下了红包，发来一长串"期待开学"的消息。',
      '敷衍应对，不在意对方规划',{happiness:-4},{},'你说"开学再说呗，现在想那么多干嘛"。女友的热情被你这盆冷水浇了个透，后面她没再提起任何计划。'),
    campus:makeGfEvent('梳理知识点','临近开学，女友担心课业跟不上，希望你帮忙梳理各科预习知识点。',
      '耐心协助梳理知识点',{wisdom:3},{gfFavor:8},'你拿出课本和她一起从头梳理了一遍。梳理的过程中你自己也理清了不少之前模糊的概念，两个人互相讨论、互相促进，效率很高。',
      '不愿动脑，拒绝帮忙',{happiness:-6},{},'你说"我还有自己的事要忙"。女友只好一个人对着课本发愁，密密麻麻的公式看得她头昏脑涨。'),
    couple:makeGfEvent('情侣写真','旅行即将结束，女友十分不舍，想要拍摄一组情侣合照留存假期回忆。',
      '认真拍摄情侣写真',{money:-40,charm:3},{gfFavor:14},'你请了路人帮忙，在景区最美的几个角落拍了一组情侣写真。每一张照片里你们都笑得很灿烂——这是这个假期最珍贵的纪念。',
      '嫌拍照麻烦，减少拍摄数量',{},{gfFavor:-4},'你说"拍几张就行了，别拍了"。女友默默收起了手机，那些想一起打卡的机位，最终只留在了她的收藏夹里。'),
    internship:makeGfEvent('晚间散步','实习临近收尾，工作压力加大，女友想约你晚间散步舒缓压力。',
      '放下工作陪同散步',{},{gfFavor:7},'你合上电脑，和她一起在操场上走了一圈又一圈。夜晚的凉风吹散了工作的烦躁，牵着她的手，你感到久违的放松。',
      '压力过大，没有心情外出',{happiness:-7},{},'你说"我现在压力很大，你别烦我"。女友没有再多说，默默帮你倒了一杯热水放在桌边。你很久以后才注意到那杯水已经凉透了。'),
    dorm:makeGfEvent('调整作息','女友劝说你调整作息，不要再熬夜打游戏，迎接开学。',
      '听从劝告，早睡调整作息',{health:5},{gfFavor:5},'你说"好吧，今天早点睡"。关了灯躺在床上，你发现原来早睡的感觉真的不错。女友收到你发的"晚安"后，安心地也睡了。',
      '拒绝改变，继续熬夜',{happiness:-4},{},'你说"我自己有数，不用你管"。女友没有再劝，但她知道明天开学你的状态一定很糟糕。')
  }
};

HOLIDAY_DAYS['2024-10-07']={
  dayNum:7,
  bgText:'国庆长假最后一日，所有学生基本完成返校。街头国庆装饰仍在，但节日氛围逐渐褪去，全员调整作息、收拾状态，明日将恢复早八课程、重启团校系统。',
  campusEvents:[
    {title:'提交假期全部项目成果',text:'向韩鹏老师上交七天假期的大创进度成果，等待点评。',choices:[
      {text:'A. 规整整理后完整提交',effects:{hanpengHaoGan:7,glory:5},result:'你将七天的工作成果精心整理成一份详实的报告提交了上去。韩鹏老师仔细审阅后给出了高度评价，说你是假期最用心的同学之一。'},
      {text:'B. 仓促提交，未做整理',effects:{hanpengHaoGan:-3},result:'你急急忙忙拼凑了一版交了上去。韩鹏老师看后微微皱眉，没有多说什么，但你知道他对你的期待打了折扣。'}
    ]},
    {title:'调整作息适配开学',text:'假期作息紊乱，需要调整生物钟，应对次日早八课程。',choices:[
      {text:'A. 早睡早起调整作息',effects:{health:8},result:'你晚上十点就关了手机上了床。虽然刚开始不太习惯，但第二天早上精神饱满地醒来，为开学做好了充分准备。'},
      {text:'B. 延续熬夜习惯',effects:{health:-6},result:'你忍不住又熬夜到了凌晨两点。等到第二天早上闹钟响的时候，你深刻地后悔了自己昨晚的选择。'}
    ]}
  ],
  gfEvents:{
    home:makeGfEvent('告别红包','你准备次日返校，长达七日的异地相处即将结束。女友感慨异地难熬，期盼线下见面，希望收到一份告别红包圆满收尾假期。',
      '发放红包并约定返校见面',{money:-40},{gfFavor:12},'你发了一个红包，和她约定明天一返校就第一时间见面。女友开心得像只小鸟，连着发了好几条"等你回来"。七天异地终于要结束了。',
      '仅口头约定，不发红包',{happiness:-3},{},'你说"明天就见到了还发什么红包"。女友虽然嘴上说没事，但心里还是有一点点小失落。'),
    campus:makeGfEvent('操场谈心','假期最后一晚，二人坐在操场吹晚风、看国旗，感慨假期短暂，期待开学朝夕相伴。女友想和你静坐整晚谈心。',
      '全程陪伴静坐聊天',{health:4},{gfFavor:9},'你们在操场的台阶上坐了很久，聊了很多——关于假期、关于未来、关于彼此。晚风很凉，但两颗心都很暖。',
      '夜间寒凉，想提前回宿舍',{happiness:-5},{},'你说"太冷了，我先回去了"。女友一个人又在操场坐了一会儿，看着天上的星星，心里有种说不出的空落。'),
    couple:makeGfEvent('旅途返程','旅途结束踏上返程，女友依偎在你身旁，不舍这段甜蜜假期，期待开学日常相伴。',
      '温柔安抚，承诺多陪伴对方',{charm:5},{gfFavor:18},'你搂着她的肩膀，轻声承诺开学后每天都会陪她。她靠在你身上，说这七天是她大学里最幸福的时光。车子驶入校园，你们的手仍然紧紧握在一起。',
      '旅途疲惫，沉默不语',{},{gfFavor:-3},'你太累了，一路几乎没怎么说话。女友几次想和你分享旅途的感受，看到你疲惫的样子又咽了回去。'),
    internship:makeGfEvent('实习结束','国庆实习正式结束，你终于摆脱加班劳累。女友心疼你七日辛苦，想好好陪伴你放松一天。',
      '接受陪伴，轻松相处',{},{gfFavor:8},'你终于放下了工作的担子。和她一起在校园里随便走走、吃个饭、看场电影——原来最简单的相处就是最好的放松。',
      '身心俱疲，想要独自休息',{happiness:-6},{},'你说"我想一个人静静"。女友虽然很想陪你，但还是尊重了你的选择，轻轻说了句"好好休息"。'),
    dorm:makeGfEvent('开学劝诫','假期摆烂生活即将结束，女友叮嘱你开学后减少游戏时间，多学习、多陪伴她。',
      '答应对方，愿意做出改变',{},{gfFavor:6},'你认真地点了点头，说开学后一定减少游戏时间，多花时间学习和陪她。女友开心地笑了，眼睛里藏着小小的期待。',
      '口头敷衍，不愿改变现状',{happiness:-3},{},'你说"知道了知道了"眼睛却没离开屏幕。女友叹了口气，不知道开学后你还能不能兑现这句敷衍的承诺。')
  }
};

// ==================== 国庆假期渲染 ====================
function renderCampusEvent(evt,callback){
  var storyEl=$('story-text');
  var ft='<span class="phase-tag main">🔬 大创事件</span><br><strong>'+evt.title+'</strong>\n\n'+evt.text;
  storyEl.innerHTML=storyEl.innerHTML+'<br><br>'+ft.replace(/\n/g,'<br>');
  updatePanel();
  $('choices-area').innerHTML='';
  for(var i=0;i<evt.choices.length;i++){
    var ec=evt.choices[i];
    var btn=document.createElement('button');btn.textContent=ec.text;
    (function(ec){
      btn.onclick=function(){
        var changes=doEffects(Object.assign({},ec.effects||{}));
        $('choices-area').innerHTML='';
        showPopup(evt.title,ec.result||'',changes,null,function(){
          updatePanel();if(callback)callback();
        });
      };
    })(ec);
    $('choices-area').appendChild(btn);
  }
}

function renderHolidayDay(dk){
  var hd=HOLIDAY_DAYS[dk];
  if(!hd)return;
  var wd=weekday(GS.year,GS.month,GS.day);
  var dStr=fmtDate(GS.year,GS.month,GS.day);
  var routeKey=GS.holidayRoute;
  var route=routeKey?HOLIDAY_ROUTES[routeKey]:null;

  if(hd.isSelection&&!routeKey){
    // Oct 1: route selection first
    $('main-area').innerHTML='<div id="story-title">📅 '+dStr+'　星期'+wd+' · 国庆第1天</div><div id="story-text">'+hd.bgText.replace(/\n/g,'<br>')+'<br><br><div style="color:#8b7d6b;font-size:.85em;">👇 请选择你的七日过节路线（选定后10.2-10.7不可更改）</div></div>';
    updatePanel();
    $('choices-area').innerHTML='';
    var routeKeys=['home','campus','couple','internship','dorm'];
    for(var r=0;r<routeKeys.length;r++){
      var rk=routeKeys[r];
      var rd=HOLIDAY_ROUTES[rk];
      if(rd.requiresGf&&!GS.gfUnlocked)continue;
      var btn=document.createElement('button');btn.textContent=rd.name;
      (function(rk,rd){
        btn.onclick=function(){
          GS.holidayRoute=rk;
          applyHolidayDay(hd,dk,rk,function(){finishHolidayDay();});
        };
      })(rk,rd);
      $('choices-area').appendChild(btn);
    }
    return;
  }

  if(!routeKey){GS.holidayRoute='campus';routeKey='campus';route=HOLIDAY_ROUTES.campus;}
  applyHolidayDay(hd,dk,routeKey,function(){finishHolidayDay();});
}

function applyHolidayDay(hd,dk,routeKey,callback){
  var route=HOLIDAY_ROUTES[routeKey];
  var wd=weekday(GS.year,GS.month,GS.day);
  var dStr=fmtDate(GS.year,GS.month,GS.day);

  // Apply daily route effects
  if(route.dailyEffects){
    var routeChanges=doEffects(Object.assign({},route.dailyEffects));
    if(routeKey==='home'&&GS.gfUnlocked){
      GS.gfFavor=Math.max(0,GS.gfFavor-5);
    }
    if(routeKey==='couple'&&GS.gfUnlocked){
      GS.gfFavor=Math.max(0,GS.gfFavor+18);
    }
    updatePanel();
  }

  var storyEl=$('story-text');
  var titleHtml='<div id="story-title">📅 '+dStr+'　星期'+wd+' · 国庆第'+hd.dayNum+'天</div>';
  var bgHtml=hd.bgText.replace(/\n/g,'<br>');
  var routeLabel='<br><span style="color:#1a3a5c;font-size:.85em;">🏷️ 当前路线：'+route.name+'</span>';
  storyEl.innerHTML=titleHtml+'<div id="story-text">'+bgHtml+routeLabel+'</div>';
  updatePanel();
  $('choices-area').innerHTML='';

  // Campus events
  if(routeKey==='campus'&&hd.campusEvents&&hd.campusEvents.length>0){
    var evtIdx=0;
    function nextCampusEvent(){
      if(evtIdx>=hd.campusEvents.length){
        showHolidayGfOrFinish(hd,routeKey,callback);
        return;
      }
      renderCampusEvent(hd.campusEvents[evtIdx],function(){
        evtIdx++;nextCampusEvent();
      });
    }
    nextCampusEvent();
    return;
  }

  showHolidayGfOrFinish(hd,routeKey,callback);
}

function showHolidayGfOrFinish(hd,routeKey,callback){
  if(GS.gfUnlocked&&hd.gfEvents&&hd.gfEvents[routeKey]){
    var ge=hd.gfEvents[routeKey];
    var storyEl=$('story-text');
    var ft='<span class="phase-tag love">💕 女友事件</span><br><strong>'+ge.title+'</strong>\n\n'+ge.text;
    storyEl.innerHTML=storyEl.innerHTML+'<br><br>'+ft.replace(/\n/g,'<br>');
    updatePanel();
    $('choices-area').innerHTML='';
    renderHolidayGfChoices(ge,routeKey,function(){if(callback)callback();});
  }else{
    if(callback)callback();
  }
}

function renderHolidayGfChoices(ge,routeKey,callback){
  var routeMod=HOLIDAY_ROUTES[routeKey].gfMod||{};
  for(var i=0;i<ge.choices.length;i++){
    var gc=ge.choices[i];
    var btn=document.createElement('button');btn.textContent=gc.text;
    (function(gc,idx){
      btn.onclick=function(){
        var eff=Object.assign({},gc.effects||{});
        var gfChanges={};
        if(gc.gfEffects){
          GS.breakupProb=0;
          for(var k2 in gc.gfEffects){
            if(gc.gfEffects.hasOwnProperty(k2)&&GS.hasOwnProperty(k2)&&typeof GS[k2]==='number'){
              var adj=gc.gfEffects[k2];
              if(k2==='gfFavor'&&routeMod.acceptPenalty)adj=Math.max(0,adj-routeMod.acceptPenalty);
              var old2=GS[k2];GS[k2]=Math.max(0,GS[k2]+adj);gfChanges[k2]=GS[k2]-old2;
            }
          }
          if(routeKey==='couple'&&routeMod.specialChance&&Math.random()<routeMod.specialChance){
            gfChanges.charm=(gfChanges.charm||0)+3;GS.charm+=3;
            gfChanges.happiness=(gfChanges.happiness||0)+5;GS.happiness+=5;
          }
        }else if(idx===1){
          var extra=routeMod.rejectExtra||0;
          GS.breakupProb+=10+extra;
        }
        var changes=doEffects(eff);
        for(var k3 in gfChanges){if(gfChanges.hasOwnProperty(k3))changes[k3]=gfChanges[k3];}
        $('choices-area').innerHTML='';
        var resultText=gc.result||'';
        if(routeKey==='couple'&&gc.gfEffects&&routeMod.specialChance&&Math.random()<routeMod.specialChance){
          resultText+='\n\n🌙 暧昧隐藏剧情触发：夜幕低垂，灯火阑珊。她悄悄靠近你，在你耳边轻声说了一句只有你们两人能听见的话。这个国庆注定难忘。';
        }
        if(idx===1&&GS.breakupProb>=100){
          updatePanel();
          showBreakupPopup(function(){updatePanel();if(callback)callback();});
        }else if(idx===1&&GS.breakupProb>0&&Math.random()*100<GS.breakupProb){
          updatePanel();
          showBreakupPopup(function(){updatePanel();if(callback)callback();});
        }else{
          showPopup(ge.title,resultText,changes,null,function(){updatePanel();if(callback)callback();});
        }
      };
    })(gc,i);
    $('choices-area').appendChild(btn);
  }
}

function finishHolidayDay(){
  $('choices-area').innerHTML='';
  var nb=document.createElement('button');nb.className='primary';nb.textContent='→ 下一天';
  nb.onclick=function(){advanceToNextDay();};
  $('choices-area').appendChild(nb);saveGame();
}

// ==================== 日常模式引擎 ====================
function enterScriptedDays(){
  GS.phase='daily';GS.year=2024;GS.month=9;GS.day=8;
  updatePanel();
  $('attr-panel').style.display='block';
  $('bottom-bar').style.display='flex';
  renderBottomBar();
  processDay();
}

function processDay(){
  var dk=dateKey(GS.year,GS.month,GS.day);
  if(GS.day===1)applyMonthly();
  var isHoliday=HOLIDAY_DAYS[dk]?true:false;
  if(!isHoliday&&GS.gfUnlocked&&GS.gfFavor>0){
    GS.gfFavor=Math.max(0,GS.gfFavor-1);
    if(GS.gfFavor<30&&Math.random()<0.15){
      var gfName=GS.gfName||'女友';
      GS.gfUnlocked=false;GS.gfName='';GS.gfFavor=0;
      updatePanel();
      showPopup('💔 分手','你们的关系走到了尽头。'+gfName+'提出了分手，恋爱面板已清空，无法恢复。',null,null,function(){updatePanel();});
    }
  }
  updatePanel();
  if(isHoliday&&GS.holidayRoute==='home'){
    processDayContinue(dk);
  }else if(GS.lastMealDay!==dk){
    renderMealChoice(dk,function(){processDayContinue(dk);});
  }else{
    processDayContinue(dk);
  }
}

function processDayContinue(dk){
  if(HOLIDAY_DAYS[dk]){
    renderHolidayDay(dk);return;
  }
  var sd=STORY_DAYS[dk];
  if(sd){
    GS.currentDay=dk;GS.currentPhaseIdx=0;
    renderDayTitle(sd);renderDayPhase(sd,0);
  }else{
    renderGenericDay();
  }
}

function renderMealChoice(dk,callback){
  GS.lastMealDay=dk;
  $('main-area').innerHTML='<div id="story-title">🍽️ 今日用餐</div><div id="story-text">到了用餐时间，今天你想吃什么？</div>';
  $('choices-area').innerHTML='';
  var choices=[
    {text:'A. 点外卖 — 在宿舍舒舒服服点一份外卖，方便美味但营养不均衡（金钱-15，健康-3）',effects:{money:-15,health:-3},result:'你在外卖App上精挑细选，点了一份热气腾腾的盖浇饭。外卖小哥准时送到宿舍楼下，你边追剧边享用，惬意十足。不过天天吃外卖，营养确实有些跟不上，感觉身体有点沉。'},
    {text:'B. 校内食堂 — 去校内食堂吃一顿经济实惠、营养均衡的午餐（金钱-10）',effects:{money:-10},result:'你拿着饭卡来到校内食堂，打了一份两荤一素的套餐。味道中规中矩，但胜在经济实惠、营养搭配合理。吃完饭精神饱满，下午的学习效率都提高了。'}
  ];
  if(GS.hasPengyuanCard){
    choices.push({text:'C. 鹏远食堂 — 在鹏远公寓食堂刷卡用餐，离宿舍最近（鹏远余额-8）',effects:{pengyuanBalance:-8},result:'你来到鹏远食堂，这里离宿舍最近。刷鹏远卡支付了8元，菜品比校内食堂精致不少——糖醋里脊、清炒时蔬、一碗热汤，环境也安静整洁。吃完饭走两分钟就回到宿舍，方便极了。'});
  }
  for(var i=0;i<choices.length;i++){
    var c=choices[i];
    var btn=document.createElement('button');
    btn.textContent=c.text;
    (function(ci){
      btn.onclick=function(){
        var changes=doEffects(ci.effects);
        $('choices-area').innerHTML='';
        showPopup('用餐',ci.result,changes,null,function(){
          updatePanel();
          if(callback)callback();
        });
      };
    })(c);
    $('choices-area').appendChild(btn);
  }
}

function renderDayTitle(dayData){
  var wd=weekday(GS.year,GS.month,GS.day);
  $('main-area').innerHTML='<div id="story-title">📅 '+fmtDate(GS.year,GS.month,GS.day)+' 星期'+wd+' · '+dayData.title+'</div><div id="story-text"></div>';
  $('choices-area').innerHTML='';
}

function renderDayPhase(dayData,idx){
  if(idx>=dayData.phases.length){
    if(dayData.gfEvent&&GS.gfUnlocked){renderGfEvent(dayData);}
    else{finishDay(dayData);}
    return;
  }
  GS.currentPhaseIdx=idx;
  var ph=dayData.phases[idx];
  var tagHtml=ph.tag?'<span class="phase-tag '+(ph.type||'main')+'">'+ph.tag+'</span><br>':'';
  var storyEl=$('story-text');
  var cur=storyEl.innerHTML;

  if(ph.type==='auto'){
    var eff=ph.effects||{};
    if(ph.setFlags)Object.assign(GS,ph.setFlags);
    var changes=doEffects(eff);
    var ft=(tagHtml+'<strong>'+ph.title+'</strong>\n\n'+ph.text).replace(/\n/g,'<br>');
    storyEl.innerHTML=cur+'<br><br>'+ft;
    updatePanel();
    showPopup(ph.title,'',changes,null,function(){renderDayPhase(dayData,idx+1);});
    return;
  }

  if(ph.type==='conditional'){
    var condMet=true;
    if(ph.condCustom){condMet=ph.condCustom();}
    else if(ph.condFlag){condMet=!!GS[ph.condFlag];}
    var text='',eff2={},hiddenInfo=null;
    if(ph.isSpecial&&ph.specialType==='loveUnlock'){
      if(condMet){
        text=ph.text_applied;eff2=Object.assign({},ph.sEffects||{});
        if(ph.sFlags)Object.assign(GS,ph.sFlags);
        if(ph.sHidden)hiddenInfo=ph.sHidden;
        text+='\n\n'+ph.sText;
      }else{
        text=ph.text_not;eff2=Object.assign({},ph.fEffects||{});
        text+='\n\n'+ph.fText;
      }
    }else if(ph.isSpecial&&ph.specialType==='clubInterview'){
      if(condMet){
        text=ph.text_applied;
        var pass=false;
        if(GS.clubType==='体育社团')pass=(GS.health+GS.charm)>=180;
        else if(GS.clubType==='学院组织')pass=(GS.glory+GS.wisdom)>=180;
        else if(GS.clubType==='图书管理员')pass=(GS.wisdom+GS.happiness)>=180;
        else if(GS.clubType==='文艺部')pass=(GS.charm+GS.singing)>=180;
        if(pass){
          text+='\n\n'+ph.sText;
          if(GS.clubType==='体育社团')eff2={health:15,glory:8};
          else if(GS.clubType==='学院组织')eff2={wisdom:12,glory:10};
          else if(GS.clubType==='图书管理员')eff2={wisdom:14,happiness:9};
          else if(GS.clubType==='文艺部')eff2={charm:13,singing:10};
        }else{text+='\n\n'+ph.fText;}
      }else{text=ph.text_not;}
    }else{
      if(condMet){
        text=ph.text_applied;var roll=Math.random();
        if(roll<ph.prob){eff2=Object.assign({},ph.sEffects||{});text+='\n\n'+ph.sText;if(ph.sHidden)hiddenInfo=ph.sHidden;if(ph.sFlags)Object.assign(GS,ph.sFlags);}
        else{eff2=Object.assign({},ph.fEffects||{});text+='\n\n'+ph.fText;}
      }else{text=ph.text_not||'你没有参与此事项。';}
    }
    var ft2=(tagHtml+'<strong>'+ph.title+'</strong>\n\n'+text).replace(/\n/g,'<br>');
    storyEl.innerHTML=cur+'<br><br>'+ft2;
    var changes2=doEffects(eff2);updatePanel();
    showPopup(ph.title,'',changes2,hiddenInfo,function(){renderDayPhase(dayData,idx+1);});
    return;
  }

  if(ph.type==='random'){
    if(GS.tuanxiaoAccepted&&GS.tuanxiaoWeekBan>0&&isWeekend(GS.year,GS.month,GS.day)){
      storyEl.innerHTML=cur+'<br><br><span style="color:#c0392b;">⚠️ 今天是周末，但因团校集训安排，随机事件不可用。</span>';
      updatePanel();renderDayPhase(dayData,idx+1);return;
    }
    var pool=RP[ph.pool];
    if(!pool||pool.length===0){renderDayPhase(dayData,idx+1);return;}
    var evt=pool[Math.floor(Math.random()*pool.length)];
    var ft3=(tagHtml+'<strong>'+evt.title+'</strong>\n\n'+evt.text).replace(/\n/g,'<br>');
    storyEl.innerHTML=cur+'<br><br>'+ft3;updatePanel();
    $('choices-area').innerHTML='';
    evt.choices.forEach(function(ec){
      var btn=document.createElement('button');btn.textContent=ec.text;
      btn.onclick=function(){
        var eff3=Object.assign({},ec.effects||{});
        var changes3=doEffects(eff3);
        $('choices-area').innerHTML='';
        showPopup(evt.title,ec.result||'',changes3,null,function(){updatePanel();renderDayPhase(dayData,idx+1);});
      };
      $('choices-area').appendChild(btn);
    });return;
  }

  // main/evening 类型
  var ft4=(tagHtml+'<strong>'+(ph.title||'')+'</strong>\n\n'+(ph.text||'')).replace(/\n/g,'<br>');
  storyEl.innerHTML=cur+'<br><br>'+ft4;updatePanel();
  $('choices-area').innerHTML='';
  if(!ph.choices||ph.choices.length===0){
    var btn4=document.createElement('button');btn4.className='primary';btn4.textContent='继续';
    btn4.onclick=function(){renderDayPhase(dayData,idx+1);};
    $('choices-area').appendChild(btn4);return;
  }
  ph.choices.forEach(function(pc){
    var btn=document.createElement('button');btn.textContent=pc.text;
    btn.onclick=function(){
      var eff4=Object.assign({},pc.effects||{}),hiddenInfo4=null;
      if(pc.hidden){
        hiddenInfo4=pc.hidden.desc||'';
        if(pc.hidden.flags)Object.assign(GS,pc.hidden.flags);
        if(pc.hidden.effects)Object.assign(eff4,pc.hidden.effects);
        if(pc.hidden.gEffects){
          for(var gk in pc.hidden.gEffects){
            if(pc.hidden.gEffects.hasOwnProperty(gk)&&GS.courseGrades&&GS.courseGrades.hasOwnProperty(gk)){
              GS.courseGrades[gk]=Math.max(0,Math.min(100,GS.courseGrades[gk]+pc.hidden.gEffects[gk]));
            }
          }
        }
      }
      if(pc.flags)Object.assign(GS,pc.flags);
      var riskInfo=null;
      if(pc.risk){if(Math.random()<pc.risk.chance){Object.assign(eff4,pc.risk.effects||{});riskInfo=pc.risk.desc||'';}}
      if(pc.cond){
        var val=0;
        if(pc.condAttr==='charmPlusGlory')val=GS.charm+GS.glory;
        else val=GS[pc.condAttr]||0;
        if(val>=pc.condTh){
          Object.assign(eff4,pc.sEffects||{});
          if(pc.sFlags)Object.assign(GS,pc.sFlags);
          if(pc.sHidden)hiddenInfo4=hiddenInfo4?hiddenInfo4+' | '+pc.sHidden:pc.sHidden;
          pc._result=pc.sText;
        }
        else{Object.assign(eff4,pc.fEffects||{});pc._result=pc.fText;}
      }
      var allHidden=hiddenInfo4;if(riskInfo)allHidden=allHidden?allHidden+' | '+riskInfo:riskInfo;
      var changes4=doEffects(eff4);
      $('choices-area').innerHTML='';
      showPopup(ph.title||'',pc._result||pc.result||'',changes4,allHidden,function(){
        updatePanel();renderDayPhase(dayData,idx+1);
      });
    };
    $('choices-area').appendChild(btn);
  });
}

function renderGfEvent(dayData){
  var ge=dayData.gfEvent;
  var storyEl=$('story-text');
  var ft='<span class="phase-tag love">💕 女友事件</span><br><strong>'+ge.title+'</strong>\n\n'+ge.text;
  storyEl.innerHTML=storyEl.innerHTML+'<br><br>'+ft.replace(/\n/g,'<br>');
  updatePanel();
  $('choices-area').innerHTML='';
  for(var i=0;i<ge.choices.length;i++){
    var gc=ge.choices[i];
    var btn=document.createElement('button');btn.textContent=gc.text;
    (function(gc,idx){
      btn.onclick=function(){
        var eff=Object.assign({},gc.effects||{});
        var gfChanges={};
        if(gc.gfEffects){
          GS.breakupProb=0;
          for(var k2 in gc.gfEffects){
            if(gc.gfEffects.hasOwnProperty(k2)&&GS.hasOwnProperty(k2)&&typeof GS[k2]==='number'){
              var old2=GS[k2];GS[k2]=Math.max(0,GS[k2]+gc.gfEffects[k2]);gfChanges[k2]=GS[k2]-old2;
            }
          }
        }else if(idx===1){
          GS.breakupProb+=10;
        }
        var changes=doEffects(eff);
        for(var k3 in gfChanges){if(gfChanges.hasOwnProperty(k3))changes[k3]=gfChanges[k3];}
        $('choices-area').innerHTML='';
        if(idx===1&&GS.breakupProb>0&&Math.random()*100<GS.breakupProb){
          updatePanel();
          showBreakupPopup(function(){updatePanel();finishDay(dayData);});
        }else{
          showPopup(ge.title,gc.result||'',changes,null,function(){
            updatePanel();finishDay(dayData);
          });
        }
      };
    })(gc,i);
    $('choices-area').appendChild(btn);
  }
}

function showBreakupPopup(callback){
  var overlay=document.createElement('div');overlay.className='popup-overlay';
  overlay.innerHTML='<div class="popup-box"><div class="popup-title">💔 感情危机</div><div class="popup-result">你多次拒绝了女友，她感到非常失望和伤心。你们的感情出现了严重危机……</div><div style="display:flex;flex-direction:column;gap:8px;margin-top:16px;"><button class="popup-btn" id="bp-reconcile" style="background:#c0392b;">花费150元买礼物和好（金钱-150）</button><button class="popup-btn" id="bp-breakup" style="background:#8b7d6b;">分手吧</button></div></div>';
  document.body.appendChild(overlay);
  $('bp-reconcile').onclick=function(){
    overlay.remove();
    if(GS.money>=150){
      GS.money-=150;GS.breakupProb=0;updatePanel();
      showPopup('和好','你花了150元买了一份精心准备的礼物送给女友，诚恳地道歉。她的眼泪还没干，但嘴角已经微微上扬。你们和好如初。',{money:-150},null,callback);
    }else{
      GS.gfUnlocked=false;GS.gfName='';GS.gfFavor=0;GS.breakupProb=0;updatePanel();
      showPopup('分手','你的余额不足150元，无法购买礼物挽回。你们最终还是分手了。恋爱面板已清空。',null,null,callback);
    }
  };
  $('bp-breakup').onclick=function(){
    overlay.remove();
    GS.gfUnlocked=false;GS.gfName='';GS.gfFavor=0;GS.breakupProb=0;updatePanel();
    showPopup('分手','你选择了分手。从此天各一方，各生欢喜。恋爱面板已清空。',null,null,callback);
  };
  overlay.onclick=function(e){if(e.target===overlay)overlay.remove();};
}

function finishDay(dayData){
  $('choices-area').innerHTML='';
  var btn=document.createElement('button');btn.className='primary';btn.textContent='→ 下一天';
  btn.onclick=function(){advanceToNextDay();};
  $('choices-area').appendChild(btn);
  saveGame();
}

function advanceToNextDay(){
  var lastDay=daysInMonth(GS.year,GS.month);
  if(GS.day===lastDay){
    GS.health=Math.max(0,GS.health-5);
    var se=$('story-text');if(se)se.innerHTML+='<br><span style="color:#c0392b;font-size:.85em;">🍼 室友奶扣熬夜习惯影响：健康 -5（月末扣除）</span>';
  }
  if(GS.tuanxiaoAccepted&&GS.tuanxiaoWeekBan>0&&isWeekend(GS.year,GS.month,GS.day)&&GS.month>=10&&!(GS.month===10&&GS.day>=1&&GS.day<=7)){
    var wd2=new Date(GS.year,GS.month-1,GS.day).getDay();
    if(wd2===0){
      GS.tuanxiaoWeekBan--;
      if(GS.tuanxiaoWeekBan<=0){
        GS.tuanxiaoWeekBan=0;
        if(GS.tuanxiaoWisdomPending){
          GS.wisdom+=100;
          GS.tuanxiaoWisdomPending=false;
          updatePanel();
          showPopup('🎓 团校结业','为期四周的团校集训终于结束了！\n\n你顺利完成了全部培训课程和社会实践活动。结业仪式上，你从老师手中接过团校结业证书，回想起四个周末的奔波与付出，心中充满了成就感。\n\n这段时间的系统学习让你的视野和思维方式都有了质的飞跃。',{wisdom:100},null,null);
        }
      }
    }
    if(GS.tuanxiaoWeekBan<0)GS.tuanxiaoWeekBan=0;
  }
  var dim=daysInMonth(GS.year,GS.month);
  if(GS.day>=dim){
    var wasLast=GS.day;
    GS.day=1;
    if(GS.month>=12){GS.month=1;GS.year++;}
    else{GS.month++;}
    if(GS.gfUnlocked&&wasLast===dim){GS.charm+=20;}
  }else{GS.day++;}
  if(GS.month===10&&GS.day===8&&GS.holidayRoute){GS.holidayRoute=null;}
  updatePanel();processDay();
}

// ===== 通用日常 =====
var DAILY_ACTIVITIES=[
  {text:'📚 去图书馆自习',effects:{wisdom:8}},
  {text:'🏃 去操场运动锻炼',effects:{health:8}},
  {text:'🎭 参加社团活动',effects:{charm:6,happiness:6}},
  {text:'🏠 在宿舍休息放松',effects:{health:4,happiness:4}},
  {text:'💼 做兼职赚取零花钱',effects:{money:100,health:-3}},
  {text:'🎓 参加学术讲座',effects:{wisdom:6,glory:3}}
];
var GENERIC_EVENTS=[
  {text:'你在校园里闲逛时发现了一个安静的自习角落。',effects:{wisdom:3,happiness:2}},
  {text:'食堂今天推出了新菜品，意外地好吃！',effects:{happiness:4}},
  {text:'换季时节，你不小心着凉感冒了。',effects:{health:-5}},
  {text:'在路上捡到小钱包交给了失物招领处。',effects:{glory:2,happiness:3}},
  {text:'室友过生日，大家一起凑钱买蛋糕庆祝。',effects:{happiness:6,money:-30}},
  {text:'收到家人从老家寄来的特产大礼包。',effects:{happiness:5,money:50}},
  {text:'课堂上答对了教授的难题获得表扬。',effects:{wisdom:5,glory:3}},
  {text:'突然下起大雨忘了带伞。',effects:{health:-3}},
  {text:'学校请来行业大咖开讲座，内容精彩。',effects:{wisdom:4,glory:2}},
  {text:'和室友去小吃街扫荡了一圈。',effects:{happiness:5,health:2,money:-25}}
];

var GF_SCHOOL_EVENTS=[
  makeGfEvent('课间小惊喜',
    '下课后，苏小暖跑到你的教室门口，手里提着两杯奶茶。她笑着把其中一杯递给你："今天奶茶店买一送一，这杯给你！"',
    '开心接过奶茶，和她一起去操场散步',{happiness:5},{gfFavor:5},
    '你们一人一杯奶茶，沿着操场跑道慢慢走。午后的阳光透过树叶洒在你们身上，聊着今天的课程和有趣的老师，感觉心情格外舒畅。',
    '说正在忙作业，拒绝了她的好意',{happiness:-3},
    '苏小暖的笑容消失了，默默把另一杯奶茶也收进了包里，转身离开。你看着她的背影，心里有些不是滋味。'
  ),
  makeGfEvent('图书馆偶遇',
    '你正在图书馆自习，苏小暖突然出现在你旁边坐下，拿出一本厚厚的参考书。"正好碰到你！这道题我一直看不懂，你能帮我看看吗？"',
    '放下手中的书，耐心帮她讲解题目',{wisdom:3},{gfFavor:6},
    '你耐心地给苏小暖讲解了一遍。她恍然大悟，开心地在笔记本上记了下来。周围安静的自习氛围中，你们并肩而坐的画面格外温馨。',
    '说自己正在忙，让她找别人帮忙',{happiness:-4},
    '"好吧……"苏小暖收起书本，失望地离开了图书馆。你继续自习，但不知为何，书上的文字突然变得难以集中注意力去阅读。'
  ),
  makeGfEvent('午休散步',
    '吃过午饭，苏小暖发来消息："今天天气真好，要不要一起去操场散步消食？"你往窗外一看，确实阳光明媚，微风和煦。',
    '放下手机，陪她散步聊天',{health:3,happiness:4},{gfFavor:5},
    '你们在操场上走了好几圈，聊着各自高中时的趣事和大学生活的感受。午后的阳光温暖而不刺眼，风吹起她的发梢，你突然觉得大学生活比想象中美好得多。',
    '回复说想回宿舍午睡',{happiness:-2},
    '"那你好好休息吧。"苏小暖的回复看起来很平静，但后面的整整一个下午她都没有再发任何消息过来。'
  ),
  makeGfEvent('整理笔记',
    '晚上自习结束后，苏小暖把一本精心整理的笔记本递给你："这是我这几天整理的课程笔记，重点都标出来了，你应该用得上。"',
    '感动地收下笔记，认真翻阅并向她道谢',{wisdom:5},{gfFavor:7},
    '翻开笔记本，密密麻麻但工整有序的字迹映入眼帘。每一章的重点都用不同颜色的荧光笔标了出来，甚至还在页边用铅笔画了可爱的小插图。你心里涌起一股暖流。',
    '随便翻了两下就放到一边',{wisdom:2,happiness:-4},
    '"哦……那我先走了。"苏小暖看着你随手放下的笔记本，咬了咬嘴唇，转身离开了。那本精心整理的笔记在桌上显得格外落寞。'
  )
];

function renderGenericDay(){
  var wd=weekday(GS.year,GS.month,GS.day),dStr=fmtDate(GS.year,GS.month,GS.day);
  var skipRandom=GS.tuanxiaoAccepted&&GS.tuanxiaoWeekBan>0&&isWeekend(GS.year,GS.month,GS.day);
  if(GS.weekendEventReduction>0&&isWeekend(GS.year,GS.month,GS.day))skipRandom=true;
  var evt=null,evtChanges=null;
  if(!skipRandom){
    evt=GENERIC_EVENTS[Math.floor(Math.random()*GENERIC_EVENTS.length)];
    evtChanges=doEffects(Object.assign({},evt.effects));
  }
  var evtHtml='';
  if(skipRandom){evtHtml='<div style="color:#c0392b;margin-bottom:10px;">⚠️ 团校集训期间，周末随机事件不可用</div>';}
  else if(evt){
    evtHtml='<div style="color:#8b7d6b;font-size:.85em;margin-bottom:10px;">📌 今日事件</div>'+evt.text+'<br>';
    if(evtChanges){for(var k4 in evtChanges){if(evtChanges.hasOwnProperty(k4)&&evtChanges[k4]!==0){var s2=evtChanges[k4]>0?'+':'';evtHtml+='<span style="color:'+(evtChanges[k4]>0?'#1e7e34':'#c0392b')+';font-size:.85em;">'+(ICON[k4]||'')+' '+(ATTR[k4]||k4)+' '+s2+evtChanges[k4]+' </span>';}}}
  }
  $('main-area').innerHTML='<div id="story-title">📅 '+dStr+'　星期'+wd+'</div><div id="story-text">'+evtHtml+'<br><div style="color:#8b7d6b;font-size:.85em;">👇 选择今天的行动</div></div>';
  updatePanel();
  $('choices-area').innerHTML='';
  DAILY_ACTIVITIES.forEach(function(act){
    var btn=document.createElement('button');btn.textContent=act.text;
    btn.onclick=function(){
      var ch=doEffects(act.effects);
      showPopup('今日行动',act.text,ch,null,function(){
        updatePanel();
        $('story-text').innerHTML+='<br><strong>✅ '+act.text+'</strong>';
        $('choices-area').innerHTML='';
        if(GS.gfUnlocked){
          renderDailyGfEvent(function(){
            var nb=document.createElement('button');nb.className='primary';nb.textContent='→ 下一天';
            nb.onclick=function(){advanceToNextDay();};
            $('choices-area').appendChild(nb);saveGame();
          });
        }else{
          var nb=document.createElement('button');nb.className='primary';nb.textContent='→ 下一天';
          nb.onclick=function(){advanceToNextDay();};
          $('choices-area').appendChild(nb);saveGame();
        }
      });
    };
    $('choices-area').appendChild(btn);
  });
  saveGame();
}

function renderDailyGfEvent(callback){
  var idx=Math.floor(Math.random()*GF_SCHOOL_EVENTS.length);
  var ge=GF_SCHOOL_EVENTS[idx];
  var storyEl=$('story-text');
  var ft='<span class="phase-tag love">💕 女友事件</span><br><strong>'+ge.title+'</strong>\n\n'+ge.text;
  storyEl.innerHTML=storyEl.innerHTML+'<br><br>'+ft.replace(/\n/g,'<br>');
  updatePanel();
  $('choices-area').innerHTML='';
  for(var i=0;i<ge.choices.length;i++){
    var gc=ge.choices[i];
    var btn=document.createElement('button');btn.textContent=gc.text;
    (function(gc,idx2){
      btn.onclick=function(){
        var eff=Object.assign({},gc.effects||{});
        var gfChanges={};
        if(gc.gfEffects){
          GS.breakupProb=0;
          for(var k2 in gc.gfEffects){
            if(gc.gfEffects.hasOwnProperty(k2)&&GS.hasOwnProperty(k2)&&typeof GS[k2]==='number'){
              var old2=GS[k2];GS[k2]=Math.max(0,GS[k2]+gc.gfEffects[k2]);gfChanges[k2]=GS[k2]-old2;
            }
          }
        }else if(idx2===1){
          GS.breakupProb+=10;
        }
        var changes=doEffects(eff);
        for(var k3 in gfChanges){if(gfChanges.hasOwnProperty(k3))changes[k3]=gfChanges[k3];}
        $('choices-area').innerHTML='';
        if(idx2===1&&GS.breakupProb>0&&Math.random()*100<GS.breakupProb){
          updatePanel();
          showBreakupPopup(function(){updatePanel();if(callback)callback();});
        }else{
          showPopup(ge.title,gc.result||'',changes,null,function(){
            updatePanel();if(callback)callback();
          });
        }
      };
    })(gc,i);
    $('choices-area').appendChild(btn);
  }
}

function applyMonthly(){GS.money+=2500;if(GS.hasPhoneCard)GS.money-=49;}

// ===== 存档 =====
function saveGame(){
  if(!GS||GS.phase==='title'||GS.phase==='allocation')return;
  var data={
    v:4,year:GS.year,month:GS.month,day:GS.day,
    health:GS.health,happiness:GS.happiness,wisdom:GS.wisdom,charm:GS.charm,
    glory:GS.glory,money:GS.money,singing:GS.singing,
    hasPengyuanCard:GS.hasPengyuanCard,hasPhoneCard:GS.hasPhoneCard,
    talentPerformed:GS.talentPerformed,talentSuccess:GS.talentSuccess,wonElection:GS.wonElection,
    tuanxiaoApplied:GS.tuanxiaoApplied,tuanxiaoAccepted:GS.tuanxiaoAccepted,
    dachuangJoined:GS.dachuangJoined,hanpengHaoGan:GS.hanpengHaoGan,
    cet4Applied:GS.cet4Applied,deskBought:GS.deskBought,
    clubApplied:GS.clubApplied,clubType:GS.clubType,
    keChuangUnlocked:GS.keChuangUnlocked,sheTuanUnlocked:GS.sheTuanUnlocked,tuanxiaoWeekBan:GS.tuanxiaoWeekBan,
    gfUnlocked:GS.gfUnlocked,gfName:GS.gfName,gfFavor:GS.gfFavor,
    inventory:GS.inventory,phase:GS.phase,currentNode:GS.currentNode,
    currentDay:GS.currentDay,currentPhaseIdx:GS.currentPhaseIdx,
    pengyuanBalance:GS.pengyuanBalance,tuanxiaoWisdomPending:GS.tuanxiaoWisdomPending,
    teacherFavor:GS.teacherFavor,classmateFavor:GS.classmateFavor,
    lastMealDay:GS.lastMealDay,
    breakupProb:GS.breakupProb,courseGrades:GS.courseGrades,
    taniaFavor:GS.taniaFavor,shijianmingFavor:GS.shijianmingFavor,zhouruiFavor:GS.zhouruiFavor,
    hanpengUnlocked:GS.hanpengUnlocked,taniaUnlocked:GS.taniaUnlocked,
    shijianmingUnlocked:GS.shijianmingUnlocked,zhouruiUnlocked:GS.zhouruiUnlocked,
    weekendEventReduction:GS.weekendEventReduction,
    holidayRoute:GS.holidayRoute
  };
  try{localStorage.setItem('dongqin_save4',JSON.stringify(data));}catch(e){}
}

function loadGame(){
  try{
    var raw=localStorage.getItem('dongqin_save4');
    if(!raw){showToast('没有找到存档');return;}
    var d=JSON.parse(raw);GS=defaultState();Object.assign(GS,d);
    GS.phase=d.phase||'daily';
    $('attr-panel').style.display='block';$('bottom-bar').style.display='flex';
    updatePanel();renderBottomBar();
    if(GS.phase==='story'&&GS.currentNode&&STORY_NODES[GS.currentNode]){renderStoryNode(STORY_NODES[GS.currentNode]);}
    else{processDay();}
    showToast('存档读取成功');
  }catch(e){showToast('存档读取失败:'+e.message);}
}

function resetToTitle(){GS=defaultState();renderTitle();}

function showToast(msg){
  var e=document.getElementById('toast');if(e)e.remove();
  var t=document.createElement('div');t.id='toast';t.textContent=msg;
  t.style.cssText='position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#1a3a5c;color:#f0e6d3;padding:10px 24px;border-radius:20px;font-size:.9em;z-index:999;opacity:0;transition:opacity .3s ease;pointer-events:none;';
  document.body.appendChild(t);
  requestAnimationFrame(function(){t.style.opacity='1';});
  setTimeout(function(){t.style.opacity='0';setTimeout(function(){if(t.parentNode)t.remove();},300);},1800);
}

// ===== 初始化 =====
function init(){
  GS=defaultState();
  try{
    var raw=localStorage.getItem('dongqin_save4');
    if(raw){
      var d=JSON.parse(raw);
      if(d.phase&&d.phase!=='title'&&d.phase!=='allocation'){
        GS=defaultState();Object.assign(GS,d);
        GS.phase=d.phase||'daily';
        $('attr-panel').style.display='block';$('bottom-bar').style.display='flex';updatePanel();renderBottomBar();
        if(GS.phase==='story'&&GS.currentNode&&STORY_NODES[GS.currentNode]){renderStoryNode(STORY_NODES[GS.currentNode]);}
        else{processDay();}
        return;
      }
    }
  }catch(e){}
  renderTitle();
}
document.addEventListener('DOMContentLoaded',init);