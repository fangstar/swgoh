## Synopsis

Node library to get information of **swgoh** parsing [swgoh.gg](https://swgoh.gg), you can get **profile**, **characters**, **guild members**.

## Code Example

###import
```javascript
const swgoh = require("swgoh").swgoh
//or
import {swgoh} from 'swgoh';
```
 

```javascript
const username= "pikax";
swgoh.profile(username).then(function (p) {
  console.log(p);

  return swgoh.guild(p.guildUrl);
}).then(console.log);
swgoh.collection(username).then(console.log);
```



## Motivation

With TB just released, this library provides easy way to get data from [swgoh.gg](https://swgoh.gg)

## Installation

```bash
yarn add swgoh
```
```bash
npm i swgoh
```

## License

MIT

## Disclaimer

The developer of this application does not have any affiliation with the Capital Games, Disney, Lucasfilm Limited or swgoh.gg.

