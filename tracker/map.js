
let lat = 48.8408075;
let lon = 2.5873473;
let precision = 18.747;

let latUni = 55.87171291246245;
let lonUni = -4.288390874862672;

var map = L.map('map').setView([latUni, lonUni], 14);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


/**************** tracker  **************** */

let track = Vue.createApp({
  data() {
    return {
      nom:"session0",
      lstEvents: [],
      nbEvents: 0,

      dataEvents: [],
      dataMouseEvents:[],

      starttime: 0,
      time: {
        minutes: 0,
        secondes: 0,
        milisec: 0
      },
      etat: {
        run: true,
        stop: false
      },
    };
  },
  methods: {
    start () {
      this.startTime = Date.now();

      map.on('dblclick click zoom dragstart dragend zoomstart zoomend movestart move moveend', onMapClick);
      map.on('mousemove', onMapClick);
      document.getElementById("map").addEventListener("wheel", detectTrackPad, true);


      if (this.etat.run){
        chronoStart();
        this.etat.run = false;
      }
      else{
        chronoStop();
        let csvContent = dicoToFormatCSV(this.dataEvents);
        dataToCSV(csvContent, "allEvents");
        let csvContentMouse = dicoToFormatCSV(this.dataMouseEvents);
        dataToCSV(csvContentMouse, "mouseMoveEvents");

        map.off('dblclick click zoom dragstart dragend movestart move moveend zoomstart zoomend', onMapClick);
        map.off('mousemove', onMapClick);
        document.getElementById("map").removeEventListener("wheel", detectTrackPad, false);
        
        this.dataEvents = [];
        this.dataMouseEvents = [];
        this.nbEvents = 0;
        this.lstEvents = [];
      }
    },

  },

}).mount('#tracker');


/**************** chrono  **************** */

function onMapClick(e) {

  let ev = ['click', 'dblclick', 'zoom', 'dragstart', 'dragend', 'movestart', 'move', 'moveend', 'zoomstart', 'zoomend'];

  let dicoTemps = {
              min:track.time.minutes,
              sec:track.time.secondes,
              mili:track.time.milisec
              };
              allEvents
  let temps = JSON.stringify(dicoTemps);

  if (ev.includes(e.type)){
    track.nbEvents++;
    track.lstEvents.push(e);
    return track.dataEvents.push(createDicoEvent(e, temps));
  }

  if (e.type == 'mousemove'){
    return track.dataMouseEvents.push(createDicoEvent(e, temps));
  }
}

function createDicoEvent(e, temps){

  let dico = {};
  let type = e.type;
  // let NOcorner = L.point(0,0);
  // let center = L.point(250,250);
  let trans = e.target._mapPane._leaflet_pos

  dico['type'] = type;



  dico['temps'] = temps;
  dico['time_computer'] = Date.now()+"";
  dico['posLatLon'] = 'null';
  dico['posPix'] = 'null';
  dico['NOcorner'] = 'null';
  dico['no_corner_lat'] = 'null';
  dico['no_corner_lng'] = 'null';
  dico['center'] = 'null';
  dico['center_lat'] = 'null';
  dico['center_lng'] = 'null';
  dico['nivZoom'] = map.getZoom();
  dico['trans'] = 'null';

  if (type == 'click' || type == 'dblclick' || type == 'mousemove'){
    dico['posLatLon'] = e.latlng;
    dico['posPix'] = e.containerPoint;
  }
  else{
    dico['NOcorner'] =  map.getBounds().getNorthWest();
    dico['no_corner_lat'] =  map.getBounds().getNorthWest().lat;
    dico['no_corner_lng'] =  map.getBounds().getNorthWest().lng;

    dico['center'] = map.getCenter();
    dico['center_lat'] = map.getCenter().lat;
    dico['center_lng'] = map.getCenter().lng;

    dico['trans'] = trans;
  }

  return dico;
}


/**************** chrono  **************** */
let timer;

chronoStart = function() {
  timer = setInterval(function() {
    let now = Date.now();
    let diff = new Date(now-track.startTime)
    track.time.minutes = diff.getMinutes();
    track.time.secondes = diff.getSeconds();
    track.time.milisec = diff.getMilliseconds();
  }, 100);
  setEtat(false, true);
};

chronoStop = function() {
  clearInterval(timer);
  setEtat(true, false);
};

setEtat = function(run, stop) {
  track.etat.run = run;
  track.etat.stop = stop;     
};

/**************** detect trackpad **************** */
let oldTime = 0;
let newTime = 0;
let isTrackPad;
let eventCount = 0;
let eventCountStart;

function detectTrackPad(e) {
  let isTrackPadDefined = isTrackPad || typeof isTrackPad !== "undefined";
  
  if (isTrackPadDefined) return;
  
  if (eventCount === 0) {
    eventCountStart = performance.now();
  }

  eventCount++;

  if (performance.now() - eventCountStart > 66) {
    if (eventCount > 6) {
      isTrackPad = true;
      
      track.dataEvents.push(["Using trackpad"]);
    } else {
      isTrackPad = false;
      
      track.dataEvents.push(["Using mouse"]);
    }
    isTrackPadDefined = true;
  }
};
