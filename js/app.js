var ACCESS_TOKEN = '';
var client_id = '0c3c4b0f68c44dfd8c8246e502180c79'
var scopes = ['user-read-playback-state', 'user-modify-playback-state']
var redirect_uri = 'http://d23f0w79v4pnrs.cloudfront.net/'
var urlState;
var devUrl = "file:///C:/Users/r_mum/Projects/spotify-thing/Playlist-Organizer-Spotify/index.html";
var clickable = true;


function requestToken(state=123){
  const Http = new XMLHttpRequest();
  const url= `https://accounts.spotify.com/en/authorize?client_id=${client_id}&redirect_uri=${redirect_uri.split('/').join('%2F')}&scope=${scopes.join('%20')}&response_type=token&state=${state}`;
  console.log(url)
  window.open(url, '_self')
  
}



function showLoading(){
  document.getElementById('loading').style.display = 'block'
  document.getElementById('notLoading').style.display = 'none'
}

function showButton(){
  document.getElementById('loading').style.display = 'none'
  document.getElementById('notLoading').style.display = 'block'
}

function setDeviceID(){
  const Http = new XMLHttpRequest();
  const url= `https://api.spotify.com/v1/me/player/devices`;
  Http.open("get", url);
  Http.setRequestHeader('Authorization', 'Bearer ' + ACCESS_TOKEN);
  Http.send();

  Http.onreadystatechange = (e) => {
    if(Http.readyState === XMLHttpRequest.DONE){
      var status = Http.status;
      if(status >= 200 && status < 400){
        var currDevice = JSON.parse(Http.response).devices.find(d=>{return d['is_active']})

        if(currDevice){
          deviceID = currDevice.id
          console.log('Device ID set to ', deviceID)
          showButton();
          

          if(parseInt(urlState)==420){
            btnClick()
          }
        }else{
          alert('Error: Must connect a device to spotify first!')
        }

      }else{
        console.error('need error handling')
        console.log(Http.responseText)
        //invalid access token
        if(status == 401){
          requestToken()
        }
      }
    }

  }
}

showLoading();


var href = window.location.href.replace('?', '#')
var params = {}
if(href.split('#').length>1){

  for (p of href.split('#')[1].split('&')){
    params[p.split('=')[0]]=p.split('=')[1]
  }
  ACCESS_TOKEN = params.access_token || ''
  urlState = params.state
}
if(!ACCESS_TOKEN.length){
  console.log(window.location.href)
  debugger;
  if(window.location.href==devUrl){
    requestToken(0)
  }else{
    requestToken()
  }
}else{
  if(parseInt(urlState)==0){
    newUrl=(devUrl+window.location.href.split('.net')[1]).replace('/#', '?').split('&')[0]
    copyToClipboard = str => {
      const el = document.createElement('textarea');
      el.value = str;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    };
    copyToClipboard(newUrl)
    window.open(newUrl, '_self')

  }
  setDeviceID()
}



function btnClick(){
  if(clickable){
    clickable = false;
    showLoading();
    addSongToQueueAndSkip(shotsURI);

  }
}

function addSongToQueueAndSkip(uri){
  const Http = new XMLHttpRequest();
  const url= `https://api.spotify.com/v1/me/player/queue?uri=${uri}&device_id=${deviceID}`;
  Http.open("post", url);
  Http.setRequestHeader('Accept', 'Application/json');
  Http.setRequestHeader('Content-Type', 'Application/json');
  Http.setRequestHeader('Authorization', 'Bearer ' + ACCESS_TOKEN);
  Http.send();

  Http.onreadystatechange = (e) => {
    // console.log(Http.responseText)
    if(Http.readyState === XMLHttpRequest.DONE){
      var status = Http.status;
      if(status >= 200 && status < 400){
        console.log('shots in queue skip song')
        skipToNextSong();
      }else{
        console.error('need error handling')
        console.log(Http.responseText)
        //invalid access token
        if(status == 401){
          requestToken(420)
        }
      }
    }
  }
}

function skipToNextSong(){
  const Http = new XMLHttpRequest();
  const url= `https://api.spotify.com/v1/me/player/next?device_id=${deviceID}`;
  Http.open("post", url);
  Http.setRequestHeader('Accept', 'Application/json')
  Http.setRequestHeader('Content-Type', 'Application/json')
  Http.setRequestHeader('Authorization', 'Bearer ' + ACCESS_TOKEN);
  Http.send();

  Http.onreadystatechange = (e) => {
    // console.log(Http.responseText)
    
    if(Http.readyState === XMLHttpRequest.DONE){
      var status = Http.status;
      if(status >= 200 && status < 400){
        console.log('song skipped')
        setTimeout(() => {
          
          getCurrSong().then(uri=>{
            console.log('curr song:', uri)
            if(parseURI(uri) == shotsURI){
              //do nothing
              console.log("SHOTS SHOTS SHOTS")
              clickable = true;
              showButton();

            }else{
              console.log('add curr to queue and skip')
              this.addSongToQueueAndSkip(parseURI(uri))
              // skipToNextSong();
            }
          })
        }, 100);
      }else{
        console.error('need error handling')
      }
    }
  }
}

function parseURI(uri){
  return uri.split(':').join('%3A')
}

function getCurrSong(){
  // debugger;
  return new Promise((resolve, reject)=>{

    const Http = new XMLHttpRequest();
    const url= 'https://api.spotify.com/v1/me/player/currently-playing?market=US';
    Http.open("get", url);
    Http.setRequestHeader('Accept', 'Application/json')
    Http.setRequestHeader('Content-Type', 'Application/json')
    Http.setRequestHeader('Authorization', 'Bearer ' + ACCESS_TOKEN);
    Http.send();
    
    Http.onreadystatechange = (e) => {
      // console.log(Http.responseText)
      
      if(Http.readyState === XMLHttpRequest.DONE){
        var status = Http.status;
        if(status >= 200 && status < 400){
          resolve(JSON.parse(Http.response).item.uri)
        }else{
          console.log(Http.responseText)
          console.error('need error handling')
        }
      }
    }
  })
}
