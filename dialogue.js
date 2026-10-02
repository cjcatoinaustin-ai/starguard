/* Original Starguard radio dialogue. Each event has a shuffled pool; a pilot always answers Vega. */
window.STARGUARD_DIALOGUE = {
  hq: {
    pickup: [
      'One rescue beacon just went green. Bring that settler in.',
      'You have a passenger. Haven One is clearing the approach.',
      'Good catch. Watch the sky on your way back.',
      'Life sign secured. The settlement is ready to receive them.',
      'That is one less person for the raiders to take.',
      'Cargo registered as precious. Fly like it.'
    ],
    rescue: [
      'Haven One confirms a safe arrival. Nicely done.',
      'Their family is at the landing pad. You made that reunion happen.',
      'Another door opens in the settlement tonight because of you.',
      'Medical team says your passenger is safe. Head back out when ready.',
      'That landing brought our people home. Excellent work.',
      'One more light is on at Haven One. Keep it going.'
    ],
    freed: [
      'The tractor beam broke. Catch that falling settler!',
      'They are clear of the raider. You have seconds to reach them.',
      'Great shot. Rescue beacon is dropping fast.',
      'Captive released. Get under them before the ground does.',
      'That raider lost its grip. You can still save our person.',
      'I see a parachute signal. Move in for the catch.'
    ],
    lost: [
      'A beacon went dark. We keep flying for the people still out there.',
      'One settler is gone. Breathe, reset, protect the next one.',
      'The raiders took someone. I am marking the remaining signals for you.',
      'We cannot change that loss. We can stop the next one.',
      'Haven One felt that one. Stay with us, pilot.',
      'That was a hard loss. Our rescue window is still open.'
    ],
    hit: [
      'Hull alarms just lit up. Are you still with me?',
      'That was a heavy strike. Keep your ship moving.',
      'Engineering sees the damage. You still have a flight path.',
      'Raider fire on your tail. Shake them and recover.',
      'Your shield flashed red. Give yourself room to maneuver.',
      'I saw that impact. Report in, pilot.'
    ],
    hurry: [
      'Two rescue signals are drifting toward raider patrols. Check your radar.',
      'The landing lights are on, but our people are still outside.',
      'Do not let the quiet sky fool you. The raiders are hunting.',
      'I have more life signs than safe houses. Find them, pilot.',
      'Our window is narrowing. Pick the closest signal and move.',
      'Haven One has room for more. Let us fill those seats.'
    ],
    clear: [
      'The radar is clean for a moment. Catch your breath.',
      'Wave broken. My screen is already building the next threat map.',
      'That sector is yours. Bring any stragglers home.',
      'Hostiles cleared. The people below can see your lights.',
      'You bought Haven One breathing room. Well done.',
      'The raiders are pulling back. Enjoy the silence while it lasts.'
    ],
    kill: [
      'One raider off the board. Their formation is opening.',
      'Good shot. You just made a rescue lane.',
      'Target vanished from radar. Clean work.',
      'That drone will not bother another settler.',
      'I saw the hit. Keep the sky clear for our people.',
      'Raider down. Their wingman is losing confidence.'
    ],
    haven: [
      'Haven One is taking fire. We need you over the settlement.',
      'The landing pad is under attack. Turn for home.',
      'Our defense grid is failing. Your ship is the last line.',
      'Those raiders are aiming for the shelters. Stop them.',
      'Haven One needs cover now. I am painting the attackers.',
      'Settlement alarm is sounding. Get between our people and those guns.'
    ],
    boss: [
      'Capital raider entering the sector. Do not fly straight at its guns.',
      'That silhouette is no scout. Its armor will take repeated hits.',
      'Heavy ship on radar. Break its attack before it reaches Haven One.',
      'Enemy flagship sighted. Its size makes it an easy target if you keep moving.',
      'There is our biggest problem. Let us make it smaller.',
      'Capital-class threat inbound. I trust your flying more than its armor.'
    ],
    mission: [
      'A fresh priority is on your display. You choose the route.',
      'Command has a timed objective. Keep the settlers in sight.',
      'New mission marker is live. The bonus is yours if you make it.',
      'I have a short window and a clear target for you.',
      'Your HUD has the new assignment. Make every second count.',
      'There is an opportunity on radar. Take it if the sky allows.'
    ],
    success: [
      'Objective complete. Haven One is sending a cheer your way.',
      'Timed mission secured. That was sharp work.',
      'Command confirms the bonus. More importantly, you kept us safe.',
      'You beat the clock and the raiders. Excellent flying.',
      'That is a clean mission report. I wish they all looked like that.',
      'Priority task complete. I knew you could make that run.'
    ],
    failure: [
      'The timer is gone. The rescue mission is still here.',
      'We missed that objective. Keep the main route open.',
      'Command is closing that assignment. Stay focused on Haven One.',
      'The bonus window shut. Our people still need you.',
      'That clock won this round. The raiders have not.',
      'No time to dwell on the missed mark. Follow the life signs.'
    ],
    storm: [
      'Ion weather is rolling across your path. Give it a wide berth.',
      'Hazard warning. I am putting the safest lane on your radar.',
      'The sky is fighting us now. Keep the ship steady.',
      'Sensors are noisy ahead. Trust your eyes and your shield.',
      'You are crossing rough space. Watch for incoming debris.',
      'The storm line just shifted. Adjust your approach.'
    ],
    admire: [
      'Nicole, you are lighting up the whole sector. Beautiful flying.',
      'I have seen a lot of pilots. None make that pink ship look as good as you.',
      'Beautiful work out there, Nicole. You give Haven One hope.',
      'That sky has stars, but you are the brightest thing on my screen.'
    ]
  },
  personal: {
    1: {
      pickup: ['Nice reception, Michael. Now run it back to the home field.','Secure catch. The defense never saw your route.'],
      rescue: ['Touchdown at Haven One. The crowd would be on its feet.','That was a perfect end-zone delivery, Michael.'],
      freed: ['That is an interception in midair. Go make the catch.','Loose ball, Michael. Get underneath that settler.'],
      lost: ['Tough turnover. Call the next play and protect our people.','The scoreboard hurts, but this game is not over.'],
      hit: ['Hard hit, Michael. Keep your feet and keep flying.','They blitzed you. Time to slip past the next rush.'],
      hurry: ['Two-minute drill, Michael. Pick a lane and go.','The clock is moving. Make this drive count.'],
      clear: ['You won that quarter. Another one is coming.','Defense held the line. Take a breath, Michael.'],
      kill: ['That raider just got sacked. Excellent pressure.','Clean tackle in open space. Our rescue lane is clear.'],
      haven: ['Protect the home field, Michael. The shelters are behind you.','Goal-line stand. Nothing gets past your ship.'],
      boss: ['Biggest defender on the field. Find its weak side.','Fourth-quarter opponent on radar. You know how to finish.'],
      mission: ['New play from the sideline. It is on your HUD.','A timed drive is yours, Michael.'],
      success: ['That was a game-winning drive. Beautiful execution.','You beat the clock, Michael. Touchdown.'],
      failure: ['That play expired. We still have another down.','Missed the clock, not the mission. Reset the offense.'],
      storm: ['Slippery field ahead. Keep control of the ship.','Weather delay is not an option. Fly smart.']
    },
    2: {
      pickup: ['Nicole, that was beautiful flying. Bring our neighbor home.','A beautiful rescue, Nicole. Your pink ship is their lucky star.'],
      rescue: ['Nicole, you look beautiful on the landing feed. Another life safe.','Beautiful work. Haven One is brighter every time you return.'],
      freed: ['Beautiful shot, Nicole. Now catch our falling friend.','That was dazzling. You freed them; finish the rescue.'],
      lost: ['Nicole, your heart is beautiful. Stay strong for the next settler.','A hard moment. Your courage is beautiful, Nicole.'],
      hit: ['Still beautiful under pressure, Nicole. Check your hull.','That was close. Beautiful recovery on the controls.'],
      hurry: ['Nicole, we have a long way to go—like your commute to FrouFrou in Austin.','Beautiful pilot, more signals are waiting on your radar.'],
      clear: ['Beautiful work, Nicole. Even the stars are cheering.','Your pink ship made that whole sector shine.'],
      kill: ['Beautiful shot. One less raider between us and home.','That was gorgeous flying, Nicole. Target down.'],
      haven: ['Nicole, your beautiful flying is needed over Haven One.','Pink ship to the rescue. Keep our settlement safe.'],
      boss: ['Big ship, beautiful pilot. I know which one I am betting on.','Nicole, show that flagship what your beautiful pink ship can do.'],
      mission: ['A new mission for our beautiful pilot. It is on your HUD.','Nicole, I trust your judgment. Take the route that saves lives.'],
      success: ['Beautifully done, Nicole. You beat the clock.','That was a beautiful run from start to finish.'],
      failure: ['You are still our beautiful, fearless pilot. Keep going.','One clock expired. Your beautiful spirit did not.'],
      storm: ['Even an ion storm cannot dim you, Nicole. Fly carefully.','Beautiful pilot, rough skies ahead. I am watching your route.'],
      admire: ['Nicole, beautiful as always. Haven One is lucky to have you.','That pink ship and its beautiful pilot are the best sight on my radar.']
    },
    3: {
      pickup: ['Valor Flight School rescue drills are paying off, Zachary.','Smooth pickup. Did Valor teach that, or was it VR?'],
      rescue: ['Valor would give that landing top marks.','Those VR hours paid off. You brought them home.'],
      freed: ['That looked like a VR reflex challenge. Now catch them.','Valor cadet, your next exercise is an actual rescue.'],
      lost: ['Even the best Valor cadets miss a signal. Take the next one.','This is not a simulation, Zachary. Stay focused and keep going.'],
      hit: ['VR reflexes kept you alive. Valor flying keeps you in the fight.','That was a real hit, Zachary. Your training held.'],
      hurry: ['Valor Flight School would tell you to move on the nearest signal.','No respawn button out here. Reach those settlers, Zachary.'],
      clear: ['Sector clear. I think Valor owes you extra credit.','That was a high-score run worthy of your VR practice.'],
      kill: ['Target down. Your VR aim is finally paying rent.','Valor gave you wings; VR gave you reflexes. Nice shot.'],
      haven: ['Defend Haven One, Zachary. Valor prepared you for this.','This is the final level, except the settlement is real.'],
      boss: ['Boss encounter, Zachary. Your VR instincts have a job.','Valor training and a boss fight. You were made for this.'],
      mission: ['New assignment. Show me that Valor discipline.','Timed objective on your HUD. Think of it as a VR challenge.'],
      success: ['Valor Flight School can put that on your report card.','Objective complete. That was a real-world high score.'],
      failure: ['A missed objective is a lesson. Valor knows that too.','The clock won. You still have the controls, Zachary.'],
      storm: ['Use your VR reflexes, but trust the real horizon.','Valor weather training is about to earn its keep.']
    }
  },
  pilot: {
    0: {
      pickup: ['Passenger secure. I am taking the safe lane.','I have them, Vega. Home is the next stop.','Settler aboard. Keeping the engines smooth.'],
      rescue: ['They are safe. Heading back into the dark.','That is why I fly. Find me the next beacon.','Home delivery complete. My ship is ready.'],
      freed: ['I can see them falling. Closing fast.','I broke the beam. Now I am making the catch.','On their position. Give me a second.'],
      lost: ['I hate that call. I will reach the next one.','Understood. I am changing my route now.','I am still here for the others.'],
      hit: ['Still flying. Damage is manageable.','I have the controls. Give me a clear heading.','That shook the cockpit, but I am okay.'],
      hurry: ['Nearest life sign is on my radar.','I have a route. Moving now.','No one else gets left out there.'],
      clear: ['I will use the quiet to find our people.','Copy. Scanning before the next wave.','I will take that breathing room.'],
      kill: ['Target down. Back to the rescue.','That corridor is open now.','One less problem between us and Haven One.'],
      haven: ['Turning home. I will cover the shelters.','They will have to get through me.','I see the attack. Coming in low.'],
      boss: ['Big target. I will stay out of its sights.','I see an opening in its armor.','Let us take this thing apart.'],
      mission: ['Objective received. I know the route.','Copy. I will balance it with the rescue.','I have the timer. Moving.'],
      success: ['That is one more promise kept.','We did it. Looking for the next signal.','Good. Our people get the benefit.'],
      failure: ['Understood. Returning to the rescue.','I missed the window. I will keep flying.','The next chance will be different.'],
      storm: ['Adjusting altitude. I see the hazard.','I will give the debris room.','Steady hands. I am through this.']
    },
    1: {
      pickup: ['Clean catch. Taking it downfield.','I have our passenger. Time to run it home.','No defenders between me and the end zone.'],
      rescue: ['Touchdown. That is the score that matters.','Settler safe. Put me back in, Coach.','I could hear the crowd from the cockpit.'],
      freed: ['Loose ball! I am under it.','Interception complete. Now for the catch.','I have eyes on them. Going deep.'],
      lost: ['That one stings. Next play starts now.','I will tighten the coverage.','I am not letting the defense break again.'],
      hit: ['Hard tackle. I am back on my feet.','They got a hand on me. I am still moving.','That was roughing the pilot. I am okay.'],
      hurry: ['Two-minute drill starts now.','I see the opening. Full speed.','Clock is ticking. I am moving the chains.'],
      clear: ['End of the quarter. I am ready for the next.','Scoreboard looks better. Keep me in.','That was a good drive. More to come.'],
      kill: ['Sacked. Back to the rescue play.','Their defense just lost a starter.','That one is out of bounds for good.'],
      haven: ['Home-field defense coming up.','I am setting up at the goal line.','Nobody scores on Haven One.'],
      boss: ['Big guy. I will find the gap.','Fourth quarter belongs to us.','That armor has a weak side. I see it.'],
      mission: ['Play received. Running the route.','I have the clock and the target.','Give me the ball. I can make this.'],
      success: ['Touchdown. Good call from the sideline.','We beat the buzzer. Nice.','That is how you finish a drive.'],
      failure: ['I missed that play. Next down.','Clock got me. I am staying on the field.','I will make the next drive count.'],
      storm: ['I will keep my footing.','No weather timeout? Fine by me.','Flying through the rough patch.']
    },
    2: {
      pickup: ['Thank you, Vega. I have them safe.','Passenger aboard. Pink express is heading home.','I have a good feeling about this one.','Everybody buckle up. There is no snack service until Haven One.','Welcome aboard! Please keep all hands inside the pink ship.'],
      rescue: ['They are home! That makes the whole sky brighter.','Thanks, Vega. I am going back for more.','Safe landing. Let us find the next family.','Everyone out! I still have a Whole Foods list and half a galaxy to cross.','Haven One delivery complete. Daddy would be proud of that landing.','Another rescue done. I can still get ready for date night with Daddy.','If Daddy really is making dinner, I have a reason to finish this fast.'],
      freed: ['I see them. I am making the catch.','I am right below them, Commander.','Come on, little ship. We can reach them.'],
      lost: ['That hurts. I am still here for the others.','I will carry that with me and keep going.','I know. Let us save the next one.'],
      hit: ['I am okay. The pink paint barely got scratched.','Still beautiful, still flying.','I am here, Vega. Back on course.','That laser almost chipped my ring. Now I am annoyed.','Alien fire again? I have a first-aid kit and a very strong opinion about it.','These raiders are giving me frown lines. That Botox joke is starting to sound expensive.','Aesthetician hands, steady on the controls. I am fine.'],
      hurry: ['I know a long trip when I see one. On my way.','FrouFrou commute taught me patience. This needs speed.','I see the beacons. I am moving.','If I finish this route, I can still get to church on time.','Fast rescue, then I need to check my Facebook Marketplace pickup.','Daddy spoils me, but even he cannot buy me more time. I am moving.'],
      clear: ['Even the stars look relieved.','A little quiet is nice. I will use it.','That sky is ours for now.'],
      kill: ['One less raider to frighten our people.','Thank you. I am going back to the rescue.','Pretty shot, if I do say so myself.','That one ran faster than me when I remember an Amazon return is due.','That pilot looked like Patrick Swayze for a second. I still had to dodge him.','Maybe they are scared of my fresh foot soak.'],
      haven: ['Turning back. They are my people too.','Pink ship coming home, Commander.','Nobody touches Haven One.'],
      boss: ['It is big. I have a bigger reason to win.','Keep the landing lights on for me.','I will take it one hit at a time.'],
      mission: ['I see the objective. I will make the call.','Copy. I can handle the clock.','On my display. Let us do this.'],
      success: ['Thank you. That was worth the risk.','We made it! Now back to our people.','I love a happy ending.'],
      failure: ['I know. I am still flying for them.','That clock was cruel. I will keep going.','We can still make a difference.'],
      storm: ['I can see the safe lane.','Pink ship, rough sky, steady hands.','No storm is keeping me from them.'],
      admire: ['Thank you, Commander. Eyes on the mission.','You are kind, Vega. I have work to do.','Save the compliments for our landing party!']
    },
    3: {
      pickup: ['Passenger locked in. This part was never in VR.','Valor rescue drill, real-world edition.','I have them. Taking the smooth route.'],
      rescue: ['Safe landing. Did I pass?','That was better than any high score.','Valor would be proud. I am going back.'],
      freed: ['I see the marker. Diving in.','VR reflexes, do your thing.','I have their trajectory. Catching now.'],
      lost: ['I know. This one is real. I will do better.','I am resetting my focus.','There is no restart button. I get it.'],
      hit: ['Reflexes saved me. I am still flying.','That was not in the simulator. I adapted.','I am okay, Vega. Checking my shield.'],
      hurry: ['Valor taught me to act. Acting now.','I see the closest beacon.','Speed run for a good cause.'],
      clear: ['Level clear. I know the next one is coming.','Valor would call that a good sortie.','I am scanning for the next challenge.'],
      kill: ['Target down. VR practice paid off.','That shot felt like a perfect run.','One less red marker on the map.'],
      haven: ['Flying home. Valor defense pattern.','The settlement is the objective. I am on it.','I will hold the line.'],
      boss: ['Boss fight. I have practiced for this.','I see its pattern. I can beat it.','Real bosses do not pause. Neither do I.'],
      mission: ['Quest accepted. Sorry—objective received.','Valor checklist is in my head.','Timer started. Moving now.'],
      success: ['New personal best, and people are safe.','I think Valor would give me full marks.','That was an actual win.'],
      failure: ['Missed the timer. I know what to improve.','No restart. I am still in the mission.','I will be faster on the next one.'],
      storm: ['I see the pattern in the debris.','Valor weather drills, here we go.','A VR storm never felt this real.']
    }
  }
};
