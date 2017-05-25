# Cesium PWA

This is an experiment to showcase a progressive web application that interacts with [Cesium](http://cesiumjs.org/) library. It demonstrates how we can cache arbitrary content and make an application - built with Cesium - faster to load using [Progressive Web application](https://developers.google.com/web/progressive-web-apps/) techniques. It specifically uses the [cache-first-then-network](https://jakearchibald.com/2014/offline-cookbook/#cache-then-network) strategy to fetch and cache imagery data from **OpenStreetMaps**, although other providers could be used.

While the user navigates inside the viewer, imagery data are cached locally using a service worker. Alongside, the current location and orientation of the camera are kept locally in **localStorage**. Next time the user opens the application, being offline or not, he will be directed to its last known location with all imagery loaded instantly and fast.

## Demo

You can test a fully functional working live demo at [https://pxcesium.azurewebsites.net/pwa/](https://pxcesium.azurewebsites.net/pwa/).

## Issues to consider

* Limit of the *Cache Storage* that keeps imagery data. We may need to implement a mechanism so that it refreshes as soon as new data arrive. Maybe set an internal
  limit and keep only the last (n) records.
* We should use a local copy of Cesium and not one from the official Cesium website because `cache.addAll()` is atomic, If any of the files fail, the entire cache addition fails!
* Investigate [sw-precache](https://github.com/GoogleChrome/sw-precache) library for production enviroments.