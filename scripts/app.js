// Copyright 2016 Google Inc.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


(function() {
  'use strict';

  var app = {
    currentLocation: {}
  };

  app.saveCurrentLocation = function() {
    var currentLocation = JSON.stringify(app.currentLocation);
    localStorage.currentLocation = currentLocation;
  };

  app.getPosition = function(x, y) {
    var ellipsoid = viewer.scene.globe.ellipsoid;
    var cartesian = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(x, y), ellipsoid);
    
    if (cartesian) {
        var cartographic = ellipsoid.cartesianToCartographic(cartesian);

        return {
            latitude: Cesium.Math.toDegrees(cartographic.latitude),
            longitude: Cesium.Math.toDegrees(cartographic.longitude),
            height: viewer.camera.positionCartographic.height,
            heading: viewer.camera.heading,
            pitch: viewer.camera.pitch,
            roll: viewer.camera.roll,
        };
    }
  }

  var viewer = new Cesium.Viewer('cesiumContainer', {
    baseLayerPicker : false,
    sceneModePicker: false,
    imageryProvider : Cesium.createOpenStreetMapImageryProvider({
        url : '//a.tile.openstreetmap.org/'
    })
  });

  if(localStorage.currentLocation) {
    var location = JSON.parse(localStorage.currentLocation);
    viewer.camera.setView({
        destination : Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude, location.height),
        orientation : {
            heading : location.heading,
            pitch : location.pitch,
            roll : location.roll
        }
    });
  }

  viewer.canvas.addEventListener('wheel', function(e) {
    app.currentLocation = app.getPosition(e.clientX, e.clientY);
    app.saveCurrentLocation();
  });

  viewer.canvas.addEventListener('touchmove', function(e){
    if (e.changedTouches.length === 2) {
        app.getPosition((e.changedTouches[0].clientX + e.changedTouches[1].clientX) / 2, (e.changedTouches[0].clientY + e.changedTouches[1].clientY) / 2);
    }
  });

  viewer.camera.moveEnd.addEventListener(function(){
    app.currentLocation = app.getPosition(window.innerWidth / 2, window.innerHeight / 2);
    app.saveCurrentLocation();
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./service-worker.js')
             .then(function() { console.log('Service Worker Registered'); });
  }
})();
