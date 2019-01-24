#!/bin/bash
npm run build && cat resources/blackholes.csv | dest/parse-bhs.js > src/blackholedata.ts