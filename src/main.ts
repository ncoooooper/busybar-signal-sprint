import {surface,panel,rect,label,read,persist,type Frame} from "@shared/surface";
type Mode="ready"|"waiting"|"green"|"orange"|"result";
let mode:Mode="ready",shown=0,score=0,best=read("best",0),verdict="",phase=0;
let timer:ReturnType<typeof setTimeout>|undefined;
function after(ms:number,fn:()=>void){if(timer!==undefined)clearTimeout(timer);timer=setTimeout(()=>{timer=undefined;fn();},ms);}
function wait(){mode="waiting";refresh();after(800+Math.floor(Math.random()*2200),()=>{
 mode=Math.random()<0.48?"orange":"green";shown=0;refresh();
 if(mode==="orange")after(950,wait);});}
function finish(text:string,win=false){
 if(timer!==undefined){clearTimeout(timer);timer=undefined;}verdict=text;mode="result";phase=0;
 if(win&&(!best||score<best)){best=score;persist("best",best);}
 function advance(){phase++;refresh();if(phase<5)after(65,advance);}
 advance();
}
function draw():Frame{
 let art:Frame=[];
 if(mode==="green"||mode==="orange")art=[rect("signal",0,0,72,16,mode==="green"?"#51ED8CFF":"#F9A23DFF")];
 else if(mode==="ready"||mode==="result"){const won=verdict==="Reaction";
 art=[label("cap",mode==="ready"?"REACTION":verdict.toUpperCase(),1,0,"#FFD698FF","front","tiny"),label("val",mode==="ready"?"Tap to start":won?score+" ms":"Try again",1,7,won?"#8AFFB8FF":"#FFE9C9FF")];
 if(mode==="result")for(let i=0;i<phase;i++)art.push(rect("ray"+i,60+2*i,won?12-i:2+i,1,3,won?"#61E096FF":"#EC8452FF"));}
 return [...art,...panel("SIGNAL SPRINT",["Green: press the wheel","Orange or black: wait",best?"Best "+best+" ms":"No best yet",mode==="result"?verdict:"Press to start a round"])];
}
function pressWheel(){
 if(mode==="ready"||mode==="result")wait();
 else if(mode==="green"&&shown){score=Math.max(0,Date.now()-shown);finish("Reaction",true);}
 else finish(mode==="orange"?"Wrong color":"Too early");}
const refresh=surface(draw,()=>{},()=>{if(timer!==undefined)clearTimeout(timer);},{enabled:false,pressWheel,painted:frame=>{if(mode==="green"&&!shown&&frame.some(e=>e.id==="signal"))shown=Date.now();}});
