"use strict";

(function(name){
  var DL = {};
  DL["queue"] = undefined;
  DL["define"] = undefined;
  DL["require"] = undefined;

  var qs = function(sel){
    return this.querySelector(sel);
  };
  DL["qs"] = qs.bind(document);
  Element.prototype.qs = qs;
  
  var qa =  function(sel){
    var ar = this.querySelectorAll(sel) || [];
    return Array.from(ar);
  };
  DL["qa"] = qa.bind(document);
  Element.prototype.qa = qa;

  DL["addScriptTag"] = function (src) {
    return new Promise((res,rej)=>{

      if(!this.validURL(src))
      {
          var msg = `ignored because of the string format is invalid : ${src}`;
          console.warn(msg);
          return rej(msg);
      }
  
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

          res(this.src);
        }
  
      if(this.queue === undefined)
      {
          this.queue = [];
          document.head.appendChild(script);
      }
      else
          this.queue.push(script);
    });

  };
  
  DL["addTagBoth"] = async function (src) 
  {
    var splt = src.split(".");
    var ext = splt.pop();
  
    if(ext === "js")
      await this.addScriptTag(src);
    else if(ext === "css")
      await this.addStyleTag(src);
    else if(ext === "set")
    {
      var fn = splt.join(".");
      this.addStyleTag(fn+".css");
      await this.addScriptTag(fn+".js");
    }
    else
      console.warn(`URL is invalid : ${src}`);
  };
  
  
  DL["stashRequireJS"] = function() {
      DL.require = window.require;
      window.require = undefined; 
      DL.define = window.define;
      window.define = undefined; 
      console.log("disabled RequireJS")
  };
  DL["popRequireJS"] = function() {
      window.require = DL.require;
      DL.require = undefined;
      window.define = DL.define;
      DL.define = undefined;
      console.log("restored RequireJS")
  };
  
  DL["addStyleTag"] = function(src) {
    return new Promise((res,rej)=>{
      if(!this.validURL(src))
      {
        var msg = `Ignored because of the string format is invalid : ${src}`;
        console.warn(msg);
        rej(msg);
      }
      var link = document.createElement('link');
      link.rel = "stylesheet";
      //link.type = "text/css";
      link.href = src;
      link.onload = function(e){
        console.log("loaded : " + this.href);
        res(this.href);
      }
      document.head.appendChild(link);
    });
  };

DL["addStyle"] = function(src) {
    var link = document.createElement('style');
    link.type = "text/css";
    link.innerHTML = src;
    document.head.appendChild(link);
  };
  
  DL["use"] = {
    resetcss: async () => {
      await DL.addStyleTag("https://raw.githubusercontent.com/nicolas-cusan/destyle.css/master/destyle.css");
  },
    d3sel: async () => {
        await DL.addScriptTag("https://d3js.org/d3-selection.v1.min.js");
    },
    d3: async () => {
      await DL.addScriptTag("https://d3js.org/d3.v5.min.js");
    },
    icons: async() => {
      await DL.addStyleTag("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.8.2/css/all.css");
    },
    react: async() => {
      DL.addScriptTag("https://unpkg.com/react@16/umd/react.development.js");
      await DL.addScriptTag("https://unpkg.com/react-dom@16/umd/react-dom.development.js");
    },
    jasmine: async() =>{
          var ver = "3.4.0";
          DL.addTagBoth(`https://cdnjs.cloudflare.com/ajax/libs/jasmine/${ver}/jasmine.min.set`);
          DL.addScriptTag(`https://cdnjs.cloudflare.com/ajax/libs/jasmine/${ver}/jasmine-html.js`);
          await DL.addScriptTag(`https://cdnjs.cloudflare.com/ajax/libs/jasmine/${ver}/boot.min.js`);
      },
    all: async (names) => {
      for(var i=0;i<names.length;i++){  //Cannot use forEach, it is not designed for the async.  
        var n = names[i];
        try{ await DL.use[n].apply(DL)}catch(e){alert("Does not found the specified name : " + n);}
      } 
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

            if(!this.validURL(e))
            {
              var msg = `Ignored because of the string format is invalid : ${e}`;
              console.warn(msg);
            }else
               ary.push(e);
          });
      }
      else{
        if(!this.validURL(e))
        {
          var msg = `Ignored because of the string format is invalid : ${e}`;
          console.warn(msg);
          return;
        }
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
    
    for(var i=0; i<ary.length;i++)
      this.addTagBoth(ary[i]);
  };
  
  DL["clearStack"] = function()
  {
    localStorage.removeItem('tempURLs');
  };
  
  /* thanks for : https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url*/
  DL["validURL"] = function (str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ /* protocol */
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ /* domain name */
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ /* OR ip (v4) address */
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ /* port and path */
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ /* query string */
      '(\\#[-a-z\\d_]*)?$','i'); /* fragment locator */
    return !!pattern.test(str);
  };

  //allocation
  if(window[name] === undefined)
    window[name] = DL;
  else
    console.warn(`Did not assign the variable because of the already exists the global variable that name is ${name}`);


  })("dl");
  

