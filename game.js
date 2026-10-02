(() => {
  'use strict';

  const WORLD = 12000;
  const VIEW = 2200;
  const WIDTH = 1280;
  const HEIGHT = 720;
  const PLAY_TOP = 118;
  const PLAY_BOTTOM = 672;
  const PILOTS = [
    {name: 'C.J.', color: '#37a6ff', filter: 'none', speed:1,shield:0,rescue:0,cargo:0},
    {name: 'Michael', color: '#ff8a36', filter: 'hue-rotate(210deg) saturate(1.35)', speed:1.07,shield:0,rescue:0,cargo:0},
    {name: 'Princess Nicole', color: '#ff3ba8', filter: 'hue-rotate(150deg) saturate(1.75)', speed:1.19,shield:1,rescue:30,cargo:1},
    {name: 'Zachary', color: '#5aff85', filter: 'hue-rotate(300deg) saturate(1.35)', speed:1.04,shield:0,rescue:12,cargo:0}
  ];
  const COLORS = {night:'#080b20',sky:'#0b1030',pale:'#d2eef7',cyan:'#56dffc',pink:'#ff45aa',green:'#6bff9c',gold:'#ffbf5c',orange:'#ff9138'};
  const WEAPONS = {
    blaster:{name:'BLASTER',color:'#ffbf5c',pack:0,rate:.17},
    spread:{name:'FAN CANNON',color:'#ff8e43',pack:24,rate:.42,desc:'FIVE-WAY SPREAD'},
    seeker:{name:'SEEKER PAIR',color:'#82ffb1',pack:12,rate:.72,desc:'HOMING MISSILES'},
    rail:{name:'PIERCER',color:'#7cddff',pack:18,rate:.34,desc:'PIERCES MULTIPLE TARGETS'},
    twin:{name:'TWIN LASERS',color:'#ff71ec',pack:34,rate:.12,desc:'RAPID PAIRED SHOTS'},
    plasma:{name:'PLASMA BOMB',color:'#b98cff',pack:12,rate:.62,desc:'AREA SHOCKWAVE'},
    nova:{name:'NOVA BURST',color:'#ffe978',pack:10,rate:.85,desc:'EIGHT-WAY BURST'}
  };
  const WEAPON_ORDER=['blaster','spread','seeker','rail','twin','plasma','nova'];
  const BOSS_TYPES=[
    {id:'manta',name:'DREAD MANTA',color:'#ff5cb6'},
    {id:'serpent',name:'VOID SERPENT',color:'#79ffca'},
    {id:'citadel',name:'PRISM CITADEL',color:'#75dfff'},
    {id:'eclipse',name:'ECLIPSE MOTHER',color:'#ffb867'}
  ];
  const SECTORS=[
    {name:'VIOLET DUSK',sky:['#090d2a','#161039','#23113b'],mountains:['#23133b','#31123f'],ground:'#0c2d35',rim:'#56dffc',star:'#7aadd1',world:'#a56bff'},
    {name:'EMERALD VEIL',sky:['#041c2a','#103249','#173c3b'],mountains:['#114057','#16494a'],ground:'#0b3538',rim:'#6bffcf',star:'#b0ffe8',world:'#7fffbf'},
    {name:'CRIMSON ORBIT',sky:['#180b2a','#3b153c','#51203b'],mountains:['#3c1b46','#52213d'],ground:'#35213a',rim:'#ff9b72',star:'#ffd4a3',world:'#ff767d'},
    {name:'AZURE ECLIPSE',sky:['#061730','#0c2b56','#19254d'],mountains:['#182f5d','#163c66'],ground:'#112d49',rim:'#8be6ff',star:'#c1f6ff',world:'#79c5ff'}
  ];
  const $ = id => document.getElementById(id);
  const frame = $('gameFrame');
  const canvas = $('gameCanvas');
  const ctx = canvas.getContext('2d', {alpha:false});
  const titleScreen = $('titleScreen');
  const pauseScreen = $('pauseScreen');
  const gameOverScreen = $('gameOverScreen');
  const hangarScreen = $('hangarScreen');
  const commsElement = $('comms');
  const commsPortrait = $('commsPortrait');
  const commsName = $('commsName');
  const commsText = $('commsText');
  const commsChannel = $('commsChannel');
  const commsTimer = $('commsTimer');
  const cards = [...document.querySelectorAll('.pilot-card')];
  const assets = {};
  for (const [key, file] of Object.entries({ship:'ship.png',raider:'raider.png',settler:'settler.png',interceptor:'alien-interceptor.svg',spore:'alien-spore.svg',phantom:'alien-phantom.svg',starburst:'alien-starburst.svg',bossManta:'boss-manta.svg',bossSerpent:'boss-serpent.svg',bossCitadel:'boss-citadel.svg',bossEclipse:'boss-eclipse.svg'})) {
    const image = new Image(); image.src = `assets/${file}`; assets[key] = image;
  }

  const music = {
    menu: new Audio('assets/menu-loop.wav'),
    flight: new Audio('assets/flight-loop.wav'),
    danger: new Audio('assets/danger-loop.wav'),
    boss: new Audio('assets/boss-loop.wav')
  };
  for (const track of Object.values(music)) {track.loop = true; track.volume = 0; track.preload = 'auto';}
  const cues = {
    select: new Audio('assets/pilot-select.wav'),
    launch: new Audio('assets/launch.wav'),
    over: new Audio('assets/game-over.wav')
  };
  for (const cue of Object.values(cues)) {cue.volume = 0.55; cue.preload = 'auto';}
  let soundOn = true;
  const voiceSupported = !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
  let voiceOn = voiceSupported;
  let soundUnlocked = false;
  let audioContext = null;
  let currentTrack = null;
  function unlockAudio() {
    soundUnlocked = true;
    if (!audioContext && (window.AudioContext || window.webkitAudioContext)) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext && audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    if (soundOn && !currentTrack) setMusic(state.phase === 'playing' ? 'flight' : 'menu');
  }
  function setMusic(which) {
    currentTrack = which;
    if (which && soundOn && soundUnlocked && music[which].paused) music[which].play().catch(() => {});
  }
  function updateMusic(dt) {
    if (state.phase === 'playing' && !state.paused) {
      const boss = state.enemies.some(e => e.type === 'boss');
      const danger = state.civilians.some(c => c.state === 'player') || state.haven < 45 || state.havenUnderAttack > 0;
      const wanted = boss ? 'boss' : danger ? 'danger' : 'flight';
      if (wanted !== currentTrack) setMusic(wanted);
    }
    const level = radioActive ? .22 : .34;
    for (const [name,track] of Object.entries(music)) {
      const target = soundOn && soundUnlocked && currentTrack === name ? level : 0;
      track.volume += (target - track.volume) * Math.min(1,dt*3.2);
      if (target > 0 && track.paused) track.play().catch(() => {});
      if (target === 0 && track.volume < .005 && !track.paused) track.pause();
    }
  }
  function cue(which) {
    if (!soundOn || !soundUnlocked) return;
    const audio = cues[which];
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }
  function tone(frequency, duration = 0.12, volume = 0.12, slide = 0) {
    if (!soundOn || !soundUnlocked || !audioContext) return;
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(frequency, now);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(45,frequency * slide), now + duration);
    gain.gain.setValueAtTime(Math.max(0.001,volume), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain).connect(audioContext.destination);
    osc.start(now); osc.stop(now + duration + 0.01);
  }
  function toggleSound() {
    unlockAudio();
    soundOn = !soundOn;
    $('soundButton').textContent = soundOn ? '♪ SOUND ON' : '♪ SOUND OFF';
    if (soundOn) setMusic(state.phase === 'playing' && !state.paused ? 'flight' : 'menu');
    else {setMusic(null);stopVoice();}
    if(soundOn&&radioActive&&voiceOn){const needed=radioActive.text.split(/\s+/).length*.42+1.5;radioDuration=Math.max(radioDuration,needed);radioLeft=Math.max(radioLeft,needed);radioElapsed=0;speakRadio(radioActive);}
  }
  let radioVoicePending = false;
  let radioVoiceSerial = 0;
  function stopVoice() {
    radioVoiceSerial++;
    radioVoicePending=false;
    if(voiceSupported)window.speechSynthesis.cancel();
  }
  function chooseVoice(role) {
    const voices=window.speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang));
    if(!voices.length)return null;
    const female=role==='pilot'&&state.pilot===2;
    const femaleNames=/Zira|Samantha|Aria|Jenny|Susan|Hazel|Victoria|Karen|Moira|Fiona|Tessa|Ava|Female/i;
    const maleNames=/David|Mark|Guy|George|Daniel|Alex|Matthew|Brian|Eric|Ryan|James|Oliver|Evan|Christopher|Thomas|Andrew|Aaron|Arthur|Fred|Ralph|Bruce|Albert|Male/i;
    const matches=voices.filter(v=>(female?femaleNames:maleNames).test(v.name));
    if(!matches.length)return null;
    const index=role==='hq'?0:state.pilot===0?1:state.pilot===1?2:state.pilot===3?3:0;
    return matches[index%matches.length];
  }
  function speakRadio(message) {
    if(!voiceSupported||!voiceOn||!soundOn||!soundUnlocked)return;
    stopVoice();
    const serial=radioVoiceSerial;
    const utterance=new window.SpeechSynthesisUtterance(message.text);
    utterance.lang='en-US';
    utterance.voice=chooseVoice(message.role);
    utterance.rate=message.role==='hq'?.9:state.pilot===3?1.08:1;
    utterance.pitch=message.role==='hq'?.72:[.96,.9,1.18,1.07][state.pilot];
    utterance.volume=.92;
    radioVoicePending=true;
    const finished=()=>{if(serial===radioVoiceSerial&&radioActive===message)radioVoicePending=false;};
    utterance.onend=finished;
    utterance.onerror=finished;
    try {window.speechSynthesis.speak(utterance);} catch(error) {finished();console.warn('Radio speech could not start:',error);}
  }
  function toggleVoice() {
    if(!voiceSupported)return;
    unlockAudio();
    voiceOn=!voiceOn;
    const button=$('voiceButton');
    button.textContent=voiceOn?'◖ VOICE ON':'◖ VOICE OFF';
    button.setAttribute('aria-pressed',String(voiceOn));
    if(voiceOn&&radioActive){window.speechSynthesis.resume();const needed=radioActive.text.split(/\s+/).length*.42+1.5;radioDuration=Math.max(radioDuration,needed);radioLeft=Math.max(radioLeft,needed);radioElapsed=0;speakRadio(radioActive);}
    else stopVoice();
  }

  const keys = new Set();
  const touch = {up:false,down:false,left:false,right:false,fire:false,turbo:false};
  const touchCapable = navigator.maxTouchPoints > 0 || window.matchMedia('(any-pointer: coarse)').matches;
  document.documentElement.classList.toggle('touch-device', touchCapable);
  let mouseFire = false;
  let gamepadFire = false;
  let gamepadTurbo = false;
  let gamepadX = 0;
  let gamepadY = 0;
  let previousGamepadButtons = [];
  const state = {
    phase:'title', paused:false, pilot:0, score:0, lives:4, wave:1, waveElapsed:0, saved:0, lost:0, autoFire:false,
    rescueStreak:0, waveTimer:-1, notice:'', noticeTime:0, bossIntroTime:0, time:0, lastRescueTime:0, lastHurryTime:0, lastNicolePraiseTime:0, kills:0,
    haven:100,havenUnderAttack:0,upgrades:{engine:0,turbo:0,shield:0,rescue:0},
    mission:null,rescueChallenge:null,hazard:null,hazardTimer:0,trail:[],trailTick:0,celebrations:[],
    player:{x:0,z:-130,vx:0,vz:0,facing:1,invuln:0,fireTimer:0,shield:0,abilityTime:0,abilityCooldown:0,turboEnergy:100,turboLocked:false,turboActive:false},
    civilians:[], enemies:[], shots:[], pickups:[], weaponDrops:[], weapon:'blaster', weaponAmmo:{spread:0,seeker:0,rail:0,twin:0,plasma:0,nova:0}, weaponDropCount:0,
    nicoleStoryIndex:0, nicoleStoryNextTime:22, nicoleStoryOrder:[]
  };
  const SCORE_KEY='starguard.topScores.v1';
  function loadScores() {
    try {
      const rows=JSON.parse(window.localStorage?.getItem(SCORE_KEY)||'[]');
      if(!Array.isArray(rows))return [];
      return rows.map(row=>({initials:String(row.initials||'').toUpperCase().replace(/[^A-Z]/g,'').slice(0,3)||'ACE',score:Math.max(0,Math.floor(Number(row.score)||0))})).sort((a,b)=>b.score-a.score).slice(0,5);
    } catch {return [];}
  }
  const topScores=loadScores();
  let scoreSaved=false;
  const scoreText=score=>String(score).padStart(6,'0');
  function refreshScoreViews() {
    const top=scoreText(topScores[0]?.score||0);
    $('titleTopScore').textContent=`TOP SCORE ${top}`;
    $('gameOverTopScore').textContent=`TOP SCORE ${top}`;
    $('leaderboard').innerHTML=topScores.length?topScores.map(row=>`<li>${row.initials}<span>${scoreText(row.score)}</span></li>`).join(''):'<li>BE THE FIRST PILOT</li>';
  }
  function saveScore() {
    if(state.phase!=='gameover'||scoreSaved)return;
    const input=$('initialsInput');
    const initials=input.value.toUpperCase().replace(/[^A-Z]/g,'').slice(0,3);
    if(!initials){input.focus();return;}
    topScores.push({initials,score:state.score});topScores.sort((a,b)=>b.score-a.score);topScores.length=Math.min(5,topScores.length);
    try {window.localStorage?.setItem(SCORE_KEY,JSON.stringify(topScores));} catch {}
    scoreSaved=true;$('scoreEntry').classList.add('hidden');$('scoreSavedNote').classList.remove('hidden');refreshScoreViews();$('restartButton').focus({preventScroll:true});
  }
  function toggleAutoFire() {
    unlockAudio();
    state.autoFire=!state.autoFire;
    const button=$('autoFireButton');
    button.textContent=state.autoFire?'◎ AUTO FIRE ON':'◎ AUTO FIRE OFF';
    button.setAttribute('aria-pressed',String(state.autoFire));
    if(state.phase==='playing')frame.focus({preventScroll:true});
  }

  const PILOT_PORTRAITS = ['pilot-cj.jpg','pilot-michael.jpg','pilot-nicole.jpg','pilot-zachary.jpg'];
  const RADIO_LINES = {
    makeup: {
      hq:["Nicole, stop putting your makeup on while you're flying the ship! Eyes on the sky!"],
      pilot:["I'm looking, Vega! Just one last touch-up... okay, makeup away."]
    },
    daddyMiss: {
      hq:["Nicole, your signal is strong. What's on your mind out there?"],
      pilot:["I miss Daddy. Gotta make it home alive!"]
    },
    footballDrop: {
      hq:["Nicole, can you take the next rescue route?"],
      pilot:["I'll rescue the settlers, just have to drop Michael off at football practice on the way!"]
    },
    valorPickup: {
      hq:["Nicole, another group needs a ride east of Haven One."],
      pilot:["Heading that way, but I have to pick up Zach from Valor on the way there!"]
    },
    breakfastTaco: {
      hq:["Nicole, do you have time for one more rescue run?"],
      pilot:["On my way, but I have to give Daddy his breakfast taco real quick or he'll be grumpy all day."]
    },
    dinner: {
      hq:["Nicole, Daddy said to make it home safe for dinner, and bring him a taco!"],
      pilot:["Copy that. Tell Daddy I'm bringing the taco—and a few settlers home with me!"]
    },
    kendra: {
      hq:["Nicole, get off that video call with Kendra! You're gonna crash the ship again!"],
      pilot:["Oopsies, you caught me!"]
    },
    daddyText: {
      hq:["Nicole, Daddy just texted you. He says he wants you to send him a pic."],
      pilot:["Snapping one now!"]
    },
    wholeFoods: {
      hq:["Nicole, are you coming straight back to Haven One?"],
      pilot:["I'll bring everyone home, but I have to make a stop at Whole Foods on the way."]
    },
    amazonReturn: {
      hq:["Nicole, are you taking the next settler pickup?"],
      pilot:["I'll pick up the settlers, but I have to drop off an Amazon return on the way."]
    },
    hebOrder: {
      hq:["Nicole, your heading drifted. What happened in that cockpit?"],
      pilot:["Sorry, Vega! I was putting in an H.E.B. curbside order while flying."]
    },
    diamondRing: {
      hq:["Nicole, that was almost a collision. What blinded you?"],
      pilot:["An alien laser reflected off my giant diamond ring. I almost crashed!"]
    },
    footballFlyover: {
      hq:["Nicole, radar says you changed course. Everything okay?"],
      pilot:["I'm doing a quick flyover at Michael's football game, then I'm back to the settlers!"]
    },
    silver: {
      hq:["Nicole, that alien fire clipped your ship. Are you hurt?"],
      pilot:["I just took alien fire! I'll put some colloidal silver on the wound after I land."]
    },
    marketplace: {
      hq:["Nicole, why is your route bending around the old trading outpost?"],
      pilot:["Quick detour. I need to pick something up from Facebook Marketplace. The settlers can ride shotgun!"]
    },
    swayze: {
      hq:["Nicole, did you spot something on that passing fighter?"],
      pilot:["Wow, that pilot looked like Patrick Swayze! I almost forgot we were in a dogfight."]
    },
    church: {
      hq:["Nicole, the raiders are closing in. How fast can you clear this lane?"],
      pilot:["Fast enough to make it to church on time. Let's move!"]
    },
    footSoak: {
      hq:["That alien just turned tail and ran, Nicole."],
      pilot:["Maybe he heard I soaked my feet today. Even my boots are intimidating!"]
    },
    backseat: {
      hq:["Nicole, I hear a lot of chatter from your passenger cabin."],
      pilot:["These kids in the back are driving me crazy. I should drop them at the settlement before they start a band!"]
    },
    brinks: {
      hq:["Nicole, Brinks Home Security just called. Your alarm at FrouFrou is going off!"],
      pilot:["Flying by now. If there are intruders at FrouFrou, they're about to meet the pink ship!"]
    },
    photoAngle: {
      hq:["Nicole, your camera is broadcasting a live view of the nebula."],
      pilot:["Good! Daddy asked for a picture. I found my good side and the galaxy's."]
    },
    shoppingList: {
      hq:["Nicole, your grocery list is mixed into the target computer."],
      pilot:["Oops. If the aliens want avocados, they'll have to wait in line like everyone else."]
    },
    hair: {
      hq:["Nicole, your evasive turn set a new flight record."],
      pilot:["And my hair stayed perfect. That's the real miracle, Vega."]
    },
    botox: {
      hq:["Nicole, your cockpit camera says you're frowning at the raiders."],
      pilot:["These aliens are making me frown so much I might need extra Botox after this mission!"]
    },
    aesthetician: {
      hq:["Nicole, why is an aesthetician's kit next to the flight controls?"],
      pilot:["I work at FrouFrou, Vega. I'm prepared for a skin emergency and an alien emergency."]
    },
    facial: {
      hq:["Nicole, how are you staying so calm in that firefight?"],
      pilot:["A good facial before launch, a steady hand, and a very big blaster."]
    },
    tweezers: {
      hq:["Nicole, you threaded that ship through a tiny gap."],
      pilot:["I do detail work all day. My aesthetician hands can handle a little starship."]
    },
    sunscreen: {
      hq:["Nicole, the next sector has a bright binary sun."],
      pilot:["Good thing I packed sunscreen. Even space pilots need a skincare routine."]
    },
    dateNight: {
      hq:["Nicole, you sound eager to get this sector cleared."],
      pilot:["Daddy and I have date night. I need to finish these rescues and get ready!"]
    },
    daddyDinner: {
      hq:["Nicole, your home beacon just sent a dinner reminder."],
      pilot:["Daddy is making me dinner tonight! Let's get these settlers home before it gets cold."]
    },
    spoiled: {
      hq:["Nicole, someone left a gift for you at Haven One."],
      pilot:["Daddy likes to spoil me. Put it somewhere safe until I get back!"]
    },
    brows: {
      hq:["Nicole, those raiders are forming a crooked line."],
      pilot:["I've fixed worse eyebrows at FrouFrou. This formation is next."]
    },
    extraction: {
      hq:["Nicole, a raider is stuck right in the middle of our rescue lane."],
      pilot:["Time for an extraction. That's a word I know from work and from flying."]
    },
    briefing: {
      hq:['Starguard, settlers are stranded beyond Haven One. Raider ships are closing in. Find our people, bring them home, and leave no one behind.'],
      pilot:['Copy, Commander. Bringing them home.','Ready for kickoff. No settler left behind.','I am on my way. We will bring them home.','Valor training is online. I am ready.']
    },
    launch: {
      hq:['Starguard, the settlers are counting on us. Bring them home.'],
      pilot:["I'm on my way, Command.","Copy that. Let's light up the sky.","No one gets left behind. I'm on my way.","Radar's up. I'll bring them home."]
    },
    pickup: {
      hq:['We see a settler aboard. Bring them to the Haven One pad!','Good pickup, pilot. The landing pad is ready.'],
      pilot:['Hold tight. I know the way home.','One passenger, express service!','Hang on. I have you.','Coming in with precious cargo.']
    },
    rescue: {
      hq:['Great job rescuing that settler! Haven One is cheering.','Another life saved. Outstanding flying, pilot!','Safe on the ground. That is how we win this.'],
      pilot:['Another one home. Heading back out.','That is what we are here for.','Safe and sound. Who is next?','One more for the home team.']
    },
    freed: {
      hq:['Nice shot! That captive is falling. Go get them!'],
      pilot:['I see them. Diving in!','On it, Command!','I have their position.','I can catch them!']
    },
    lost: {
      hq:['A settler was just lost. Tighten the patrol, Starguard!','We lost someone to the raiders. Do not let them take another.'],
      pilot:["I saw it. I won't let the next one slip away.",'Understood. I am turning this around.','That one hurts. I am moving faster.','Copy. I will cover the ground.']
    },
    hit: {
      hq:['Your ship took a hit! Stay sharp out there.'],
      pilot:['That was close. I am still in the fight.','Still flying. They will not get a second chance.','I am okay, Command. Back on mission.','I am not done yet.']
    },
    hurry: {
      hq:['Hurry, Starguard. Our people are still out there!','Command to pilot: check the radar. Settlers need you now.'],
      pilot:["I'm on it. Scanning the radar.",'Picking up the pace.','I hear you. Heading for the next signal.','Moving now, Command.']
    },
    clear: {
      hq:['Sector clear! New hostiles are already on the scope.'],
      pilot:['Ready for the next wave.','Bring them on.','I can do this all day.','Standing by for the next run.']
    },
    kill: {
      hq:['Clean flying, pilot. That drone is history.'],
      pilot:['Target down. Skies are safer.','Scratch one raider.','One less threat to our people.','That should slow them down.']
    },
    haven: {
      hq:['Haven One is under fire! Break off and defend the settlement!'],
      pilot:['Turning for home.','On my way to the settlement.','They will not touch our people.','Defending Haven One now.']
    },
    boss: {
      hq:['A capital raider is on radar. Its armor will take several hits!'],
      pilot:['I see the weak points.','Going in fast.','I can handle this monster.','Target acquired.']
    },
    mission: {
      hq:['New objective on your HUD. The clock is running!'],
      pilot:['I have the assignment.','Copy, Commander.','On it.','I see it on radar.']
    },
    success: {
      hq:['Optional mission complete! Bonus credits are yours.'],
      pilot:['Another job done.','That was worth the risk.','Glad we got there in time.','Objective complete.']
    },
    failure: {
      hq:['The objective timer expired. Keep protecting the settlers.'],
      pilot:['Understood. Staying on mission.','I will make up for it.','Copy. Eyes on the radar.','I am still in the fight.']
    },
    storm: {
      hq:['Hazard alert! Check the radar for dangerous terrain.'],
      pilot:['I see it. Adjusting course.','Flying carefully.','Keeping my shield ready.','Hazard marked.']
    },
    admire: {
      hq:['Princess Nicole, you look beautiful out there. Your pink ship lights up the sky!'],
      pilot:['Thanks, Commander. I have settlers to save.','Thanks! Watch me bring them home.','You are sweet, Command. Back to work!','Thank you. On with the mission.']
    }
  };
  const NICOLE_STORY=['makeup','daddyText','brinks','silver','marketplace','swayze','church','footSoak','footballFlyover','wholeFoods','amazonReturn','hebOrder','diamondRing','backseat','photoAngle','shoppingList','hair','daddyMiss','breakfastTaco','footballDrop','valorPickup','kendra','dinner','botox','aesthetician','facial','tweezers','sunscreen','dateNight','daddyDinner','spoiled','brows','extraction'];
  const NICOLE_PRAISE = {
    launch:'Princess Nicole, you look beautiful as ever. Your pink ship is cleared for launch!',
    pickup:'Beautiful flying, Nicole! Bring that settler home.',
    rescue:'Nicole, you are beautiful—and that rescue was dazzling!',
    freed:'Beautiful shot, Nicole! Now catch that falling settler.',
    lost:'Nicole, your courage is beautiful. Find the next settler—we need you.',
    hit:'Nicole, beautiful and brave. Your ship took a hit, but you are still flying!',
    hurry:'Beautiful Nicole, check your radar. Settlers need you right now!',
    clear:'Beautiful work, Nicole. We still have a long way to go—like your commute to FrouFrou in Austin!',
    kill:'Beautiful hit, Nicole! That raider is history.',
    haven:'Nicole, Haven One needs your beautiful flying. Defend the settlement!',
    boss:'Nicole, your bright pink ship looks beautiful. Take down that capital raider!',
    mission:'Beautiful pilot, new objective on your HUD. The clock is running!',
    success:'Beautifully done, Nicole! Those bonus credits are yours.',
    failure:'Nicole, you are still beautiful and brave. Keep protecting the settlers.',
    storm:'Nicole, even this storm cannot outshine you. Fly carefully!'
  };
  const MICHAEL_BANTER = {
    launch:'Michael, game time! Take the field and bring our settlers home.',
    pickup:'Nice catch, Michael! Run that settler into the Haven One end zone.',
    rescue:'Touchdown, Michael! Another settler safe at home.',
    freed:'Interception! That captive is free. Go make the catch, Michael!',
    lost:'The raiders scored one. Reset the defense, Michael.',
    hit:'Hard tackle, Michael. Shake it off and stay in the game.',
    hurry:'Clock is running, Michael. We need a two-minute drill!',
    clear:'First down and more to go, Michael. Next wave inbound.',
    kill:'Clean hit, Michael. That raider got sacked!',
    haven:'Defend the home field, Michael! Haven One is under fire.',
    boss:'Big opponent on radar. Time for a fourth-quarter comeback!',
    mission:'New play on the board, Michael. Run the objective.',
    success:'Touchdown! Beautiful execution, Michael.',
    failure:'The clock ran out on that play. Regroup, Michael.',
    storm:'Storm on the field, Michael. Keep your footing!'
  };
  const ZACHARY_BANTER = {
    launch:'Valor Flight School must be proud, Zachary. Show us what they taught you!',
    pickup:'Great pickup, Zachary! Those Valor rescue drills paid off.',
    rescue:'Textbook Valor Flight School flying, Zachary. Settler safe!',
    freed:'That shot looked like a VR training sim, Zachary. Catch that settler!',
    lost:'Even Valor cadets miss a run. Focus on the next rescue, Zachary.',
    hit:'All that VR practice paid off, Zachary. Keep those reflexes sharp!',
    hurry:'Valor taught you to move fast, Zachary. Settlers need you now!',
    clear:'Excellent sortie, Zachary. Valor Flight School gets a gold star.',
    kill:'Target down! Those VR hours really paid off, Zachary.',
    haven:'Defend Haven One, Zachary. Put that Valor training to work!',
    boss:'Boss fight, Zachary. VR practice meets the real thing!',
    mission:'New assignment, Zachary. Valor taught you the drill.',
    success:'Mission complete! Valor Flight School would be proud.',
    failure:'Even Valor pilots reset after a miss. Keep flying, Zachary.',
    storm:'Zachary, use those VR reflexes through the storm!'
  };
  const PERSONAL_RADIO = [null,MICHAEL_BANTER,NICOLE_PRAISE,ZACHARY_BANTER];
  const PILOT_REPLIES = {
    1:{launch:'Ready for kickoff, Command.',pickup:'I have the ball. Heading for the end zone!',rescue:'Touchdown! Going back for another.',kill:'That one is off the field.',boss:'Fourth quarter is mine.'},
    2:{launch:'Thanks, Commander. Let us save some people.',rescue:'You are sweet. Another one home!',admire:'Thanks, Command. I have settlers to save.'},
    3:{launch:'Valor training online. VR reflexes ready!',pickup:'Just like the simulator, only with real people.',rescue:'Valor taught me well! Heading back out.',kill:'Guess those VR hours counted.',boss:'This boss needs a new high score.'}
  };
  const radioQueue = [];
  const radioLastCalled = {};
  const radioShuffleBags = new Map();
  const RADIO_MIN_INTERVAL = 12;
  let radioActive = null;
  let radioReply = null;
  let lastVegaStart = -Infinity;
  let radioLeft = 0;
  let radioDuration = 0;
  let radioElapsed = 0;
  let radioVoiceDeadline = 0;
  let radioSequence = 0;
  function clearRadio() {
    radioQueue.length = 0;
    radioActive = null;
    radioReply = null;
    radioLeft = 0;
    commsElement.classList.add('hidden');
    stopVoice();
  }
  function pickRadioLine(key, options) {
    if (!options.length) return '';
    if (options.length === 1) return options[0];
    let bag = radioShuffleBags.get(key);
    if (!bag?.length) {
      const previous = bag?.previous;
      bag = options.map((_, index) => index);
      for (let index = bag.length - 1; index > 0; index--) {
        const swap = Math.floor(Math.random() * (index + 1));
        [bag[index], bag[swap]] = [bag[swap], bag[index]];
      }
      if (bag[bag.length - 1] === previous) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
      bag.previous = previous;
      radioShuffleBags.set(key, bag);
    }
    const index = bag.pop();
    if (!bag.length) bag.previous = index;
    return options[index];
  }
  function displayRadio(message) {
    radioActive = message;
    const words=radioActive.text.split(/\s+/).length;
    radioDuration = voiceOn&&soundOn ? Math.max(radioActive.duration,words*.42+1.5) : radioActive.duration;
    radioLeft = radioDuration;
    radioElapsed=0;
    radioVoiceDeadline=Math.max(35,words*1.1+8);
    const isPilot = radioActive.role === 'pilot';
    commsElement.classList.toggle('pilot-transmission', isPilot);
    commsChannel.textContent = isPilot ? 'PILOT RESPONSE' : 'INCOMING TRANSMISSION';
    commsName.textContent = isPilot ? PILOTS[state.pilot].name.toUpperCase() : 'COMMANDER VEGA';
    commsText.textContent = radioActive.text;
    commsPortrait.src = isPilot ? `assets/${PILOT_PORTRAITS[state.pilot]}` : 'assets/commander-vega.svg';
    commsPortrait.alt = isPilot ? `${PILOTS[state.pilot].name}, your pilot` : 'Commander Vega at headquarters';
    commsTimer.style.width = '100%';
    commsElement.classList.remove('hidden');
    tone(isPilot ? 690 : 420, 0.055, 0.025, 1.22);
    speakRadio(radioActive);
  }
  function startNextRadio() {
    if (radioActive || state.time-lastVegaStart<RADIO_MIN_INTERVAL || !radioQueue.length) return;
    const pair=radioQueue.shift();
    lastVegaStart=state.time;
    radioReply=pair.pilot;
    displayRadio(pair.hq);
  }
  function radio(type, urgent = false) {
    if (state.phase !== 'playing') return;
    const lines = RADIO_LINES[type];
    if (!lines) return;
    const cooldown = {makeup:0,daddyMiss:0,footballDrop:0,valorPickup:0,breakfastTaco:0,dinner:0,kendra:0,briefing:0,pickup:22,rescue:18,freed:22,lost:18,hit:22,hurry:48,clear:15,kill:38,launch:0,haven:20,boss:10,mission:24,success:18,failure:22,storm:26,admire:75}[type] || 0;
    if (radioLastCalled[type] !== undefined && state.time - radioLastCalled[type] < cooldown) return;
    if (!urgent && (radioActive || radioQueue.length)) return;
    if (radioQueue.some(pair=>pair.type===type)) return;
    radioLastCalled[type] = state.time;
    radioSequence++;
    const extra=window.STARGUARD_DIALOGUE || {};
    const personal=PERSONAL_RADIO[state.pilot]?.[type];
    const personalOptions=personal ? (Array.isArray(personal)?personal:[personal]) : [];
    const hqOptions=[...lines.hq,...(extra.hq?.[type]||[]),...personalOptions,...(extra.personal?.[state.pilot]?.[type]||[])];
    const replies=[lines.pilot[state.pilot%lines.pilot.length],...(extra.pilot?.[state.pilot]?.[type]||[])];
    const specialReply=PILOT_REPLIES[state.pilot]?.[type];
    if(specialReply)replies.push(specialReply);
    const hq=pickRadioLine(`hq-${state.pilot}-${type}`,hqOptions).replaceAll('{pilot}',PILOTS[state.pilot].name);
    const reply=pickRadioLine(`pilot-${state.pilot}-${type}`,replies);
    const pair={type,hq:{role:'hq',text:hq,duration:type==='briefing'?7:4},pilot:{role:'pilot',text:reply,duration:3}};
    if(state.pilot===2)state.lastNicolePraiseTime=state.time;
    if (urgent) {
      radioQueue.length=0;
      radioQueue.push(pair);
    } else if (radioQueue.length<1) radioQueue.push(pair);
    startNextRadio();
  }
  function updateRadio(dt) {
    if (!radioActive) {startNextRadio();return;}
    radioLeft -= dt;
    radioElapsed += dt;
    commsTimer.style.width = `${Math.max(0, radioLeft / radioDuration * 100)}%`;
    if (radioLeft <= 0 && (!radioVoicePending || radioElapsed>=radioVoiceDeadline)) {
      if(radioVoicePending)stopVoice();
      if (radioActive.role==='hq' && radioReply) {
        const reply=radioReply;radioReply=null;displayRadio(reply);
      } else {
        radioActive=null;radioLeft=0;commsElement.classList.add('hidden');stopVoice();startNextRadio();
      }
    }
  }

  const wrap = x => ((x % WORLD) + WORLD) % WORLD;
  const delta = (from,to) => {let d = wrap(to-from); return d > WORLD/2 ? d-WORLD : d;};
  const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
  const rand = (min,max) => min + Math.random()*(max-min);
  const ground = x => {
    const a=x*2*Math.PI/WORLD;
    const canyon=state.hazard?.type==='canyon' ? Math.max(0,1-Math.abs(delta(state.hazard.center,x))/state.hazard.span) : 0;
    return -462+23*Math.sin(a*5)+13*Math.sin(a*13+.8)-canyon*115;
  };
  const sx = x => WIDTH/2 + delta(state.player.x,x)*WIDTH/VIEW;
  const sy = z => PLAY_TOP + (530-z)*(PLAY_BOTTOM-PLAY_TOP)/1200;
  function notice(text, seconds=2) {state.notice=text;state.noticeTime=seconds;}
  const ABILITIES=['PULSE BURST','OVERDRIVE','SHIELD TRAIL','TRACTOR FIELD'];
  function carriedSettlers() {return state.civilians.filter(c=>c.state==='player');}
  function capacity() {return Math.max(3+PILOTS[state.pilot].cargo+(state.pilot===3&&state.player.abilityTime>0?1:0),carriedSettlers().length);}
  function activateAbility() {
    const p=state.player;
    if(state.phase!=='playing'||state.paused||p.abilityCooldown>0)return;
    p.abilityCooldown=18;
    p.abilityTime=state.pilot===0?.55:5;
    if(state.pilot===0) {
      state.shots=state.shots.filter(s=>s.player || Math.abs(delta(p.x,s.x))>410 || Math.abs(p.z-s.z)>320);
      for(let i=state.enemies.length-1;i>=0;i--)if(Math.abs(delta(p.x,state.enemies[i].x))<270&&Math.abs(p.z-state.enemies[i].z)<220)damageEnemy(i,1);
    }
    notice(`${ABILITIES[state.pilot]} ACTIVATED`,1.8);tone(610,.32,.13,1.8);
  }
  function setupHazard() {
    const type=['canyon','storm','asteroids'][(state.wave-1)%3];
    state.hazard={type,center:wrap(1200+state.wave*650),span:type==='canyon'?750:850};
    state.hazardTimer=2.6;
  }
  function setupMission() {
    const type=['rescue','destroy','protect'][(state.wave-1)%3];
    const target=type==='rescue'?2:type==='destroy'?Math.min(4+state.wave,8):25;
    const timeLimit=type==='protect'?32:60;
    state.mission={type,target,progress:0,deadline:state.time+timeLimit,reward:600+state.wave*125,startHaven:state.haven,status:'active'};
  }
  function setupRescueChallenge() {
    const kind=['chain','count','rush'][(state.wave-1)%3];
    state.rescueChallenge={kind,status:'active',progress:0,target:kind==='chain'?2:kind==='count'?2:1,deadline:state.time+(kind==='rush'?45:waveLimit()),bonus:500+state.wave*100};
  }
  function rescueChallengeProgress(count) {
    const challenge=state.rescueChallenge;
    if(!challenge||challenge.status!=='active'||state.time>challenge.deadline)return;
    if(challenge.kind==='chain'&&count<2)return;
    challenge.progress+=count;
    if(challenge.progress>=challenge.target){challenge.status='complete';state.score+=challenge.bonus;notice(`RESCUE CHALLENGE COMPLETE  +${challenge.bonus}`,2.4);tone(1150,.32,.15,1.5);}
  }
  function missionProgress(type,count=1) {
    const m=state.mission;
    if(!m||m.status!=='active'||m.type!==type)return;
    m.progress=Math.min(m.target,m.progress+count);
    if(m.progress>=m.target)resolveMission(true);
  }
  function resolveMission(success) {
    const m=state.mission;
    if(!m||m.status!=='active')return;
    m.status=success?'complete':'failed';
    if(success){state.score+=m.reward;notice(`MISSION COMPLETE +${m.reward}`,2.4);radio('success',true);tone(900,.38,.14,1.4);}
    else {notice('MISSION TIMER EXPIRED',2);radio('failure');}
  }
  function updateMission(dt) {
    const m=state.mission;
    if(!m||m.status!=='active')return;
    if(m.type==='protect') {
      m.progress=Math.min(m.target,m.progress+dt);
      if(state.haven < m.startHaven-20)resolveMission(false);
      else if(m.progress>=m.target)resolveMission(true);
    }
    if(m.status==='active'&&state.time>=m.deadline)resolveMission(false);
  }
  function updateHazard(dt) {
    const h=state.hazard;if(!h)return;
    state.hazardTimer-=dt;
    if(h.type==='asteroids'&&state.hazardTimer<=0) {
      state.hazardTimer=rand(1.4,2.4);
      state.shots.push({x:wrap(state.player.x+rand(-600,600)),z:510,vx:rand(-110,110),vz:-480,life:2.2,player:false,burst:false,hazard:true});
    }
    if(h.type==='storm'&&Math.abs(delta(state.player.x,h.center))<h.span&&state.hazardTimer<=0) {
      state.hazardTimer=rand(2,3.4);
      state.shots.push({x:wrap(state.player.x+rand(-190,190)),z:520,vx:0,vz:-570,life:2.1,player:false,burst:false,hazard:true});
      tone(170,.18,.08,.5);
    }
  }

  function selectPilot(index) {
    if (state.phase !== 'title') return;
    const selected=clamp(index,0,3);
    if (state.pilot !== selected) cue('select');
    state.pilot=selected;
    cards.forEach((card,i)=>{card.classList.toggle('selected',i===selected);card.setAttribute('aria-pressed',String(i===selected));});
  }
  function resetPlayer() {
    Object.assign(state.player,{x:0,z:-130,vx:0,vz:0,facing:1,invuln:3.5,fireTimer:0,abilityTime:0,turboEnergy:100,turboLocked:false,turboActive:false});
    state.player.shield=Math.min(4,1+state.upgrades.shield+PILOTS[state.pilot].shield);
  }
  const waveLimit = () => state.wave%3===0 ? 95 : 60;
  function spawnWave(firstWave=false) {
    state.enemies=[];
    state.bossIntroTime=0;
    state.weaponDrops=[];
    state.waveElapsed=0;
    state.haven=Math.min(100,state.haven+25);
    state.player.shield=Math.min(4,1+state.upgrades.shield+PILOTS[state.pilot].shield);
    setupHazard();setupMission();setupRescueChallenge();
    state.pickups=[{x:wrap(state.player.x+420),z:clamp(state.player.z+90,-260,250),type:'life',pulse:0}];
    if (state.wave>1) {
      state.civilians=state.civilians.filter(c=>c.state!=='saved' && c.state!=='lost');
      for(let i=0;i<5 && state.civilians.length<24;i++) {
        const x=rand(500,WORLD-500);
        state.civilians.push({x,z:ground(x)+21,state:'ground',fallSpeed:0});
      }
    }
    const count=Math.min(3+Math.ceil(state.wave*1.25),11);
    for(let i=0;i<count;i++) state.enemies.push({type:'abductor',x:wrap(850+i*WORLD/count+rand(-150,150)),z:rand(80,410),fireTimer:rand(.9,2.6),carry:-1,wobble:rand(0,Math.PI*2)});
    const bursts=Math.min(Math.floor(state.wave/2),3);
    for(let i=0;i<bursts;i++) state.enemies.push({type:'starburst',x:wrap(1700+i*WORLD/bursts),z:rand(70,350),fireTimer:rand(1.7,2.9),carry:-1,wobble:rand(0,Math.PI*2)});
    if(state.wave>=2)state.enemies.push({type:'siege',x:wrap(WORLD-1600),z:-190,fireTimer:4.5,carry:-1,wobble:rand(0,7)});
    if(state.wave>=2)for(let i=0;i<Math.min(1+Math.floor((state.wave-2)/3),3);i++)state.enemies.push({type:'interceptor',x:wrap(2400+i*3600),z:rand(100,330),fireTimer:rand(2,3),carry:-1,wobble:rand(0,7),hp:2});
    if(state.wave>=4)for(let i=0;i<Math.min(1+Math.floor((state.wave-4)/4),2);i++)state.enemies.push({type:'spore',x:wrap(3600+i*5200),z:rand(140,330),fireTimer:rand(2.2,3.5),carry:-1,wobble:rand(0,7),hp:2});
    if(state.wave>=5)for(let i=0;i<Math.min(1+Math.floor((state.wave-5)/4),2);i++)state.enemies.push({type:'phantom',x:wrap(5600+i*4600),z:rand(80,310),fireTimer:rand(2,3.2),carry:-1,wobble:rand(0,7),hp:2});
    let bossName=null;
    if(state.wave%3===0) {
      const kind=Math.floor(state.wave/3-1)%BOSS_TYPES.length;
      const maxHp=7+Math.floor(state.wave/3)*2;
      const boss={type:'boss',kind,x:1800,z:180,fireTimer:2.6,carry:-1,wobble:0,hp:maxHp,maxHp,captives:[]};
      for(let i=0;i<2;i++) {const c=state.civilians.findIndex((item,index)=>item.state==='ground'&&!boss.captives.includes(index));if(c>=0){state.civilians[c].state='enemy';boss.captives.push(c);}}
      state.enemies.push(boss);bossName=BOSS_TYPES[kind].name;state.bossIntroTime=4.2;radio('boss',true);
    }
    notice(bossName?`${bossName} INBOUND  •  BOSS WAVE`:`WAVE ${state.wave}  •  ${SECTORS[(state.wave-1)%SECTORS.length].name}  •  NEW OBJECTIVE`,3);
    if(!firstWave)radio('mission');
    tone(430,.24,.12);
  }
  function upgradeLimit(type) {return type==='engine'||type==='turbo'?5:3;}
  function upgradeCost(type) {return {engine:650,turbo:750,shield:650,rescue:600}[type]+state.upgrades[type]*(type==='turbo'?400:300);}
  function showHangar() {
    if(state.mission?.status==='active')resolveMission(false);
    state.phase='hangar';mouseFire=false;touch.fire=false;clearRadio();
    $('pauseButton').disabled=true;
    $('hangarSummary').textContent=`Wave ${state.wave} cleared. Haven One integrity ${Math.round(state.haven)}%. Choose one upgrade.`;
    $('hangarScore').textContent=`SCORE ${String(state.score).padStart(6,'0')}`;
    for(const button of document.querySelectorAll('[data-upgrade]')) {
      const type=button.dataset.upgrade,cost=upgradeCost(type),level=state.upgrades[type];
      button.querySelector('em').textContent=level>=upgradeLimit(type)?'MAX LEVEL':`${cost} PTS · LV ${level+1}`;
      button.disabled=level>=upgradeLimit(type)||state.score<cost;
    }
    hangarScreen.classList.remove('hidden');hangarScreen.setAttribute('aria-hidden','false');
    setMusic('menu');$('skipUpgradeButton').focus({preventScroll:true});
  }
  function nextWave(upgrade=null) {
    if(state.phase!=='hangar')return;
    if(upgrade) {
      const cost=upgradeCost(upgrade);
      if(!(upgrade in state.upgrades)||state.upgrades[upgrade]>=upgradeLimit(upgrade)||state.score<cost)return;
      state.score-=cost;state.upgrades[upgrade]++;
    }
    state.wave++;state.waveTimer=-1;state.phase='playing';
    hangarScreen.classList.add('hidden');hangarScreen.setAttribute('aria-hidden','true');
    $('pauseButton').disabled=false;spawnWave();setMusic('flight');frame.focus({preventScroll:true});
  }
  function startGame() {
    try { unlockAudio(); cue('launch'); } catch(error) { console.warn('Audio could not start:', error); }
    clearRadio();
    if(voiceSupported)window.speechSynthesis.resume();
    for (const key of Object.keys(radioLastCalled)) delete radioLastCalled[key];
    radioShuffleBags.clear();lastVegaStart=-Infinity;
    radioSequence=0;
    state.phase='playing';state.paused=false;state.score=0;state.lives=4;state.wave=1;state.waveElapsed=0;
    state.saved=0;state.lost=0;state.rescueStreak=0;state.waveTimer=-1;
    state.civilians=[];state.shots=[];state.pickups=[];state.weaponDrops=[];state.weapon='blaster';state.weaponAmmo={spread:0,seeker:0,rail:0,twin:0,plasma:0,nova:0};state.weaponDropCount=0;state.time=0;state.lastRescueTime=0;state.lastHurryTime=0;state.lastNicolePraiseTime=0;state.nicoleStoryIndex=0;state.nicoleStoryNextTime=rand(18,32);state.nicoleStoryOrder=[...NICOLE_STORY];for(let i=state.nicoleStoryOrder.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[state.nicoleStoryOrder[i],state.nicoleStoryOrder[j]]=[state.nicoleStoryOrder[j],state.nicoleStoryOrder[i]];}state.kills=0;
    state.haven=100;state.havenUnderAttack=0;state.upgrades={engine:0,turbo:0,shield:0,rescue:0};state.hazard=null;state.mission=null;state.rescueChallenge=null;state.trail=[];state.trailTick=0;state.celebrations=[];
    state.player.abilityCooldown=0;
    resetPlayer();
    for(let i=0;i<16;i++) {const x=wrap(400+i*750);state.civilians.push({x,z:ground(x)+21,state:'ground',fallSpeed:0});}
    spawnWave(true);
    titleScreen.classList.add('hidden'); gameOverScreen.classList.add('hidden'); pauseScreen.classList.add('hidden');hangarScreen.classList.add('hidden');
    gameOverScreen.setAttribute('aria-hidden','true');pauseScreen.setAttribute('aria-hidden','true');
    $('pauseButton').disabled=false;
    setMusic('flight');radio('briefing',true);frame.focus({preventScroll:true});
  }
  function showTitle() {
    state.phase='title';state.paused=false;mouseFire=false;
    clearRadio();
    refreshScoreViews();
    titleScreen.classList.remove('hidden');pauseScreen.classList.add('hidden');gameOverScreen.classList.add('hidden');hangarScreen.classList.add('hidden');
    pauseScreen.setAttribute('aria-hidden','true');gameOverScreen.setAttribute('aria-hidden','true');
    $('pauseButton').disabled=true;$('pauseButton').textContent='Ⅱ PAUSE';setMusic('menu');
    $('launchButton').focus({preventScroll:true});
  }
  function setPaused(value) {
    if(state.phase!=='playing') return;
    state.paused=value;mouseFire=false;touch.fire=false;
    pauseScreen.classList.toggle('hidden',!value);pauseScreen.setAttribute('aria-hidden',String(!value));
    $('pauseButton').textContent=value?'▶ RESUME':'Ⅱ PAUSE';
    setMusic(value?'menu':'flight');
    if(voiceSupported&&voiceOn){if(value)window.speechSynthesis.pause();else window.speechSynthesis.resume();}
    if(value) $('resumeButton').focus({preventScroll:true}); else frame.focus({preventScroll:true});
  }
  function endGame(reason='ALL SHIPS LOST') {
    state.phase='gameover';state.paused=false;mouseFire=false;
    clearRadio();
    hangarScreen.classList.add('hidden');
    $('gameOverReason').textContent=reason;
    $('finalScore').textContent=`FINAL SCORE ${scoreText(state.score)}`;
    scoreSaved=false;
    const qualifies=topScores.length<5||state.score>topScores[topScores.length-1].score;
    $('scoreEntry').classList.toggle('hidden',!qualifies);
    $('scoreSavedNote').classList.add('hidden');
    $('initialsInput').value='';refreshScoreViews();
    gameOverScreen.classList.remove('hidden');gameOverScreen.setAttribute('aria-hidden','false');
    setMusic(null);cue('over');(qualifies?$('initialsInput'):$('restartButton')).focus({preventScroll:true});
  }

  function cycleWeapon() {
    if(state.phase!=='playing'||state.paused)return;
    const available=WEAPON_ORDER.filter(type=>type==='blaster'||state.weaponAmmo[type]>0);
    state.weapon=available[(available.indexOf(state.weapon)+1)%available.length]||'blaster';
    notice(`${WEAPONS[state.weapon].name} SELECTED`,1.4);tone(520,.09,.08,1.3);
  }
  function fire() {
    if(state.phase!=='playing'||state.paused) return;
    const p=state.player;
    if(state.weapon!=='blaster'&&state.weaponAmmo[state.weapon]<=0)state.weapon='blaster';
    const type=state.weapon,x=wrap(p.x+p.facing*38),z=p.z;
    if(type==='spread') {
      for(const angle of [-.36,-.18,0,.18,.36])state.shots.push({x,z,vx:p.facing*Math.cos(angle)*1160,vz:Math.sin(angle)*1160,life:.82,player:true,weapon:type,damage:1});
    } else if(type==='seeker') {
      for(const side of [-1,1])state.shots.push({x,z:z+side*15,vx:p.facing*570,vz:side*70,life:2.6,player:true,weapon:type,damage:1,seeking:true});
    } else if(type==='rail') {
      state.shots.push({x,z,vx:p.facing*1700,vz:0,life:.85,player:true,weapon:type,damage:2,pierce:true,hitTargets:new Set()});
    } else if(type==='twin') {
      for(const side of [-1,1])state.shots.push({x,z:z+side*14,vx:p.facing*1450,vz:0,life:1,player:true,weapon:type,damage:1});
    } else if(type==='plasma') {
      state.shots.push({x,z,vx:p.facing*920,vz:0,life:1.25,player:true,weapon:type,damage:2,splash:115});
    } else if(type==='nova') {
      for(let ray=0;ray<8;ray++){const angle=ray*Math.PI/4;state.shots.push({x,z,vx:Math.cos(angle)*1060,vz:Math.sin(angle)*1060,life:.72,player:true,weapon:type,damage:1});}
    } else state.shots.push({x,z,vx:p.facing*1350,vz:0,life:1.2,player:true,weapon:'blaster',damage:1});
    if(type!=='blaster') {
      state.weaponAmmo[type]--;
      if(state.weaponAmmo[type]<=0){state.weapon='blaster';notice(`${WEAPONS[type].name} EMPTY  •  BLASTER READY`,1.3);}
    }
    p.fireTimer=WEAPONS[type].rate;tone(type==='plasma'?250:type==='nova'?920:type==='twin'?830:type==='rail'?1040:type==='seeker'?490:type==='spread'?680:780,.08,.06,.55);
  }
  function spawnWeaponDrop(enemy) {
    if(state.weaponDropCount>0&&enemy.type!=='boss'&&Math.random()>.65)return;
    const type=['spread','seeker','rail','twin','plasma','nova'][state.weaponDropCount%6];
    state.weaponDropCount++;
    state.weaponDrops.push({x:enemy.x,z:enemy.z,type,life:18,pulse:0});
  }
  function dropCivilian(index) {
    if(index<0||!state.civilians[index]) return;
    const c=state.civilians[index];c.state='falling';c.fallSpeed=0;
    state.score+=50;notice('CAPTIVE RELEASED  +50',1.3);
    radio('freed');
  }
  function damageEnemy(index,damage=1) {
    const e=state.enemies[index];if(!e)return;
    if(e.hp && (e.hp-=damage)>0){tone(260,.08,.05,1.25);return;}
    if(e.carry>=0)dropCivilian(e.carry);
    if(e.captives)for(const captive of e.captives)dropCivilian(captive);
    state.enemies.splice(index,1);
    spawnWeaponDrop(e);
    state.score+=e.type==='boss'?1800+(e.kind||0)*500:e.type==='siege'?250:e.type==='starburst'?300:e.type==='spore'||e.type==='phantom'?240:e.type==='interceptor'?200:150;
    state.kills++;missionProgress('destroy');
    if(e.type==='boss'){notice(`${BOSS_TYPES[e.kind||0].name} DEFEATED  +${1800+(e.kind||0)*500}`,2.5);radio('clear',true);}
    else if(e.carry<0&&state.kills%3===0)radio('kill');
    tone(145,.2,.14,.4);
  }
  function damageHaven(amount) {
    if(state.phase!=='playing')return;
    state.haven=Math.max(0,state.haven-amount);
    state.havenUnderAttack=3;
    notice(`HAVEN ONE UNDER ATTACK  ${Math.round(state.haven)}%`,2);
    radio('haven',true);tone(190,.32,.11,.45);
    if(state.haven<=0)endGame('HAVEN ONE HAS FALLEN');
  }
  function loseLife() {
    const p=state.player;
    if(state.phase!=='playing'||p.invuln>0) return;
    if((state.pilot===2&&p.abilityTime>0)||p.shield>0) {
      if(!(state.pilot===2&&p.abilityTime>0))p.shield--;
      p.invuln=1.1;notice('SHIELD ABSORBED THE HIT',1.5);tone(360,.22,.1,1.7);return;
    }
    for(const c of state.civilians) if(c.state==='player') {c.state='falling';c.fallSpeed=0;}
    state.lives--;state.rescueStreak=0;tone(180,.48,.18,.25);
    if(state.lives<=0) endGame();
    else {resetPlayer();notice(`${state.lives} SHIPS REMAIN`,1.8);radio('hit',true);}
  }
  function updatePlayer(dt) {
    const p=state.player;
    const hx=(keys.has('KeyD')||keys.has('ArrowRight')||touch.right?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')||touch.left?1:0);
    const hz=(keys.has('KeyW')||keys.has('ArrowUp')||touch.up?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')||touch.down?1:0);
    const horizontal=clamp(hx+gamepadX,-1,1),vertical=clamp(hz+gamepadY,-1,1);
    if(p.turboLocked&&p.turboEnergy>=35)p.turboLocked=false;
    const turboHeld=keys.has('ShiftLeft')||keys.has('ShiftRight')||touch.turbo||gamepadTurbo;
    p.turboActive=turboHeld&&!p.turboLocked&&p.turboEnergy>0&&(Math.abs(horizontal)+Math.abs(vertical)>.1);
    p.turboEnergy=clamp(p.turboEnergy+(p.turboActive?-48:22)*dt,0,100);
    if(p.turboEnergy<=0){p.turboLocked=true;p.turboActive=false;}
    const cargo=carriedSettlers().length;
    const boosted=state.pilot===1&&p.abilityTime>0;
    const storm=state.hazard?.type==='storm'&&Math.abs(delta(p.x,state.hazard.center))<state.hazard.span;
    const cargoFactor=1-cargo*.105;
    const pilotSpeed=PILOTS[state.pilot].speed;
    const thrust=(1700+state.upgrades.engine*210+state.upgrades.turbo*260)*pilotSpeed*(boosted?1.75:1)*(p.turboActive?1.9:1)*(storm?.78:1)*cargoFactor;
    const maxX=(520+state.upgrades.engine*55+state.upgrades.turbo*85)*pilotSpeed*(boosted?1.42:1)*(p.turboActive?1.65:1)*cargoFactor;
    const maxZ=(430+state.upgrades.engine*35+state.upgrades.turbo*45)*pilotSpeed*(boosted?1.35:1)*(p.turboActive?1.5:1)*cargoFactor;
    const drag=Math.exp(-3.4*dt);
    p.vx=clamp((p.vx+horizontal*thrust*dt)*drag,-maxX,maxX);
    p.vz=clamp((p.vz+vertical*thrust*dt)*drag,-maxZ,maxZ);
    if(state.hazard?.type==='canyon'&&Math.abs(delta(p.x,state.hazard.center))<state.hazard.span)p.vz+=85*dt;
    p.x=wrap(p.x+p.vx*dt);
    const floor=ground(p.x)+34;
    p.z=clamp(p.z+p.vz*dt,floor,445);
    if((p.z<=floor&&p.vz<0)||(p.z>=445&&p.vz>0)) p.vz=0;
    if(Math.abs(horizontal)>.1) p.facing=horizontal>0?1:-1;
    p.invuln=Math.max(0,p.invuln-dt);
    p.abilityTime=Math.max(0,p.abilityTime-dt);
    p.abilityCooldown=Math.max(0,p.abilityCooldown-dt);
    state.trailTick-=dt;
    if(state.pilot===2&&p.abilityTime>0&&state.trailTick<=0){state.trail.push({x:p.x,z:p.z,life:.8});state.trailTick=.06;}
    for(const point of state.trail)point.life-=dt;
    state.trail=state.trail.filter(point=>point.life>0);
    state.havenUnderAttack=Math.max(0,state.havenUnderAttack-dt);
    p.fireTimer-=dt;
    if((keys.has('Space')||state.autoFire||mouseFire||touch.fire||gamepadFire)&&p.fireTimer<=0) fire();
  }
  function fireBossVolley(e,p) {
    const kind=e.kind||0;
    const count=[8,5,8,10][kind];
    const aim=Math.atan2(p.z-e.z,delta(e.x,p.x));
    for(let ray=0;ray<count;ray++) {
      let angle,speed;
      if(kind===1){angle=aim+(ray-(count-1)/2)*.25;speed=285;}
      else if(kind===2){angle=ray*Math.PI/4+e.wobble*.22;speed=250;}
      else if(kind===3){angle=ray*2*Math.PI/count+e.wobble*.35;speed=225;}
      else {angle=ray*Math.PI/4+e.wobble*.13;speed=245;}
      state.shots.push({x:e.x,z:e.z,vx:Math.cos(angle)*speed,vz:Math.sin(angle)*speed,life:2.4,player:false,burst:true,bossKind:kind});
    }
    e.fireTimer=[3.4,3.1,3.5,3.8][kind];tone([130,165,210,110][kind],.24,.1,.8);
  }
  function updateEnemies(dt) {
    const p=state.player;
    for(let i=state.enemies.length-1;i>=0;i--) {
      const e=state.enemies[i];e.wobble+=dt*3;
      if(e.weakFlash)e.weakFlash=Math.max(0,e.weakFlash-dt);
      if(e.type==='siege') {
        const dx=delta(e.x,0);
        if(Math.abs(dx)>165)e.x=wrap(e.x+Math.sign(dx)*(170+state.wave*4)*dt);
        e.z+=clamp(-170-e.z,-100*dt,100*dt);
        e.fireTimer-=dt;
        if(Math.abs(dx)<=165&&e.fireTimer<=0){damageHaven(2);e.fireTimer=5;}
        if(Math.abs(delta(e.x,p.x))<43&&Math.abs(e.z-p.z)<32)loseLife();
        continue;
      }
      if(e.type==='boss') {
        const dx=delta(e.x,p.x);
        e.x=wrap(e.x+Math.sign(dx)*([83,104,72,62][e.kind||0]+state.wave*2)*dt);
        e.z=clamp(170+Math.sin(e.wobble*[.45,.7,.38,.3][e.kind||0])*[125,95,115,135][e.kind||0],15,390);
        for(let c=0;c<e.captives.length;c++){const hostage=state.civilians[e.captives[c]];if(hostage){hostage.x=wrap(e.x+(c?65:-65));hostage.z=e.z-55;}}
        e.fireTimer-=dt;
        if(e.fireTimer<=0&&state.bossIntroTime<=0)fireBossVolley(e,p);
        if(Math.abs(dx)<85&&Math.abs(e.z-p.z)<60)loseLife();
        continue;
      }
      if(e.type==='starburst') {
        e.x=wrap(e.x+(62+state.wave*4)*dt);
        e.z=clamp(e.z+Math.sin(e.wobble)*24*dt,60,410);
        e.fireTimer-=dt;
        if(e.fireTimer<=0) {
          for(let ray=0;ray<8;ray++) {const a=ray*Math.PI/4;state.shots.push({x:e.x,z:e.z,vx:Math.cos(a)*210,vz:Math.sin(a)*210,life:2.3,player:false,burst:true});}
          e.fireTimer=Math.max(3,rand(3.5,4.5)/Math.sqrt(state.wave));tone(470,.09,.07,.6);
        }
        if(p.invuln<=0&&Math.abs(delta(e.x,p.x))<41&&Math.abs(e.z-p.z)<31) loseLife();
        continue;
      }
      if(e.type==='interceptor') {
        const dx=delta(e.x,p.x),dz=p.z-e.z;
        e.x=wrap(e.x+Math.sign(dx)*(215+state.wave*5)*dt);
        e.z=clamp(e.z+clamp(dz+Math.sin(e.wobble*2)*65,-170*dt,170*dt),-325,425);
        e.fireTimer-=dt;
        if(e.fireTimer<=0&&Math.abs(dx)<620){const angle=Math.atan2(dz,dx);state.shots.push({x:e.x,z:e.z,vx:Math.cos(angle)*420,vz:Math.sin(angle)*420,life:1.8,player:false,burst:false,enemyKind:'interceptor'});e.fireTimer=3.3;}
        if(p.invuln<=0&&Math.abs(dx)<34&&Math.abs(dz)<28)loseLife();
        continue;
      }
      if(e.type==='spore') {
        e.x=wrap(e.x+(75+state.wave*2)*dt);e.z=clamp(e.z+Math.sin(e.wobble*1.3)*45*dt,80,400);
        e.fireTimer-=dt;
        if(e.fireTimer<=0){for(const side of [-1,1])state.shots.push({x:wrap(e.x+side*24),z:e.z-12,vx:side*70,vz:-230,life:2.5,player:false,burst:false,enemyKind:'spore'});e.fireTimer=4.2;}
        if(p.invuln<=0&&Math.abs(delta(e.x,p.x))<38&&Math.abs(e.z-p.z)<34)loseLife();
        continue;
      }
      if(e.type==='phantom') {
        const dx=delta(e.x,p.x),dz=p.z-e.z;
        e.x=wrap(e.x+Math.sign(dx)*(100+state.wave*3)*dt);
        e.z=clamp(e.z+Math.sin(e.wobble*2.8)*120*dt,-260,420);
        e.fireTimer-=dt;
        if(e.fireTimer<=0&&Math.abs(dx)<800){const aim=Math.atan2(dz,dx);for(const offset of [-.18,.18])state.shots.push({x:e.x,z:e.z,vx:Math.cos(aim+offset)*330,vz:Math.sin(aim+offset)*330,life:2.2,player:false,burst:false,enemyKind:'phantom'});e.fireTimer=3.5;}
        if(p.invuln<=0&&Math.abs(dx)<35&&Math.abs(dz)<29)loseLife();
        continue;
      }
      if(e.carry>=0) {
        e.z+=(95+state.wave*5)*dt;
        const captive=state.civilians[e.carry];
        if(captive) {captive.x=e.x;captive.z=e.z-34;}
        if(e.z>540) {if(captive){captive.state='lost';state.lost++;}state.enemies.splice(i,1);notice('A SETTLER WAS TAKEN',1.7);tone(210,.35,.15,.4);radio('lost',true);}
        continue;
      }
      let target=-1,best=Infinity;
      for(let c=0;c<state.civilians.length;c++) if(state.civilians[c].state==='ground') {
        const distance=Math.abs(delta(e.x,state.civilians[c].x));
        if(distance<best){best=distance;target=c;}
      }
      if(target>=0) {
        const civilian=state.civilians[target],dx=delta(e.x,civilian.x),wanted=civilian.z+48;
        e.x=wrap(e.x+Math.sign(dx)*(145+state.wave*9)*dt);
        e.z+=clamp(wanted-e.z,-(115+state.wave*8)*dt,(115+state.wave*8)*dt);
        if(Math.abs(dx)<28&&Math.abs(e.z-wanted)<14) {e.carry=target;civilian.state='enemy';tone(330,.16,.1,.5);}
      } else {e.x=wrap(e.x+70*dt);e.z+=clamp(p.z-e.z,-85*dt,85*dt);}
      e.fireTimer-=dt;
      const px=delta(e.x,p.x),pz=p.z-e.z;
      if(e.fireTimer<=0&&Math.abs(px)<850&&Math.abs(pz)<430) {
        const length=Math.hypot(px,pz)||1;
        state.shots.push({x:e.x,z:e.z,vx:px/length*390,vz:pz/length*390,life:2.3,player:false,burst:false});
        e.fireTimer=Math.max(2.5,rand(3.4,4.5)/Math.sqrt(state.wave));
      }
      if(p.invuln<=0&&Math.abs(px)<41&&Math.abs(pz)<31) loseLife();
    }
  }
  function updateCivilians(dt) {
    const cargo=carriedSettlers();
    for(const c of state.civilians) {
      if(c.state==='falling') {c.fallSpeed+=390*dt;c.z-=c.fallSpeed*dt;const floor=ground(c.x)+21;if(c.z<=floor){c.z=floor;c.fallSpeed=0;c.state='ground';}}
      else if(c.state==='player') {const slot=cargo.indexOf(c);c.x=wrap(state.player.x-state.player.facing*(75+slot*62));c.z=state.player.z-42-slot*10;}
      else if(c.state==='ground') {
        let danger=null,best=340;
        for(const e of state.enemies)if(e.type==='abductor'&&e.carry<0){const distance=Math.abs(delta(c.x,e.x));if(distance<best){best=distance;danger=e;}}
        c.panic=danger?1:Math.max(0,(c.panic||0)-dt*2);
        if(danger)c.x=wrap(c.x-Math.sign(delta(c.x,danger.x))*50*dt);
        c.z=ground(c.x)+21;
      }
    }
  }
  function updatePickups(dt) {
    for(let index=state.pickups.length-1;index>=0;index--) {
      const pickup=state.pickups[index];pickup.pulse+=dt*4;
      if(Math.abs(delta(state.player.x,pickup.x))>70||Math.abs(state.player.z-pickup.z)>75)continue;
      state.pickups.splice(index,1);
      if(state.lives<6){state.lives++;notice('EXTRA SHIP COLLECTED  +1 LIFE',2.3);}
      else {state.player.shield=Math.min(4,state.player.shield+1);notice('MAX LIVES  •  SHIELD RECHARGED',2.3);}
      state.score+=150;tone(780,.35,.15,1.8);
    }
  }
  function updateWeaponDrops(dt) {
    for(let index=state.weaponDrops.length-1;index>=0;index--) {
      const drop=state.weaponDrops[index];drop.life-=dt;drop.pulse+=dt*5;
      drop.z=Math.max(ground(drop.x)+55,drop.z-38*dt);
      if(drop.life<=0){state.weaponDrops.splice(index,1);continue;}
      if(Math.abs(delta(state.player.x,drop.x))>75||Math.abs(state.player.z-drop.z)>78)continue;
      state.weaponDrops.splice(index,1);
      state.weaponAmmo[drop.type]=Math.min(72,state.weaponAmmo[drop.type]+WEAPONS[drop.type].pack);
      state.weapon=drop.type;
      notice(`${WEAPONS[drop.type].name}  +${WEAPONS[drop.type].pack} VOLLEYS`,2.2);
      tone(560,.28,.13,2.1);
    }
  }
  function updateShots(dt) {
    for(let i=state.shots.length-1;i>=0;i--) {
      const shot=state.shots[i];
      if(shot.seeking&&state.enemies.length){
        let target=null,best=1050;
        for(const enemy of state.enemies){const distance=Math.hypot(delta(shot.x,enemy.x),enemy.z-shot.z);if(distance<best){best=distance;target=enemy;}}
        if(target){const dx=delta(shot.x,target.x),dz=target.z-shot.z,length=Math.hypot(dx,dz)||1,turn=Math.min(1,dt*4.6);shot.vx+=(dx/length*760-shot.vx)*turn;shot.vz+=(dz/length*760-shot.vz)*turn;}
      }
      shot.x=wrap(shot.x+shot.vx*dt);shot.z+=shot.vz*dt;shot.life-=dt;
      let consumed=shot.life<=0||shot.z < -550||shot.z>600;
      if(!consumed&&shot.player) {
        for(let e=state.enemies.length-1;e>=0;e--) {
          const enemy=state.enemies[e],wide=enemy.type==='boss'?90:enemy.type==='siege'?46:37,high=enemy.type==='boss'?58:30;
          if(Math.abs(delta(shot.x,enemy.x))<wide&&Math.abs(shot.z-enemy.z)<high&&!shot.hitTargets?.has(enemy)){
            const weakHit=enemy.type==='boss'&&Math.abs(delta(shot.x,enemy.x))<34&&Math.abs(shot.z-enemy.z)<30;
            const hitDamage=(shot.damage||1)+(weakHit?1:0);
            if(weakHit)enemy.weakFlash=.45;
            if(shot.splash){
              const nearby=state.enemies.filter(target=>target!==enemy&&Math.hypot(delta(enemy.x,target.x),enemy.z-target.z)<shot.splash);
              damageEnemy(e,hitDamage);
              for(const target of nearby){const targetIndex=state.enemies.indexOf(target);if(targetIndex>=0)damageEnemy(targetIndex,1);}
              notice('PLASMA SHOCKWAVE!',.75);
            } else damageEnemy(e,hitDamage);
            if(shot.pierce)shot.hitTargets.add(enemy);
            else {consumed=true;break;}
          }
        }
      } else if(!consumed&&!shot.player) {
        if(state.pilot===2&&state.player.abilityTime>0&&state.trail.some(point=>Math.abs(delta(point.x,shot.x))<30&&Math.abs(point.z-shot.z)<35))consumed=true;
        else if(Math.abs(delta(shot.x,state.player.x))<25&&Math.abs(shot.z-state.player.z)<20){consumed=true;loseLife();}
      }
      if(consumed) state.shots.splice(i,1);
    }
  }
  function checkRescue() {
    const p=state.player;
    const carried=carriedSettlers();
    if(carried.length) {
      if(Math.abs(delta(p.x,0))<105&&p.z < -300) {
        for(const c of carried)c.state='saved';
        state.saved+=carried.length;state.rescueStreak+=carried.length;
        const multiplier=1+(carried.length-1)*.5;
        const points=Math.round((500*carried.length+Math.min(state.rescueStreak,5)*100)*multiplier);
        state.score+=points;notice(`${carried.length} SETTLER${carried.length>1?'S':''} SAFE  •  CHAIN x${multiplier.toFixed(1)}  +${points}`,2.1);tone(920,.28,.14);
        state.celebrations.push({life:3.7,count:carried.length,label:['THANK YOU, PILOT!','WE MADE IT HOME!','HAVEN ONE CHEERS!'][Math.floor(Math.random()*3)]});
        state.lastRescueTime=state.time;radio('rescue',true);
        missionProgress('rescue',carried.length);
        rescueChallengeProgress(carried.length);
        return;
      }
    }
    if(carried.length>=capacity())return;
    const tractor=state.pilot===3&&p.abilityTime>0;
    const rangeX=65+state.upgrades.rescue*24+PILOTS[state.pilot].rescue+(tractor?105:0),rangeZ=115+state.upgrades.rescue*25+PILOTS[state.pilot].rescue+(tractor?65:0);
    let collected=0;
    for(const c of state.civilians) if((c.state==='ground'||c.state==='falling')&&Math.abs(delta(p.x,c.x))<rangeX&&Math.abs(p.z-c.z)<rangeZ) {
      c.state='player';collected++;
      if(carried.length+collected>=capacity())break;
    }
    if(collected){notice(`RESCUE CHAIN  ${carried.length+collected}/${capacity()}  •  FIND MORE OR RETURN HOME`,2.4);tone(720,.13,.11);radio('pickup');}
  }
  function update(dt) {
    state.time+=dt;state.waveElapsed+=dt;state.noticeTime=Math.max(0,state.noticeTime-dt);
    state.bossIntroTime=Math.max(0,state.bossIntroTime-dt);
    for(const celebration of state.celebrations)celebration.life-=dt;
    state.celebrations=state.celebrations.filter(celebration=>celebration.life>0);
    updateRadio(dt);
    updatePlayer(dt);updateEnemies(dt);if(state.phase!=='playing')return;
    updateCivilians(dt);updatePickups(dt);updateWeaponDrops(dt);updateHazard(dt);updateShots(dt);if(state.phase!=='playing')return;
    checkRescue();
    updateMission(dt);
    if(state.rescueChallenge?.status==='active'&&state.time>state.rescueChallenge.deadline)state.rescueChallenge.status='expired';
    if(state.enemies.length===0||state.waveElapsed>=waveLimit()) {
      if(state.waveTimer<0) {
        if(state.enemies.length){for(const c of state.civilians)if(c.state==='enemy'){c.state='falling';c.fallSpeed=0;}state.enemies=[];state.shots=state.shots.filter(shot=>shot.player);}
        state.waveTimer=2.5;state.score+=250*state.wave;notice(`WAVE ${state.wave} CLEARED  •  BONUS ${250*state.wave}`,2.5);tone(620,.35,.14);radio('clear',true);
      }
      else if((state.waveTimer-=dt)<=0&&!radioActive)showHangar();
    } else state.waveTimer=-1;
    if(state.pilot===2&&state.nicoleStoryIndex<state.nicoleStoryOrder.length&&state.time>=state.nicoleStoryNextTime&&!radioActive&&!radioQueue.length&&state.time-lastVegaStart>=RADIO_MIN_INTERVAL) {
      radio(state.nicoleStoryOrder[state.nicoleStoryIndex++]);
      state.nicoleStoryNextTime=state.time+rand(19,38);
    }
    if(state.time-state.lastRescueTime>55 && state.time-state.lastHurryTime>75 && !radioActive && radioQueue.length===0) {
      state.lastHurryTime=state.time;radio('hurry');
    }
    if(state.pilot===2&&state.time-state.lastNicolePraiseTime>90&&!radioActive&&radioQueue.length===0)radio('admire');
  }

  function gamepadPressed(pad,index) {return !!pad?.buttons?.[index]?.pressed;}
  function pollGamepad() {
    const pad=Array.from(navigator.getGamepads?.() || []).find(Boolean);
    if(!pad){gamepadX=0;gamepadY=0;gamepadFire=false;gamepadTurbo=false;previousGamepadButtons=[];return;}
    gamepadX=Math.abs(pad.axes[0]||0)>.24?pad.axes[0]:0;
    gamepadY=Math.abs(pad.axes[1]||0)>.24?-(pad.axes[1]):0;
    gamepadFire=gamepadPressed(pad,7);
    gamepadTurbo=gamepadPressed(pad,6);
    const pressed=[0,4,5,9,14,15,1,12].map(i=>gamepadPressed(pad,i));
    if(pressed[0]&&!previousGamepadButtons[0]) {
      if(state.phase==='title'||state.phase==='gameover')startGame();
      else if(state.phase==='hangar')nextWave();
      else if(state.paused)setPaused(false);
    }
    if(pressed[6]&&!previousGamepadButtons[6])activateAbility();
    if(pressed[7]&&!previousGamepadButtons[7])cycleWeapon();
    if(pressed[1]&&!previousGamepadButtons[1])state.player.facing=-1;
    if(pressed[2]&&!previousGamepadButtons[2])state.player.facing=1;
    if(pressed[3]&&!previousGamepadButtons[3]) {if(state.phase==='playing')setPaused(!state.paused);}
    if(state.phase==='title') {
      if(pressed[4]&&!previousGamepadButtons[4])selectPilot((state.pilot+3)%4);
      if(pressed[5]&&!previousGamepadButtons[5])selectPilot((state.pilot+1)%4);
    }
    previousGamepadButtons=pressed;
  }

  function rect(x,y,w,h,color) {ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}
  function line(x1,y1,x2,y2,color,width=1) {ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
  function text(value,x,y,size=17,color=COLORS.pale,align='left',weight=700) {ctx.save();ctx.fillStyle=color;ctx.font=`${weight} ${size}px Segoe UI, Arial, sans-serif`;ctx.textAlign=align;ctx.textBaseline='top';ctx.shadowColor='#000b';ctx.shadowBlur=5;ctx.fillText(value,x,y);ctx.restore();}
  function sprite(image,x,y,w,h) {if(image.complete&&image.naturalWidth)ctx.drawImage(image,x,y,w,h);}
  function drawSky() {
    const sector=SECTORS[(state.wave-1)%SECTORS.length];
    const gradient=ctx.createLinearGradient(0,PLAY_TOP,0,PLAY_BOTTOM);
    gradient.addColorStop(0,sector.sky[0]);gradient.addColorStop(.65,sector.sky[1]);gradient.addColorStop(1,sector.sky[2]);
    rect(0,0,WIDTH,HEIGHT,COLORS.night);rect(0,PLAY_TOP,WIDTH,PLAY_BOTTOM-PLAY_TOP,gradient);
    // Keep this distant planet fixed in the sky; a wrapped parallax offset made it jump.
    const planetX=990;
    ctx.save();ctx.globalAlpha=.38;ctx.shadowColor=sector.world;ctx.shadowBlur=42;ctx.fillStyle=sector.world;ctx.beginPath();ctx.arc(planetX,PLAY_TOP+105,50,0,Math.PI*2);ctx.fill();ctx.restore();
    for(let layer=0;layer<2;layer++) {
      const depth=layer===0?.14:.29,base=PLAY_BOTTOM-(layer===0?145:84);
      ctx.beginPath();ctx.moveTo(0,PLAY_BOTTOM);
      for(let i=0;i<=100;i++) {const x=i*WIDTH/100,phase=(x+state.player.x*depth*WIDTH/VIEW)/WIDTH*18,peak=32*Math.sin(phase)+16*Math.sin(phase*2.7+layer);ctx.lineTo(x,base+peak);}
      ctx.lineTo(WIDTH,PLAY_BOTTOM);ctx.closePath();ctx.fillStyle=sector.mountains[layer];ctx.fill();
    }
    for(let i=0;i<150;i++) {const wx=(i*1987+371)%WORLD,x=sx(wx);if(x<0||x>WIDTH)continue;const z=80+(i*379)%440,y=sy(z),size=i%9===0?2:1;rect(x,y,size,size,sector.star);}
    if(state.hazard?.type==='storm') {
      const center=sx(state.hazard.center),radius=state.hazard.span*WIDTH/VIEW;
      rect(center-radius,PLAY_TOP,radius*2,PLAY_BOTTOM-PLAY_TOP,'#65359630');
      for(let i=0;i<5;i++){const x=center-radius+i*radius*.5+Math.sin(state.time*2+i)*12;if(x<0||x>WIDTH)continue;line(x,PLAY_TOP+15,x+Math.sin(state.time*8+i)*22,PLAY_BOTTOM-70,'#a06bfd65',2);}
    }
  }
  function drawTerrain() {
    const sector=SECTORS[(state.wave-1)%SECTORS.length];
    ctx.beginPath();ctx.moveTo(0,PLAY_BOTTOM);
    for(let i=0;i<=140;i++) {const x=i*WIDTH/140,wx=wrap(state.player.x+(x-WIDTH/2)*VIEW/WIDTH);ctx.lineTo(x,sy(ground(wx)));}
    ctx.lineTo(WIDTH,PLAY_BOTTOM);ctx.closePath();ctx.fillStyle=sector.ground;ctx.fill();ctx.strokeStyle=sector.rim;ctx.lineWidth=2;ctx.shadowColor=sector.rim;ctx.shadowBlur=9;ctx.stroke();ctx.shadowBlur=0;
    if(state.hazard?.type==='canyon'){const x=sx(state.hazard.center);if(x>-500&&x<WIDTH+500){line(x-90,PLAY_BOTTOM-15,x+90,PLAY_BOTTOM-15,COLORS.pink,5);text('ION CANYON',x,PLAY_BOTTOM-48,13,COLORS.pink,'center');}}
  }
  function drawHaven() {
    const x=sx(0);if(x < -160||x>WIDTH+160)return;
    const y=sy(ground(0));
    rect(x-140,y-8,280,9,'#11283b');line(x-140,y-9,x+140,y-9,COLORS.cyan,2);
    for(const side of [-1,1]) {const tx=x+side*102;rect(tx-19,y-76,38,66,'#102137');rect(tx-23,y-79,46,5,COLORS.cyan);rect(tx-12,y-91,24,12,'#102137');line(tx,y-91,tx,y-106,COLORS.cyan,2);rect(tx-3,y-109,6,6,Math.sin(state.time*3)>0?COLORS.orange:COLORS.pink);for(let row=0;row<3;row++)rect(tx-10,y-65+row*15,20,5,COLORS.cyan);}
    rect(x-57,y-43,114,34,'#102137');for(let i=0;i<8;i++){const x1=x-59+i*14.75,x2=x1+14.75,t1=(x1-x)/59,t2=(x2-x)/59;line(x1,y-43-27*Math.sqrt(Math.max(0,1-t1*t1)),x2,y-43-27*Math.sqrt(Math.max(0,1-t2*t2)),COLORS.pink,3);}
    for(let i=-2;i<=2;i++)rect(x+i*19-5,y-36,10,8,COLORS.cyan);
    rect(x-42,y-11,84,4,COLORS.orange);line(x-22,y-5,x+22,y-5,COLORS.pale,2);text('HAVEN ONE',x,y-133,12,COLORS.pale,'center',800);
    rect(x-52,y-122,104,5,'#401d36');rect(x-52,y-122,104*state.haven/100,5,state.haven>35?COLORS.green:COLORS.pink);
    const cheering=state.celebrations[0];
    if(cheering){for(let i=0;i<Math.min(cheering.count,4);i++){const px=x-178+i*27,bob=Math.sin(state.time*9+i)*4;sprite(assets.settler,px-11,y-34+bob,22,28);line(px-8,y-29+bob,px-16,y-40+bob,COLORS.gold,2);line(px+8,y-29+bob,px+16,y-40+bob,COLORS.gold,2);}text(cheering.label,x,y-157,13,COLORS.green,'center',900);}
  }
  function drawSiegeRaider(x,y,e) {
    const pulse=.5+.5*Math.sin(state.time*5+e.wobble);
    ctx.save();ctx.translate(x,y);
    // Broad swept wings, a glowing core, and hanging siege cannons give this craft its own silhouette.
    ctx.shadowColor='#ff348e';ctx.shadowBlur=13+7*pulse;
    ctx.fillStyle='#ff348e33';ctx.beginPath();ctx.ellipse(0,23,58,13,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    const poly=(points,fill,stroke='#75295f')=>{ctx.beginPath();ctx.moveTo(...points[0]);for(const point of points.slice(1))ctx.lineTo(...point);ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();};
    poly([[-57,-7],[-33,-24],[-16,-15],[0,-28],[16,-15],[33,-24],[57,-7],[43,9],[23,5],[14,17],[-14,17],[-23,5],[-43,9]],'#321b4a','#ff4aaa');
    poly([[-53,-8],[-34,-19],[-19,-12],[-28,0],[-45,4]],'#7e246b','#d94a9d');
    poly([[53,-8],[34,-19],[19,-12],[28,0],[45,4]],'#7e246b','#d94a9d');
    poly([[-27,-1],[-17,-18],[0,-22],[17,-18],[27,-1],[16,13],[-16,13]],'#14253f','#ff6cab');
    poly([[-11,-8],[0,-14],[11,-8],[8,4],[0,9],[-8,4]],'#64efff','#cfffff');
    rect(-5,-5,10,4,'#eaffff');
    for(const side of [-1,1]) {
      const g=side*36;
      poly([[g-8,5],[g+8,5],[g+6,21],[g,27],[g-6,21]],'#241337','#ff4aaa');
      rect(g-3,17,6,8,'#ffbd55');
      line(g,26,g,31+7*pulse,'#ff7d47',4);
      poly([[side*50,-11],[side*61,-3],[side*50,1]],'#ffbc5d','#ff6f92');
    }
    poly([[-13,15],[0,27],[13,15]],'#8d2f75','#ff76ba');
    rect(-8,26,16,4,'#ffbb68');
    line(-38,-9,-17,-13,'#ffa3cd',2);line(17,-13,38,-9,'#ffa3cd',2);
    ctx.restore();
  }
  function drawBoss(x,y,e) {
    const kind=e.kind||0,meta=BOSS_TYPES[kind];
    const art=[assets.bossManta,assets.bossSerpent,assets.bossCitadel,assets.bossEclipse][kind];
    ctx.save();ctx.translate(x,y+Math.sin(e.wobble*1.5)*4);ctx.rotate(Math.sin(e.wobble*.7)*.025);
    ctx.shadowColor=meta.color;ctx.shadowBlur=25;
    ctx.fillStyle=meta.color+'25';ctx.beginPath();ctx.ellipse(0,7,137,57,0,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=10;
    if(art.complete&&art.naturalWidth)ctx.drawImage(art,-150,-91,300,182);
    else {rect(-104,-35,208,70,'#28183f');rect(-25,-26,50,52,meta.color);}
    ctx.restore();
    ctx.save();ctx.strokeStyle=e.weakFlash?'#fffed0':meta.color;ctx.lineWidth=e.weakFlash?5:2;ctx.shadowColor=meta.color;ctx.shadowBlur=14+Math.sin(state.time*7)*5;ctx.beginPath();ctx.arc(x,y,26+Math.sin(state.time*5)*3,0,Math.PI*2);ctx.stroke();ctx.restore();
    line(x-37,y,x-30,y,meta.color,2);line(x+30,y,x+37,y,meta.color,2);
    rect(x-120,y-120,240,8,'#291e37');
    rect(x-120,y-120,240*Math.max(0,e.hp/(e.maxHp||1)),8,meta.color);
    text(meta.name,x,y-139,14,meta.color,'center',900);
    text('GLOWING CORE = EXTRA DAMAGE',x,y+99,11,meta.color,'center',900);
  }
  function drawEntities() {
    for(const pickup of state.pickups) {
      const x=sx(pickup.x);if(x<-35||x>WIDTH+35)continue;
      const y=sy(pickup.z)+Math.sin(pickup.pulse)*5;
      ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);
      ctx.shadowColor=COLORS.green;ctx.shadowBlur=14;
      rect(-18,-18,36,36,'#0c3442');ctx.strokeStyle=COLORS.green;ctx.lineWidth=3;ctx.strokeRect(-18,-18,36,36);
      ctx.restore();
      rect(x-3,y-11,6,22,COLORS.green);rect(x-11,y-3,22,6,COLORS.green);
      text('1UP',x,y-43,13,COLORS.green,'center',900);
    }
    for(const drop of state.weaponDrops) {
      const x=sx(drop.x);if(x<-30||x>WIDTH+30)continue;
      const y=sy(drop.z)+Math.sin(drop.pulse)*4,color=WEAPONS[drop.type].color;
      ctx.save();ctx.globalAlpha=.45+.3*Math.sin(state.time*6);line(x,y-68,x,y-25,color,3);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,27+Math.sin(state.time*6)*4,0,Math.PI*2);ctx.stroke();ctx.restore();
      ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);ctx.shadowColor=color;ctx.shadowBlur=14;
      rect(-17,-17,34,34,'#111c35');ctx.strokeStyle=color;ctx.lineWidth=3;ctx.strokeRect(-17,-17,34,34);ctx.restore();
      text(({spread:'F',seeker:'M',rail:'P',twin:'T',plasma:'B',nova:'N'})[drop.type],x,y-12,21,color,'center',900);
      text(WEAPONS[drop.type].name,x,y-40,11,color,'center',900);
    }
    for(const c of state.civilians) {if(c.state==='saved'||c.state==='lost')continue;const x=sx(c.x);if(x < -25||x>WIDTH+25)continue;const y=sy(c.z);sprite(assets.settler,x-18,y-22,36,44);if(c.state==='enemy')line(x,y-20,x,y-44,COLORS.pink,2);if(c.panic&&c.state==='ground'&&Math.sin(state.time*11)>0)text('!',x,y-51,17,COLORS.gold,'center',900);}
    for(const e of state.enemies) {const x=sx(e.x);if(x < -45||x>WIDTH+45)continue;const y=sy(e.z+Math.sin(e.wobble)*4);
      if(e.fireTimer>=0&&e.fireTimer<.65){const tellColor=({interceptor:'#ff74ce',spore:'#a7ff82',phantom:'#bf9bff',starburst:COLORS.orange,boss:BOSS_TYPES[e.kind||0]?.color})[e.type];if(tellColor){ctx.save();ctx.globalAlpha=(.65-e.fireTimer)/.65;ctx.strokeStyle=tellColor;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,e.type==='boss'?105:43+Math.sin(state.time*18)*3,0,Math.PI*2);ctx.stroke();ctx.restore();}}
      if(e.type==='starburst'){ctx.save();ctx.translate(x,y);ctx.rotate(e.wobble*.55);ctx.shadowColor=COLORS.orange;ctx.shadowBlur=12; sprite(assets.starburst,-41,-41,82,82);ctx.restore();}
      else if(e.type==='interceptor'){ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(e.wobble*1.8)*.08);ctx.shadowColor='#ff4ed0';ctx.shadowBlur=13;sprite(assets.interceptor,-52,-37,104,74);ctx.restore();}
      else if(e.type==='spore'){ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(e.wobble*.8)*.12);ctx.shadowColor='#8eff70';ctx.shadowBlur=13;sprite(assets.spore,-47,-39,94,78);ctx.restore();}
      else if(e.type==='phantom'){ctx.save();ctx.translate(x,y);ctx.globalAlpha=.82+Math.sin(e.wobble*3)*.13;ctx.shadowColor='#ad83ff';ctx.shadowBlur=18;sprite(assets.phantom,-46,-37,92,74);ctx.restore();}
      else if(e.type==='siege')drawSiegeRaider(x,y,e);
      else if(e.type==='boss')drawBoss(x,y,e);
      else sprite(assets.raider,x-43,y-31,86,62);
    }
    for(const point of state.trail){const x=sx(point.x),y=sy(point.z);ctx.globalAlpha=point.life*.5;rect(x-28,y-16,56,32,COLORS.pink);ctx.globalAlpha=1;}
    for(const shot of state.shots) {const x=sx(shot.x);if(x<-10||x>WIDTH+10)continue;const y=sy(shot.z);if(shot.hazard){line(x-9,y-19,x+7,y+18,COLORS.orange,5);rect(x-4,y-4,8,8,COLORS.gold);}else if(shot.burst){const color=shot.bossKind===undefined?COLORS.orange:BOSS_TYPES[shot.bossKind].color;rect(x-5,y-5,10,10,color);rect(x-2,y-2,4,4,COLORS.pale);}else if(shot.weapon==='rail'){line(x-21,y,x+21,y,WEAPONS.rail.color,6);rect(x-4,y-4,8,8,COLORS.pale);}else if(shot.weapon==='seeker'){line(x-shot.vx*.016,y-shot.vz*.016,x,y,WEAPONS.seeker.color,3);rect(x-5,y-5,10,10,COLORS.pale);}else if(shot.weapon==='plasma'){ctx.save();ctx.shadowColor=WEAPONS.plasma.color;ctx.shadowBlur=14;ctx.fillStyle=WEAPONS.plasma.color;ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.fill();ctx.restore();}else if(shot.weapon==='nova'){rect(x-5,y-5,10,10,WEAPONS.nova.color);rect(x-2,y-2,4,4,COLORS.pale);}else if(shot.weapon==='twin'){rect(x-12,y-2,24,4,WEAPONS.twin.color);}else if(shot.weapon==='spread')rect(x-6,y-3,12,6,WEAPONS.spread.color);else if(shot.enemyKind){rect(x-5,y-5,10,10,{interceptor:'#ff4ed0',spore:'#8eff70',phantom:'#ad83ff'}[shot.enemyKind]);}else rect(x-(shot.player?9:3),y-2,shot.player?18:6,4,shot.player?COLORS.gold:COLORS.pink);}
    const p=state.player;
    if(p.invuln<=0||(p.invuln%.18)<.11) {
      const x=WIDTH/2,y=sy(p.z);
      const cargo=carriedSettlers();
      let lastX=x,lastY=y+24;
      for(const c of cargo){const cx=sx(c.x),cy=sy(c.z);line(lastX,lastY,cx,cy,COLORS.green,2);rect(cx-3,cy-3,6,6,COLORS.gold);lastX=cx;lastY=cy;}
      ctx.save();ctx.translate(x,y);if(p.facing<0)ctx.scale(-1,1);ctx.filter=PILOTS[state.pilot].filter;sprite(assets.ship,-48,-31,96,62);ctx.restore();
      if(p.shield>0||(state.pilot===2&&p.abilityTime>0)){ctx.beginPath();ctx.arc(x,y,55,0,Math.PI*2);ctx.strokeStyle=state.pilot===2?COLORS.pink:COLORS.cyan;ctx.lineWidth=3;ctx.stroke();}
      if(p.turboActive){ctx.save();ctx.shadowColor=COLORS.cyan;ctx.shadowBlur=18;for(const side of [-1,1])line(x-34*p.facing,y+side*15,x-(90+Math.sin(state.time*37+side)*14)*p.facing,y+side*19,COLORS.cyan,5);ctx.restore();}
      else if(Math.abs(p.vx)>60)line(x-24*p.facing,y,x-(35+Math.abs(p.vx)*.02)*p.facing,y,COLORS.cyan,2);
    }
  }
  function drawHud() {
    rect(0,0,WIDTH,108,'#0b1225');line(0,106,WIDTH,106,COLORS.pink,2);
    text('SCORE',18,5,12,COLORS.pale);
    text(scoreText(state.score),18,20,27,COLORS.gold);
    text(`TOP ${scoreText(topScores[0]?.score||0)}`,252,22,17,COLORS.cyan);
    text(`${WEAPONS[state.weapon].name}  ${state.weapon==='blaster'?'∞':state.weaponAmmo[state.weapon]}`,WIDTH/2+145,17,17,WEAPONS[state.weapon].color,'center',900);
    text(PILOTS[state.pilot].name,WIDTH-20,8,18,PILOTS[state.pilot].color,'right');
    text(`LIVES ${state.lives}    WAVE ${state.wave}    SAFE ${state.saved}    LOST ${state.lost}    CARGO ${carriedSettlers().length}/${capacity()}`,18,50,15,COLORS.pale);
    text('BOOST',760,50,12,COLORS.cyan);rect(814,54,165,10,'#19304b');rect(814,54,165*state.player.turboEnergy/100,10,state.player.turboLocked?'#70899e':state.player.turboActive?'#fff6a6':COLORS.cyan);
    text(`HAVEN ${Math.round(state.haven)}%`,WIDTH-20,50,15,state.haven>35?COLORS.green:COLORS.pink,'right');
    const rx=18,rw=WIDTH-36,ry=74;rect(rx,ry,rw,20,'#142b3e');line(rx,ry+20,rx+rw,ry+20,COLORS.cyan);rect(rx,ry,5,20,COLORS.cyan);
    if(state.hazard?.type!=='asteroids'){const hx=rx+state.hazard.center/WORLD*rw;rect(hx-8,ry+2,16,16,state.hazard.type==='storm'?'#9455eb':'#d32e82');}
    for(const c of state.civilians) if(c.state==='ground'||c.state==='falling')rect(rx+c.x/WORLD*rw,ry+13,c.panic?6:4,5,c.panic?COLORS.gold:COLORS.green);
    for(const pickup of state.pickups)rect(rx+pickup.x/WORLD*rw-3,ry+4,7,12,COLORS.green);
    for(const drop of state.weaponDrops)rect(rx+drop.x/WORLD*rw-3,ry+3,7,10,WEAPONS[drop.type].color);
    for(const e of state.enemies)rect(rx+e.x/WORLD*rw,ry+3,e.type==='boss'?12:e.type==='starburst'?7:5,6,e.type==='boss'?BOSS_TYPES[e.kind||0].color:({siege:COLORS.gold,starburst:COLORS.orange,interceptor:'#ff4ed0',spore:'#8eff70',phantom:'#ad83ff'}[e.type]||COLORS.pink));
    const px=rx+state.player.x/WORLD*rw;rect(px-3,ry+1,7,18,PILOTS[state.pilot].color);
    for(const side of [-1,1]){const boundary=wrap(state.player.x+side*VIEW*.5),bx=rx+boundary/WORLD*rw;line(bx,ry,bx,ry+20,COLORS.pale);}
    rect(0,PLAY_BOTTOM,WIDTH,HEIGHT-PLAY_BOTTOM,'#0b1225');
    const ability=state.player.abilityCooldown>0?`${Math.ceil(state.player.abilityCooldown)}s`:'READY';
    text(`R: ${ABILITIES[state.pilot]} ${ability}    SHIELDS ${state.player.shield}    TURBO ${state.upgrades.turbo}/5    HAZARD ${state.hazard?.type.toUpperCase()||'NONE'}`,18,HEIGHT-43,13,PILOTS[state.pilot].color);
    text(`NEXT WAVE ${Math.max(0,Math.ceil(waveLimit()-state.waveElapsed))}s`,WIDTH-18,HEIGHT-43,13,COLORS.gold,'right');
    if(!touchCapable)text(`WASD / ARROWS: THRUST    SHIFT: BOOST    SPACE: FIRE    X: SWITCH GUN    F: AUTO FIRE ${state.autoFire?'ON':'OFF'}    R: ABILITY    ESC: PAUSE`,18,HEIGHT-24,12,COLORS.pale);
    if(state.mission){const m=state.mission,label=m.type==='rescue'?'SAVE SETTLERS':m.type==='destroy'?'DESTROY RAIDERS':'DEFEND HAVEN';const progress=Math.floor(m.progress);const left=Math.max(0,Math.ceil(m.deadline-state.time));text(`OBJECTIVE: ${label} ${progress}/${m.target}  •  ${m.status==='active'?`${left}s`:m.status.toUpperCase()}`,18,PLAY_TOP+10,14,m.status==='complete'?COLORS.green:m.status==='failed'?COLORS.pink:COLORS.cyan);}
    if(state.noticeTime>0)text(state.notice,18,PLAY_TOP+32,18,COLORS.gold);
    if(state.bossIntroTime>0){const boss=state.enemies.find(enemy=>enemy.type==='boss');if(boss){const meta=BOSS_TYPES[boss.kind||0];rect(WIDTH/2-235,PLAY_TOP+16,470,62,'#0b102bdc');text(meta.name+' INBOUND',WIDTH/2,PLAY_TOP+19,24,meta.color,'center',900);text('AIM AT THE GLOWING CORE FOR EXTRA DAMAGE',WIDTH/2,PLAY_TOP+50,13,COLORS.pale,'center',900);}}
    const nearestDrop=state.weaponDrops.filter(drop=>Math.abs(delta(state.player.x,drop.x))<550&&Math.abs(state.player.z-drop.z)<260).sort((a,b)=>Math.abs(delta(state.player.x,a.x))-Math.abs(delta(state.player.x,b.x)))[0];
    if(nearestDrop){const weapon=WEAPONS[nearestDrop.type];rect(14,PLAY_TOP+57,350,28,'#081629dc');text(`POD AHEAD  ${weapon.name}  •  ${weapon.desc}`,21,PLAY_TOP+63,12,weapon.color);}
    if(state.rescueChallenge){const c=state.rescueChallenge,label=c.kind==='chain'?'DELIVER 2 IN ONE CHAIN':c.kind==='rush'?'DELIVER 1 BEFORE TIMER':'DELIVER 2 THIS WAVE';text(`BONUS RESCUE: ${label}  +${c.bonus}  ${c.status==='active'?`${Math.max(0,Math.ceil(c.deadline-state.time))}s`:c.status.toUpperCase()}`,18,PLAY_TOP+94,12,c.status==='complete'?COLORS.green:c.status==='expired'?'#8395a5':COLORS.gold);}
  }
  function draw() {
    if(state.phase==='title')return;
    ctx.setTransform(canvas.width/WIDTH,0,0,canvas.height/HEIGHT,0,0);
    drawSky();drawTerrain();drawHaven();drawEntities();drawHud();
  }
  function resizeCanvas() {
    const rect=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.max(1,Math.round(rect.width*dpr));canvas.height=Math.max(1,Math.round(rect.height*dpr));
  }
  new ResizeObserver(resizeCanvas).observe(frame);resizeCanvas();
  let previous=performance.now();
  function loop(now) {
    const dt=Math.min((now-previous)/1000,.05);previous=now;
    pollGamepad();if(state.phase==='playing'&&!state.paused)update(dt);
    updateMusic(dt);
    draw();requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  document.addEventListener('keydown',event=>{
    if(event.target===$('initialsInput'))return;
    const code=event.code;
    if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab','Escape'].includes(code))event.preventDefault();
    if(!event.repeat) {
      unlockAudio();
      if(code==='Escape'){if(state.phase==='playing')setPaused(!state.paused);return;}
      if(state.phase==='title') {
        if(/^Digit[1-4]$/.test(code))selectPilot(Number(code.slice(-1))-1);
        else if(code==='ArrowLeft')selectPilot((state.pilot+3)%4);
        else if(code==='ArrowRight')selectPilot((state.pilot+1)%4);
        else if(code==='Space'||code==='Enter')startGame();
      } else if(state.phase==='gameover') {
        if(code==='Space'||code==='Enter')startGame();
        else if(code==='Tab')showTitle();
      } else if(state.phase==='hangar') {
        if(/^Digit[1-4]$/.test(code))nextWave(['engine','turbo','shield','rescue'][Number(code.slice(-1))-1]);
        else if(code==='Enter'||code==='Space')nextWave();
      } else if(state.phase==='playing'&&!state.paused) {
        if(code==='KeyQ')state.player.facing=-1;
        if(code==='KeyE')state.player.facing=1;
        if(code==='KeyF')toggleAutoFire();
        if(code==='KeyX')cycleWeapon();
        if(code==='KeyR')activateAbility();
        if(code==='Space'&&state.player.fireTimer<=0)fire();
      }
    }
    keys.add(code);
  });
  document.addEventListener('keyup',event=>keys.delete(event.code));
  window.addEventListener('blur',()=>{keys.clear();mouseFire=false;for(const key of Object.keys(touch))touch[key]=false;if(state.phase==='playing'&&!state.paused)setPaused(true);});
  canvas.addEventListener('pointerdown',event=>{if(state.phase==='playing'&&!state.paused){unlockAudio();mouseFire=true;if(state.player.fireTimer<=0)fire();canvas.setPointerCapture(event.pointerId);}});
  canvas.addEventListener('pointerup',()=>{mouseFire=false;});canvas.addEventListener('pointercancel',()=>{mouseFire=false;});
  cards.forEach(card=>card.addEventListener('click',()=>{unlockAudio();selectPilot(Number(card.dataset.pilot));}));
  $('launchButton').addEventListener('click',startGame);
  $('restartButton').addEventListener('click',startGame);
  $('changePilotButton').addEventListener('click',showTitle);
  $('pauseButton').addEventListener('click',()=>setPaused(!state.paused));
  $('resumeButton').addEventListener('click',()=>setPaused(false));
  $('titleButton').addEventListener('click',showTitle);
  $('skipUpgradeButton').addEventListener('click',()=>nextWave());
  document.querySelectorAll('[data-upgrade]').forEach(button=>button.addEventListener('click',()=>nextWave(button.dataset.upgrade)));
  $('soundButton').addEventListener('click',toggleSound);
  $('voiceButton').addEventListener('click',toggleVoice);
  $('autoFireButton').addEventListener('click',toggleAutoFire);
  $('initialsInput').addEventListener('input',event=>{event.target.value=event.target.value.toUpperCase().replace(/[^A-Z]/g,'').slice(0,3);});
  $('scoreEntry').addEventListener('submit',event=>{event.preventDefault();saveScore();});
  document.querySelectorAll('[data-control]').forEach(button=>{
    const control=button.dataset.control;
    button.addEventListener('pointerdown',event=>{event.preventDefault();button.setPointerCapture(event.pointerId);unlockAudio();button.classList.add('active');if(control==='turn')state.player.facing*=-1;else if(control==='ability')activateAbility();else if(control==='weapon')cycleWeapon();else if(control==='fire'){touch.fire=true;if(state.player.fireTimer<=0)fire();}else touch[control]=true;});
    for(const name of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(name,()=>{button.classList.remove('active');if(control in touch)touch[control]=false;});
  });
  $('pauseButton').disabled=true;
  refreshScoreViews();
  if(!voiceSupported){$('voiceButton').disabled=true;$('voiceButton').textContent='◖ VOICE UNAVAILABLE';$('voiceButton').setAttribute('aria-pressed','false');}
})();
