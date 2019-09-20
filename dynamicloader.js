(function(name){
  var DL = {};
  DL["queue"] = undefined;
  DL["define"] = undefined;
  DL["require"] = undefined;
  DL["addScriptTag"] = function (src,cb) {
      var script = document.createElement('script');
      script.src = src;
      script.type = "text/javascript";
      script.onload = function(e)
      {
          var next = DL.queue.shift();
          console.log("loaded :" +  this.src);
          if(next)
          {
              console.log("next :" +  next.src);
              document.head.appendChild(next);
          }
          else
              DL.queue = undefined;
          if(cb)cb();
      }
  
      if(this.queue === undefined)
      {
          this.queue = [];
          document.head.appendChild(script);
      }
      else
          this.queue.push(script);
  };
  
  DL.stashRequireJS = function() {
      DL.require = window.require;
      window.require = undefined; 
      DL.define = window.define;
      window.define = undefined; 
      console.log("disabled RequireJS")
  };
  DL.restoreRequireJS = function() {
      window.require = DL.require;
      DL.require = undefined;
      window.define = DL.define;
      DL.define = undefined;
      console.log("restored RequireJS")
  };
  
  DL.addStyleTag = function(src) {
    var link = document.createElement('link');
    link.rel = "stylesheet";
    //link.type = "text/css";
    link.href = src;
    document.head.appendChild(link);
  };
  DL.addStyle = function(src) {
    var link = document.createElement('style');
    link.type = "text/css";
    link.innerHTML = src;
    document.head.appendChild(link);
  };
  
  DL.use = {
    d3sel: () => {
      DL.addScriptTag("https://d3js.org/d3-selection.v1.min.js");
    },
    d3: () => {
      DL.addScriptTag("https://d3js.org/d3.v5.min.js");
    },
    icons: () => {
      DL.addStyleTag("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.8.2/css/all.css");
    },
    react: () => {
      DL.addScriptTag("https://unpkg.com/react@16/umd/react.development.js");
      DL.addScriptTag("https://unpkg.com/react-dom@16/umd/react-dom.development.js");
    },
    jasmine: () =>{
          var ver = "3.4.0";
          DL.addStyleTag(`https://cdnjs.cloudflare.com/ajax/libs/jasmine/${ver}/jasmine.min.css`);
          DL.addScriptTag(`https://cdnjs.cloudflare.com/ajax/libs/jasmine/${ver}/jasmine.min.js`);
          DL.addScriptTag(`https://cdnjs.cloudflare.com/ajax/libs/jasmine/${ver}/jasmine-html.js`);
          DL.addScriptTag(`https://cdnjs.cloudflare.com/ajax/libs/jasmine/${ver}/boot.min.js`);
      },
    all: (names) => {
      names.forEach((n) => {
        try{DL.use[n].apply(DL)}catch(e){alert("Does not found the specified name : " + n);}
      });
    }
  };
  
  DL["addStack"] = function(arg){
      var ary = localStorage.getItem('tempURLs');
      if(ary === undefined)
         ary = [];
      else
         ary = JSON.parse(ary);
  
      if(arg instanceof Array)
      {
          arg.forEach((e)=>{
             ary.push(e);
          });
      }
      else{
         ary.push(arg);
      }
      localStorage.setItem('tempURLs',JSON.stringify(ary));
  };
  
  DL["useStack"] = function()
  {
    var ary = localStorage.getItem('tempURLs');
    if(ary === undefined)
        ary = [];
    else
        ary = JSON.parse(ary);
  
    return new Promise((res,rej)=>{
      for(var i=0; i<ary.length;i++)
      {
        var cur = ary[i];
        if(i===ary.length-1)
            this.addScriptTag(cur,res);
        else
            this.addScriptTag(cur);
      }    
    });
  }
  
  DL["clearStack"] = function()
  {
    localStorage.removeItem('tempURLs');
  }
  if(window[name] === undefined)
    window[name] = DL;
  
  })("dl");
  