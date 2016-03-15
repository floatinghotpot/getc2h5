'use strict';

var execSync = require("child_process").execSync;
var fs = require('fs');

var index_html = __dirname + '/index.html';

function download(url, name) {
  var s = null;
  try {
    s = fs.statSync(name);
  } catch(e) {}
  
  if(name.indexOf('.')>=0) {
    if(s && s.isFile()) {
      console.log(name + ' exists, skip');
    } else {
      var cmd = 'curl -O ' + url + name;
      console.log(cmd);
      execSync(cmd);
    }
  } else {
    console.log(name + ' seems not a file, skip');
  }
}

function mkdir(name) {
  var s = null;
  try {
    s = fs.statSync(name);
  } catch(e) {}
  if(s && s.isDirectory()) return;
  else fs.mkdirSync(name);
}

function downloadAll(url) {
  if(!url.endsWith('/')) url = url + '/';
  var words = url.split('/');
  var name = words[words.length-2];
  mkdir(name);
  process.chdir(name);

  var manifest = 'offline.appcache';
  download(url, manifest);

  var s = null;
  try {
    s = fs.statSync(manifest);
  } catch(e) {}

  if(s && s.isFile()) {
    var text = fs.readFileSync(manifest).toString();
    if(text) {
      var files = text.split('\n');
      files.forEach(function(name, i){
        download(url, name.trim());
      });

      mkdir('images');
      mkdir('media');
      execSync('mv *.jpg images');
      execSync('mv *.png images');
      execSync('mv *.ogg media');
      execSync('mv *.m4a media');
      execSync('mv images/icon-*.png .');
      execSync('mv images/loading-logo.png .');
      execSync('cp ' + index_html + ' .');
    }
  }
}

function usage() {
  console.log('getc2h5 <url>\nPlease give a URL to HTML5 game built with Construct 2\n');
}

var args = process.argv;
args.splice(0,2);
if(args.length === 1) {
  var url = args[0];
  if(url.startsWith('https://') || url.startsWith('http://')) {
    downloadAll(url);
    console.log('Done');
  } else usage();
} else usage();
