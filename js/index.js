
window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,   
    dbVersion = 1;    
var db;

var videoEl = document.getElementById('home_video1');
openDb(function (){
  downloadVideo('https://video.studi.se/FYH199/FYH199_SE_sv.mp4',document.getElementById('progress1'));
  downloadVideo('https://video.studi.se/FYH198/FYH198_SE_sv.mp4',document.getElementById('progress2'));  
  downloadVideo('https://video.studi.se/FYH120/FYH120_SE_sv.mp4',document.getElementById('progress3'));  
  downloadVideo('https://video.studi.se/FYH121/FYH121_SE_sv.mp4',document.getElementById('progress4'));
});

function loadVideoFromUi(url) {
  console.log('loading ' + url);
  getVideoFromDbAndSetElementSource(url,videoEl);
}

 
function openDb(callback) {
      // Create/open database
    var request = indexedDB.open("videoFiles", dbVersion);
    request.onsuccess = function (event) {
      console.log("Success creating/accessing IndexedDB database");
      db = request.result;
      callback();      
    }
    
    function _createObjectStore(dataBase) { 
          // Create an objectStore
          console.log("Creating objectStore")
          dataBase.createObjectStore("videoStore");
        };

    request.onupgradeneeded = function (event) {
          _createObjectStore(event.target.result);
      };    
  }

function downloadVideo (videoUrl, progressEl) {
  var transaction = db.transaction(["videoStore"], "readonly");
  var dbReq = transaction.objectStore("videoStore").get(videoUrl);
              
  dbReq.onsuccess = function (event) {    
    if (event.target.result) {      
      progressEl.innerHTML = ' preloaded';
    }
    else {
      var req = new XMLHttpRequest();  
    req.open('GET', videoUrl, true);
    req.responseType = 'blob';
    req.addEventListener("progress", function (oEvent) {return updateProgress(oEvent,progressEl)});

    req.onload = function() {
      // Onload is triggered even on 404
      // so we need to check the status code
      if (this.status === 200) {
        var videoBlob = this.response;
        var vid = URL.createObjectURL(videoBlob); // IE10+
        putVideoInDb(videoBlob,videoUrl);
        // Video is now downloaded
        // and we can set it as source on the video element
        //videoEl.src = vid;            
      } 
    } 

    req.onerror = function() {
      console.log('Video download failed!')   
    }

    req.send();
    };
}
}

function updateProgress (oEvent, progressEl) {
  if (oEvent.lengthComputable && oEvent.loaded) {    
    var percentComplete = Math.round(oEvent.loaded / oEvent.total * 100);        
    var e = progressEl;    
    e.innerHTML = ' loaded ' + percentComplete + '%'
  } else {
    // Unable to compute progress information since the total size is unknown
  } 
}  

// https://hacks.mozilla.org/2012/02/storing-images-and-files-in-indexeddb/
function putVideoInDb (blob, videoKey){          
		console.log("Putting videoblob in IndexedDB");

		// Open a transaction to the database
		var transaction = db.transaction(["videoStore"], "readwrite");

		// Put the blob into the dabase
		var put = transaction.objectStore("videoStore").put(blob, videoKey);  
}

function getVideoFromDbAndSetElementSource (videoKey, videoElement) {     
    var transaction = db.transaction(["videoStore"], "readonly");
    transaction.objectStore("videoStore").get(videoKey).onsuccess = function (event) {
      var blobFile = event.target.result;            
      var URL = window.URL || window.webkitURL;
      var vidSource = URL.createObjectURL(blobFile);
      videoElement.src = vidSource;	      
      videoElement.play(); // this will cuase dom exceptions if
    }
};