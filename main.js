// -----------------------------
// Deterministic RNG
// -----------------------------
const normalize = (v) => String(v ?? "").trim();

// FNV-1a 32-bit hash
function fnv1a32(str){
  let h = 0x811c9dc5;
  for(let i=0;i<str.length;i++){
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Mulberry32 PRNG
function mulberry32(seed){
  let a = seed >>> 0;
  return function(){
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

function clamp(n,min,max){ return Math.max(min, Math.min(max,n)); }
function round1(n){ return Math.round(n*10)/10; }
function pick(rng, arr){ return arr[Math.floor(rng()*arr.length)]; }

// -----------------------------
// Date / zodiac helpers
// -----------------------------
function toDateParts(dateStr){
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if(!m) return null;
  return { y:+m[1], mo:+m[2], d:+m[3] };
}

// Western zodiac
function zodiacByMonthDay(mo, d){
  if((mo==1 && d<20) || (mo==12 && d>=22)) return "염소자리";
  if((mo==1 && d>=20) || (mo==2 && d<19)) return "물병자리";
  if((mo==2 && d>=19) || (mo==3 && d<21)) return "물고기자리";
  if((mo==3 && d>=21) || (mo==4 && d<20)) return "양자리";
  if((mo==4 && d>=20) || (mo==5 && d<21)) return "황소자리";
  if((mo==5 && d>=21) || (mo==6 && d<22)) return "쌍둥이자리";
  if((mo==6 && d>=22) || (mo==7 && d<23)) return "게자리";
  if((mo==7 && d>=23) || (mo==8 && d<23)) return "사자자리";
  if((mo==8 && d>=23) || (mo==9 && d<24)) return "처녀자리";
  if((mo==9 && d>=24) || (mo==10 && d<24)) return "천칭자리";
  if((mo==10 && d>=24) || (mo==11 && d<23)) return "전갈자리";
  if((mo==11 && d>=23) || (mo==12 && d<22)) return "사수자리";
  return "염소자리";
}

function chineseZodiac(year){
  const animals = ["원숭이","닭","개","돼지","쥐","소","호랑이","토끼","용","뱀","말","양"];
  const idx = ((year - 2016) % 12 + 12) % 12;
  return animals[idx];
}

function lifePathNumber(y, mo, d){
  const s = String(y) + String(mo).padStart(2,"0") + String(d).padStart(2,"0");
  let sum = 0;
  for(const ch of s) sum += ch.charCodeAt(0) - 48;
  while(sum > 9){
    let t=0;
    for(const ch of String(sum)) t += ch.charCodeAt(0) - 48;
    sum = t;
  }
  return sum === 0 ? 9 : sum;
}

function bmi(heightCm, weightKg){
  const h = heightCm / 100;
  return weightKg / (h*h);
}

// -----------------------------
// Text banks
// -----------------------------
const toneTitles = [
  { key:"상승", desc:"올해는 '각성'과 '확장'의 기운이 강합니다." },
  { key:"안정", desc:"올해는 '정리'와 '견고함'이 운을 만듭니다." },
  { key:"변화", desc:"올해는 '전환'과 '실험'이 핵심입니다." },
  { key:"집중", desc:"올해는 '선택'과 '몰입'이 성과로 연결됩니다." },
  { key:"회복", desc:"올해는 '리셋'과 '회복'이 다음 도약을 준비합니다." }
];

const workBank = [
  "상반기에는 계획을 '작게 쪼개서' 실행할수록 결과가 빨리 붙습니다. 큰 판보다 작은 승리를 반복해보세요.",
  "올해는 협업 운이 좋습니다. 혼자 끌고 가기보다 역할을 분리하면 속도가 확 올라갑니다.",
  "새 도구/기술을 익히는 흐름이 강합니다. 익숙한 방식 80%, 실험 20%가 안전한 조합이에요.",
  "초반에 방향 재조정 이벤트가 있을 수 있습니다. 바꾸는 걸 실패가 아니라 업데이트로 보세요.",
  "결정해야 할 순간에는 '가장 단순한 다음 행동'이 답일 때가 많습니다. 한 단계만 줄여보세요."
];

const moneyBank = [
  "금전운은 '새는 구멍 막기'에서 크게 올라갑니다. 구독/고정비를 한 번만 정리해도 체감이 큽니다.",
  "현금흐름을 안정시키면 운이 좋아집니다. 변동지출 상한선을 정해두면 마음이 편해져요.",
  "기회비용을 계산하는 습관이 돈을 지켜줍니다. '시간 1시간의 값'을 기준으로 결정을 해보세요.",
  "단기 유행보다 누적형 선택이 유리합니다. 작게라도 꾸준히 쌓는 구조가 올해의 키워드예요.",
  "비교 소비를 줄일수록 운이 좋아집니다. '나에게 필요한 기준'을 문장으로 정해두면 흔들림이 줄어요."
];

const loveBank = [
  "관계운은 '말의 온도'가 좌우합니다. 중요한 얘기는 피곤할 때 말고, 컨디션 좋은 시간에 잡아보세요.",
  "올해는 자연스럽게 가까워지는 인연이 있습니다. 억지로 당기기보다 '빈도'를 조금만 늘리면 충분해요.",
  "경계 설정(선 긋기)이 오히려 관계를 편하게 만듭니다. 기대치를 맞추면 갈등이 크게 줄어요.",
  "친한 사이일수록 작은 약속을 지키는 게 운을 올립니다. '사소한 신뢰'가 올해의 큰 복입니다.",
  "내가 원하는 것/싫은 것을 또렷하게 말할수록 좋은 방향으로 흘러갑니다."
];

const healthBank = [
  "컨디션은 '수면 + 루틴'이 결정합니다. 늦게 자는 날이 있어도 기상 시간을 고정하면 회복이 빨라요.",
  "올해는 과로가 누적되기 쉬우니 '중간 점검'이 필요합니다. 주 1회는 의도적으로 속도를 낮춰보세요.",
  "운동은 강도보다 빈도가 중요합니다. 20분이라도 자주 하는 쪽이 체감이 커요.",
  "카페인 타이밍 조정이 도움이 됩니다. 오후 늦게만 피해도 수면 질이 달라질 수 있어요.",
  "집중력이 떨어질 때는 의지보다 환경 문제일 때가 많습니다. 작업 공간을 단순화해보세요."
];

const adviceBank = [
  "올해의 승부수는 '작게 시작해서 크게 키우기'입니다.",
  "속도가 아니라 '지속가능한 리듬'이 결과를 만듭니다.",
  "선택을 줄이면 에너지가 남고, 에너지가 남으면 운이 좋아집니다.",
  "관계는 자산입니다. 연결을 관리하면 기회가 따라옵니다.",
  "완벽보다 '완료'가 더 강력합니다. 끝낸 것만이 나를 바꿉니다."
];

const monthFocus = [
  "1~2월: 정리/정돈", "3~4월: 시동/실험", "5~6월: 확장/협업",
  "7~8월: 집중/몰입", "9~10월: 수확/정산", "11~12월: 리셋/재설계"
];

// -----------------------------
// DOM
// -----------------------------
const form = document.getElementById("fortuneForm");
const errorBox = document.getElementById("errorBox");
const resultCard = document.getElementById("resultCard");

const headline = document.getElementById("headline");
const summaryEl = document.getElementById("summary");
const pillRow = document.getElementById("pillRow");
const scoreGrid = document.getElementById("scoreGrid");

const workText = document.getElementById("workText");
const moneyText = document.getElementById("moneyText");
const loveText = document.getElementById("loveText");
const healthText = document.getElementById("healthText");
const adviceText = document.getElementById("adviceText");
const debugQuote = document.getElementById("debugQuote");

const randomBtn = document.getElementById("randomBtn");

function showError(msg){
  errorBox.style.display = "block";
  errorBox.textContent = msg;
  resultCard.style.display = "none";
}
function clearError(){
  errorBox.style.display = "none";
  errorBox.textContent = "";
}

function makeScoreTile(label, value){
  const el = document.createElement("div");
  el.className = "score";
  el.innerHTML = `
    <p class="k">${label}</p>
    <p class="v">${value}<span style="font-size:12px;color:var(--muted)"> / 100</span></p>
    <div class="bar"><div></div></div>
  `;
  requestAnimationFrame(() => {
    el.querySelector(".bar > div").style.width = value + "%";
  });
  return el;
}

// -----------------------------
// Fortune generation
// -----------------------------
function computeFortune({name, birth, height, weight}){
  const nm = normalize(name);
  const parts = toDateParts(birth);
  if(!nm) return { error:"이름을 입력해주세요." };
  if(!parts) return { error:"생년월일을 올바르게 입력해주세요." };

  const h = Number(height);
  const w = Number(weight);
  if(!Number.isFinite(h) || h < 50 || h > 250) return { error:"키(cm)를 50~250 사이로 입력해주세요." };
  if(!Number.isFinite(w) || w < 10 || w > 250) return { error:"몸무게(kg)를 10~250 사이로 입력해주세요." };

  const zodiac = zodiacByMonthDay(parts.mo, parts.d);
  const cz = chineseZodiac(parts.y);
  const lp = lifePathNumber(parts.y, parts.mo, parts.d);

  const bmiVal = bmi(h, w);
  const bmiRounded = round1(bmiVal);

  // seed: 입력 + "2026" 고정
  const seedStr = `${nm}|${birth}|${h}|${w}|2026`;
  const seed = fnv1a32(seedStr);
  const rng = mulberry32(seed);

  // flavor bias (재미용)
  const bmiBias =
    (bmiVal >= 18.5 && bmiVal < 25) ? 6 :
    (bmiVal >= 25 && bmiVal < 30) ? -2 :
    (bmiVal < 18.5) ? -1 : -4;
  const lpBias = (lp - 5) * 2; // -8 ~ +8

  const tone = pick(rng, toneTitles);
  const focus = pick(rng, monthFocus);

  // scores (0~100)
  const workScore   = Math.round(clamp(55 + (rng()-0.5)*60 + lpBias, 0, 100));
  const moneyScore  = Math.round(clamp(50 + (rng()-0.5)*60 + (lpBias/2), 0, 100));
  const loveScore   = Math.round(clamp(52 + (rng()-0.5)*60 + (rng()-0.5)*10, 0, 100));
  const healthScore = Math.round(clamp(58 + (rng()-0.5)*60 + bmiBias, 0, 100));

  // texts
  const work = pick(rng, workBank);
  const money = pick(rng, moneyBank);
  const love = pick(rng, loveBank);
  const healthBase = pick(rng, healthBank);

  // BMI 기반 "부드러운" 문구만 추가 (의학 조언 X)
  let health = healthBase;
  if(bmiVal < 18.5){
    health += " 너무 빡세게 달리기보다는, 식사/휴식의 리듬부터 잡는 편이 좋습니다.";
  } else if(bmiVal >= 25 && bmiVal < 30){
    health += " 루틴을 '가볍게, 꾸준히' 가져가면 체감 성과가 잘 나옵니다.";
  } else if(bmiVal >= 30){
    health += " 부담 큰 목표보다, 작게 시작해서 유지하는 쪽이 훨씬 유리합니다.";
  } else {
    health += " 지금의 밸런스를 유지하는 게 올해 최고의 전략이에요.";
  }

  const advice = pick(rng, adviceBank);

  const summaryText =
    `${nm}님의 2026년 키워드는 '${tone.key}'입니다. ${tone.desc} ` +
    `특히 ${focus} 구간에서 흐름이 좋아질 가능성이 큽니다.`;

  return {
    seedStr, seed,
    nm, birth, h, w,
    zodiac, cz, lp,
    bmiRounded,
    tone, focus,
    scores: { workScore, moneyScore, loveScore, healthScore },
    texts: { work, money, love, health, advice, summaryText }
  };
}

let lastFortuneData = null;

function renderFortune(data){
  lastFortuneData = data;

  headline.textContent = `2026 운세 · ${data.nm}님`;
  summaryEl.textContent = data.texts.summaryText;

  pillRow.innerHTML = "";
  const pills = [
    `별자리: ${data.zodiac}`,
    `띠: ${data.cz}`,
    `라이프패스: ${data.lp}`,
    `BMI: ${data.bmiRounded}`
  ];
  for(const p of pills){
    const el = document.createElement("div");
    el.className = "pill";
    el.textContent = p;
    pillRow.appendChild(el);
  }

  scoreGrid.innerHTML = "";
  scoreGrid.appendChild(makeScoreTile("일/학업", data.scores.workScore));
  scoreGrid.appendChild(makeScoreTile("금전", data.scores.moneyScore));
  scoreGrid.appendChild(makeScoreTile("연애/관계", data.scores.loveScore));
  scoreGrid.appendChild(makeScoreTile("건강/컨디션", data.scores.healthScore));

  workText.textContent = data.texts.work;
  moneyText.textContent = data.texts.money;
  loveText.textContent = data.texts.love;
  healthText.textContent = data.texts.health;
  adviceText.textContent = data.texts.advice;

  debugQuote.textContent =
`[생성 근거 요약]
- seed: ${data.seed} (입력값 기반 결정론)
- 입력: ${data.seedStr}
- 별자리: ${data.zodiac} / 띠: ${data.cz} / 라이프패스: ${data.lp} / BMI: ${data.bmiRounded}
- 올해 키워드: ${data.tone.key} / 포커스: ${data.focus}`;

  resultCard.style.display = "block";
  resultCard.scrollIntoView({ behavior:"smooth", block:"start" });
}

// -----------------------------
// Form events
// -----------------------------
form.addEventListener("submit", (e) => {
  e.preventDefault();
  clearError();

  const payload = {
    name: document.getElementById("name").value,
    birth: document.getElementById("birth").value,
    height: document.getElementById("height").value,
    weight: document.getElementById("weight").value
  };

  const res = computeFortune(payload);
  if(res.error){
    showError(res.error);
    return;
  }
  renderFortune(res);
});

randomBtn.addEventListener("click", () => {
  const samples = [
    { name:"김준휘", birth:"1999-11-02", height:175, weight:68.5 },
    { name:"홍길동", birth:"2001-03-14", height:172, weight:70.2 },
    { name:"이서연", birth:"1998-07-09", height:162, weight:54.0 }
  ];
  const s = samples[Math.floor(Math.random()*samples.length)];
  document.getElementById("name").value = s.name;
  document.getElementById("birth").value = s.birth;
  document.getElementById("height").value = s.height;
  document.getElementById("weight").value = s.weight;

  clearError();
  const res = computeFortune(s);
  if(!res.error) renderFortune(res);
});

// -----------------------------
// Theme (Dark/Light) toggle
// -----------------------------
const THEME_KEY = "fortune_theme";
const themeBtn = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeText = document.getElementById("themeText");

function applyTheme(theme){
  if(theme === "light"){
    document.body.setAttribute("data-theme", "light");
    themeIcon.textContent = "☀️";
    themeText.textContent = "라이트";
  } else {
    document.body.removeAttribute("data-theme");
    themeIcon.textContent = "🌙";
    themeText.textContent = "다크";
  }
}

function getInitialTheme(){
  const saved = localStorage.getItem(THEME_KEY);
  if(saved === "light" || saved === "dark") return saved;

  const prefersLight = window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches;

  return prefersLight ? "light" : "dark";
}

let currentTheme = getInitialTheme();
applyTheme(currentTheme);

themeBtn.addEventListener("click", () => {
  currentTheme = (currentTheme === "light") ? "dark" : "light";
  localStorage.setItem(THEME_KEY, currentTheme);
  applyTheme(currentTheme);
});

// -----------------------------
// 카카오톡 공유
// -----------------------------
// 카카오 개발자 사이트에서 JavaScript 키를 발급받아 아래에 입력하세요
// https://developers.kakao.com/console/app
const KAKAO_JS_KEY = "YOUR_KAKAO_JAVASCRIPT_KEY";

let kakaoInitialized = false;

function initKakao(){
  if(kakaoInitialized) return true;
  if(KAKAO_JS_KEY === "YOUR_KAKAO_JAVASCRIPT_KEY"){
    alert("카카오 JavaScript 키를 설정해주세요.\n\n1. https://developers.kakao.com 에서 앱 등록\n2. 앱 키 > JavaScript 키 복사\n3. main.js에서 KAKAO_JS_KEY 값 수정");
    return false;
  }
  try {
    Kakao.init(KAKAO_JS_KEY);
    kakaoInitialized = true;
    return true;
  } catch(e) {
    console.error("카카오 SDK 초기화 실패:", e);
    alert("카카오 SDK 초기화에 실패했습니다.");
    return false;
  }
}

function shareToKakao(){
  if(!lastFortuneData){
    alert("먼저 운세를 생성해주세요.");
    return;
  }
  if(!initKakao()) return;

  const { nm, tone, scores, texts } = lastFortuneData;
  const avgScore = Math.round((scores.workScore + scores.moneyScore + scores.loveScore + scores.healthScore) / 4);

  Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: `${nm}님의 2026 운세`,
      description: `올해 키워드: ${tone.key} | 종합점수: ${avgScore}점\n${texts.advice}`,
      imageUrl: "https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png",
      link: {
        mobileWebUrl: window.location.href,
        webUrl: window.location.href
      }
    },
    buttons: [
      {
        title: "나도 운세 보기",
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href
        }
      }
    ]
  });
}

document.getElementById("kakaoShareBtn").addEventListener("click", shareToKakao);
