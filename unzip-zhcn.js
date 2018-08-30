'use strict';
const fs = require('fs');
const AdmZip = require('adm-zip');
const iconv = require('iconv-lite');


function fixZipFilename(filename, encoding) {
  encoding = encoding || 'cp437';
  var str = iconv.decode(filename, encoding);
  if(str.replace(/[\u4e00-\u9fa5_a-zA-Z0-9\/\-\.]/g,'').length>0){ //有乱码
    str = iconv.decode(filename, 'utf-8');
  }
  return str;
}

function listSync(zipFilename, encoding) {
  const method2String = {
    0: 'stored',
    1: 'shrunk',
    6: 'imploded',
    8: 'deflated',
    9: 'deflate64',
    14: 'LZMA'
  };
  var zip = new AdmZip(zipFilename);
  var results = zip.getEntries().map(function(x) {
    return {
      path: fixZipFilename(x.rawEntryName, encoding),
      time: x.header.time,
      size: x.header.size,
      method: method2String[x.header.method] || 'unknown'
    };
  });
  return results;
}

function extractSync(zipFilename, targetPath, encoding, filters) {
  var zip = new AdmZip(zipFilename);
  var zipEntries = zip.getEntries();

  if (filters && filters.length > 0) {
    zipEntries.forEach(function(x) {
      var path = fixZipFilename(x.rawEntryName, encoding);
      var match = filters
        .map(function(x) {
          return path.startsWith(x);
        })
        .reduce(function(acc, cur) {
          return (acc || cur);
        }, false);
      if (match) {
        if (x.isDirectory) {
          fs.mkdirSync((targetPath||'')+path);
        } else {
          fs.writeFileSync((targetPath||'')+path, zip.readFile(x));
        }
      }
    });
  } else {
    zipEntries.forEach(function(x) {
      var path = fixZipFilename(x.rawEntryName, encoding);
      if (x.isDirectory) {
        fs.mkdirSync((targetPath||'')+path);
      } else {
        fs.writeFileSync((targetPath||'')+path, zip.readFile(x));
      }
    });
  }
}

module.exports = {
  listSync,
  extractSync
};
