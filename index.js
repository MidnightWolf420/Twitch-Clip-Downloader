const axios = require('axios');
const download = require('download-file');
const path = require('path');
const fs = require('fs');

var args = process.argv.slice(2);

if(args.length<1) {
    console.log('Usage: node index.js <clip URL>')
    process.exit(1);
}

var clipUrl = args[0]

async function exists (path) {  
    try {
        await fs.access(path)
        return true
    } catch {
        return false
    }
}

clipID = clipUrl.split('/').filter(e => Boolean(e))[clipUrl.split('/').filter(e => Boolean(e)).length - 1];
(async() => {
    if(!await exists(path.join(__dirname, `./clips/`, `${clipID}.mp4`))){
        axios.get(clipUrl).then(res => {
            if(res.status === 200){
                if(/"thumbnailUrl":\[.+?\]/g.test(res.data)){
                    var thumbnail = res.data.match(/"thumbnailUrl":\[.+?\]/g)[0].replace(/(("thumbnailUrl":)|\[|\]|")/g, '').split(',')[0]
                    var file = thumbnail.replace(/-preview-.+?x.+?.jpg/, '.mp4').substring(thumbnail.replace('-social-preview.jpg', '.mp4').lastIndexOf('/') + 1);    
                    if (!fs.existsSync(`./clips`)) {
                        fs.mkdirSync(path.join(__dirname, `./clips`));
                    }
                    download(`https://production.assets.clips.twitchcdn.net/${file}?sig=26a6ec5642e5bb5c831c9ab26a9a65d2a5f8800f&token={"authorization":{"forbidden":false,"reason":""},"clip_uri":"","device_id":null,"expires":1648592590,"user_id":"","version":2}`, {
                        directory: `./clips`,
                        filename: `${clipID}.mp4`
                    }, function(err){
                        if (!err){
                            console.log(`${clipID}.mp4 Downloaded`)
                        } else console.log(err)
                    }) 
                } else console.log("Can't Find Thumbnail")
            } else console.log(res.status)
        }).catch((err) => console.error(err));
    } else console.log(`${clipID}.mp4 Is Already Downloaded`)
})()