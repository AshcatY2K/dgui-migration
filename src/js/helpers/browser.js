export function browser () {
  let agent = navigator.userAgent.toLowerCase();
         
  return agent.match( /chrome|chromium|crios/i ) ? "chrome" : 
    agent.match( /firefox|fxios/i ) ? "firefox" :
    agent.match( /safari/i ) ? "safari" :
    agent.match( /opr\//i ) ? "opera" : 
    agent.match( /edg/i ) ? "edge" : "No browser detection";
}