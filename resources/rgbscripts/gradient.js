/*
  Q Light Controller Plus
  gradient.js

  Copyright (c) Massimo Callegari

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0.txt

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

// Development tool access
var testAlgo;

(
  function()
  {
    var algo = new Object;
    algo.apiVersion = 3;
    algo.name = "Gradient";
    algo.author = "Massimo Callegari";
    algo.acceptColors = 5;
    algo.properties = new Array();
    algo.presetIndex = 0;
    algo.properties.push("name:presetIndex|type:list|display:Preset|values:Rainbow,Sunset,Abstract,Ocean,Custom2,Custom3,Custom4,Custom5|write:setPreset|read:getPreset");
    algo.presetSize = 5;
    algo.properties.push("name:presetSize|type:range|display:Size|values:1,100|write:setSize|read:getSize");
    algo.orientation = 0;
    algo.properties.push("name:orientation|type:list|display:Orientation|values:Horizontal,Vertical,Radial|write:setOrientation|read:getOrientation");
    algo.presetScale = 1;
    algo.properties.push("name:presetScale|type:range|display:Scale|values:1,100|write:setScale|read:getScale");
    
    var util = new Object;
    util.initialized = false;
    util.gradientData = new Array();
    util.colorArray = new Array();
    util.presets = new Array();
    util.presets.push(new Array(0xFF0000, 0x00FF00, 0x0000FF));
    util.presets.push(new Array(0xFFFF00, 0xFF0000));
    util.presets.push(new Array(0x5571FF, 0x00FFFF, 0xFF00FF, 0xFFFF00));
    util.presets.push(new Array(0x003AB9, 0x02EAFF));
    util.presets.push(new Array(0xFF0000)); //Custom2
	util.presets.push(new Array(0xFF0000)); //Custom3
	util.presets.push(new Array(0xFF0000)); //Custom4
	util.presets.push(new Array(0xFF0000)); //Custom5
    
    algo.setPreset = function(_preset)
    {
      algo.acceptColors = 0;
      if (_preset === "Rainbow") { algo.presetIndex = 0; }
      else if (_preset === "Sunset") { algo.presetIndex = 1; }
      else if (_preset === "Abstract") { algo.presetIndex = 2; }
      else if (_preset === "Ocean") { algo.presetIndex = 3; }
      else if (_preset === "Custom2") { algo.presetIndex = 4; algo.acceptColors = 2; }
	  else if (_preset === "Custom3") { algo.presetIndex = 5; algo.acceptColors = 3; }
	  else if (_preset === "Custom4") { algo.presetIndex = 6; algo.acceptColors = 4; }
	  else if (_preset === "Custom5") { algo.presetIndex = 7; algo.acceptColors = 5; }
      else { algo.presetIndex = 0; }
      util.initialized = false;
    };

    algo.getPreset = function()
    {
      if (algo.presetIndex === 0) { return "Rainbow"; }
      else if (algo.presetIndex === 1) { return "Sunset"; }
      else if (algo.presetIndex === 2) { return "Abstract"; }
      else if (algo.presetIndex === 3) { return "Ocean"; }
	  else if (algo.presetIndex === 4) { return "Custom2"; }
	  else if (algo.presetIndex === 5) { return "Custom3"; }
	  else if (algo.presetIndex === 6) { return "Custom4"; }
	  else if (algo.presetIndex === 7) { return "Custom5"; }
      else { return "Rainbow"; }
    };

    algo.setSize = function(_size)
    {
      algo.presetSize = _size;
      util.initialized = false;
    };

    algo.getSize = function()
    {
      return algo.presetSize;
    };
    algo.setScale = function(_scale)
    {
      algo.presetScale = _scale;
      util.initialized = false;
    };

    algo.getScale = function()
    {
      return algo.presetScale;
    };
    
    algo.setOrientation = function(_orientation)
    {
      if (_orientation === "Vertical") { algo.orientation = 1; }
      else if (_orientation === "Radial") { algo.orientation = 2; }
      else { algo.orientation = 0; }
      util.initialized = false;
    };

    algo.getOrientation = function()
    {
      if (algo.orientation === 1) { return "Vertical"; }
      else if (algo.orientation === 2) { return "Radial"; }
      else { return "Horizontal"; }
    };
    
    algo.rgbMapSetColors = function(rawColors)
    {
      if (! Array.isArray(rawColors))
        return;

      util.colorArray = new Array(rawColors.length);
      for (var i = 0; i < util.colorArray.length; i++) {
        if (i < rawColors.length && !!rawColors[i])
        {
          util.colorArray[i] = rawColors[i];
        } else {
          util.colorArray[i] = 0;
        }
      }
      // Fetch the custom colors, apply to the presets
      util.initialized = false;
    };
    
    algo.rgbMapGetColors = function()
    {
      if (algo.presetIndex < 4)
      {
        return util.presets[algo.presetIndex];
      }
      else if (algo.presetIndex >= 4 && algo.presetIndex <= 7)
      {
        if (util.colorArray.length < (algo.presetIndex - 2))
        {
          // No user defined colors set, return default
          return [ 0xFF0000 ];
        }
        return util.colorArray.slice(0, (algo.presetIndex - 2));
      }
      else
      {
        // Either presetIndex === 0 or an invalid presetIndex
        return [ 0xFF0000, 0x00FF00, 0x0000FF ];
      }
    };

    util.initialize = function()
    {
      // calculate the gradient for the selected preset
      // with the given width
      var gradIdx = 0;
      util.gradientData = new Array();
	  var colorArray = algo.rgbMapGetColors();
      for (var i = 0; i < colorArray.length; i++)
      {
        var sColor = colorArray[i];
        var eColor = colorArray[i + 1];
        if (eColor == undefined) {
          eColor = colorArray[0];
        }
        util.gradientData[gradIdx++] = sColor;
        var sr = (sColor >> 16) & 0x00FF;
        var sg = (sColor >> 8) & 0x00FF;
        var sb = sColor & 0x00FF;
        var er = (eColor >> 16) & 0x00FF;
        var eg = (eColor >> 8) & 0x00FF;
        var eb = eColor & 0x00FF;

        var stepR = ((er - sr) / (algo.presetSize));
        var stepG = ((eg - sg) / (algo.presetSize));
        var stepB = ((eb - sb) / (algo.presetSize));

        for (var s = 1; s < algo.presetSize; s++)
        {
          var gradR = Math.floor(sr + (stepR * s)) & 0x00FF;
          var gradG = Math.floor(sg + (stepG * s)) & 0x00FF;
          var gradB = Math.floor(sb + (stepB * s)) & 0x00FF;
          var gradRGB = (gradR << 16) + (gradG << 8) + gradB;
          util.gradientData[gradIdx++] = gradRGB;
        }
      }
      util.initialized = true;
    };

    algo.rgbMap = function(width, height, rgb, step)
    {
      if (util.initialized === false)
      {
        util.initialize(width);
      }

      var gradStep = 0;
      var map = new Array(height);
      for (var y = 0; y < height; y++)
      {
          map[y] = new Array();

          if (algo.orientation === 1) {
            gradStep = step + (y * algo.presetScale);
          }
          for (var x = 0; x < width; x++)
          {
            if (algo.orientation === 0)
            {
              gradStep = step + (x * algo.presetScale);
            }
            else if (algo.orientation === 2)
            {
              var xdis = x - ((width-1)/2);
              var ydis = y - ((height-1)/2);
              gradStep = step + (Math.round( Math.sqrt((xdis * xdis) + (ydis * ydis))) * algo.presetScale);
            }
            if (gradStep >= util.gradientData.length)
            {
              gradStep = (gradStep % util.gradientData.length);
            }

            map[y][x] = util.gradientData[gradStep];
          }
      }

      return map;
    };

    algo.rgbMapStepCount = function(width, height)
    {
      if (util.initialized === false) {
        util.initialize();
      }
      return util.gradientData.length;
    };

    // Development tool access
    testAlgo = algo;

    return algo;
  }
)();
