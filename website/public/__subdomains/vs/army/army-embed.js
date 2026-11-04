// army-embed.js - emoji army maker, standalone embed
// Extracted verbatim from the verified emoji-army-maker tool.
// Public API:
//   armyEmbed.PRESETS                        - { clawd, drohc, neocat } tile configs
//   await armyEmbed.loadTile(preset)         - returns a canvas of the tile
//   armyEmbed.renderFrame(tile, k, cfg)      - returns a canvas for frame k
//   armyEmbed.encodeGIF(imageDatas, delayCs) - returns Uint8Array GIF89a (animated, loops)
//   armyEmbed.animate(canvas, tile, cfg)     - plays the march on a visible canvas
//   armyEmbed.gifBytes(tile, cfg)            - Uint8Array of the GIF
//   armyEmbed.downloadGIF(tile, cfg, name)   - encodes + triggers a download
// Seamless-loop rule: cfg.frames * |cfg.dx| must be a whole multiple of the tile width.
const armyEmbed = (function(){
const TILES = {
  clawd: { b64:"iVBORw0KGgoAAAANSUhEUgAAAFoAAAAtCAYAAAAuj3x7AAAEFUlEQVR4nO2bT2gcVRzHP2/m7b/ubJJpm24aSG02SRNQqSWgoBVBFHrzVHvSQw8NiK0nKUixqfRgvVUFsYgXL2pP3nrxZoVSFMUKbdPiYbFbJHUl2yb7Z2afh2Q3m2R2s5uZzP7JfE47vJnvvPedN7/3e2/eijtnTyh8YvLSd6LVa2rr53T9nbMnlNB19F0GY+euNKV//+IpZS8+Rtl2XU2v6lxB3n2UA2DIiNIXCbWquYaFQolMLg9AuWwz3LeL/mjYlWa3s1Ao8fBxHvnBj38A8N4LE7z81KAr0V8fZPn0xl2EECwWSrx/dIpXU0PV8vVPeiu9pRNpFBV+f/gfl2/MITO5JQAWLdv1DfOWTTqbw7ZthBAUSpZrzW5nybLJ5JbQvBZWSqGUQkqJLqXX8l2Lp0YLIZCBuY7ImekxACZ2G67FDu1J8M7zh7DKCqkJxj3QlH0mNMiLZMIETaCHo01r6tE4aDqUnYVlwlz+4cEIMr7bYGZ6DPn2cwfdq60wasYZNeOe6QGE9yZRCuq1OrQ3CQiEaN4VPTGAphT1nuCyJrQgWZeUaZAyDYSfefR6dkLWUcHzwTDAGd9Hrmu301f9vud2U9umY1Mjx53O8TV09Eqo2AwnT4PQ4ROB0T7R8bOL9JcX2pYVAYzMnPck3HW80cX5TMMJy7bi4YjS8UZbC9l2V8ETghjtE4HRPuFotBDN+9/o3B2RNG9CxQNZmUS8e/SZ2dMvPX1eCIEWjTE++3VTPt2bPanKxTzKtvns+p8XPv/p1myl7NjUyPHLb7z4vffV7x7O/PDzm9dup686d0ethYjS4NxenG63SsWDIEb7RGC0T3R8Hl3LX9knXE/PV48PJwd4NtnvSvO3TJZb/ywAULAsXjm4j/E9CVeaTnSc0Y1WE+f+zfHFzXvV45NHRl0bffPvR3z1y300TSOfz7M/Hl5jtFdbJDrO6HZQLBYBCIVCyND2WLLjY7QQAm0lc1r+7rg92X9X9eiY1BlOxKrHbrewAfRHw6QGTR7klhhOxIhJ3bWmE1WjpdFHZOgACIHQmr9ZaGAQVbZBKaSR3lAeGTrgTU2BI/tNPnn9cPV4IOre6NdSSaaHTVRZITTBvnjz2xbq4dTmqtFaKIIeb3201aKrPUwLRTaUb0WzHkZYYoS9fQnNWBgz5u1GTKc2d9xyRDu3PzTDVrOOHT8Y+kXH9ej1tLuHe/XlPujRPhEY7RMyfeUj317NkVMfdnyo8gInT6X9JNeOuvQ0Tp7K4nymDVXpbZw8lcoqtaEqvY2Tp8Fg6BOB0T7RVat3CJj8eHUCUZ3MCIEmQ0xc/KaprGbu3FuqbJVY/s+GYPLStxs1PaarenStybA6axOatmZxazO0aAyxsgZda3Ktptd0ldHdzP+CIiURKtuePwAAAABJRU5ErkJggg==", w:90, h:45, canvas:112, frames:10, delay:80, dx:9, dy:0 },
  drohc: { b64:"iVBORw0KGgoAAAANSUhEUgAAABcAAAANCAYAAABCZ/VdAAAC6UlEQVR4nJ2UX0yTVxjGf+dbUyNQp7BmiUXdFAerFhQFFC1M3cIsDnoh0XlhRqLL4r/EaKAxWVZMSNQLdbqbcbFky5IRqi6VZDNyYcYfycQwgoAakm0OsOrK91VKKq2OdxfVWuyyGJ/k5Lwn7/s858l73hw8nnrvVx/XisfjkYHBAWlsbJSmpiYxDF0Gzl0Sj6feSxJGiqpkd4lTNE0TBWIYutwJTcr3vl+kb/tBSa7V0oIP7ROLbbS3dxAOT7JlS+XzbKGD3NkWezJhQc9FtUaf8rXmredQdh6tJ33c/+xzokcO+1Y0n1LJtap+gV1aTI+wWq048h24NruYmprC5drM49fMmL71kbm/dgbpZaGJTKPr40SjUWLRGIHAXcyzzK+ilSqe8eF7vvp9B0hPz2DP3j04nU4M3QDgQXACvz7me5FUnWWr6VtZIf5310v3jsMyXFEr1Zm2mhfrTJE3Xh+y/T5GWZkTS4YFv9+P1WqNZ3v7uf0oPJRMGCn6SI5qIQp72pBpQb96kQllpqatt6Xh/AVWNJ9OtFADuN99nb4r7QCEwxMoBSP3HjI/EJjhpL+gQs6tXcqJS37y8wsQ4sMxR2JUvr+cjK+PMVzxSWJitMh3P9J0d7ghf0znytlvGI8phtuuMftyB5/2/NoQbf4pIX4icAtHlQuAM2e+TOlx1nSEm+6q1ObXZed567LzvMESt9TZ4nFyPljsFpPSBIXkLM2Rrs5OsS+zi2HoM9YfoYgES9ySesP/IFjiFhQCxHeFrCstTREfnYxKsDgurv2n8+xU5ygwKQ0U5CzJoaujEyMUSjHx+Mk/8PRJ1YH573h/+Psvat9864uFlS76083MHQ2yq7SMI71XGxa2d3HyzxtegNw0i5z1X6Bo9SoA5s3LxDD0GeKXfxth28YCBaCNb1iN3TK3fHCOmberN5FpFhZ9sIZYsYOduUvKI1uffwctuaUMtv4MwIbyjQmHzzCu0ig8fjpx/hcRKEln4iRUyAAAAABJRU5ErkJggg==", w:23, h:13, canvas:32,  frames:10, delay:80, dx:-2.25, dy:0 },
  neocat: { b64:"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", w:40, h:44, canvas:112, frames:10, delay:80, dx:8, dy:0 },
};
const SPRITE_CLAWD = { b64:"iVBORw0KGgoAAAANSUhEUgAAACcAAAAfCAYAAABkitT1AAABcUlEQVR4nO2Yv0vDQBTHv+96sYVWpYpDEYeqVHHxx+rs3+Au6p+gkyIFB2c3F2f/CGcRNzcRp2LpUgSLF5I0iYPUJiGX6AWaDPdZwnGPuw/vuPeOEAJ0bto+cmTp+JyCYx4cuF+fAELzuRKSs3qdvDxiYXkLJKHlVNFyqmg5VbhswvE8PHT6sFwPALBSr2K5Xsu02Ydp4+m9DyIGx7Gx2ZjD4mxVLvdyuh/bsqyhh+vHV3QHJgDgYLuZWa47MHF2/wzOOYQQuNzbCslFXSZ+rL7vQwgBwzDAufTgAOQgR0TjLyX38YnKEVFqtoJII8uc4WinCXP4cyFa89OZ5Rq1Ck5212G7HqZKDBsLM4nxJLsQRaDQda7QcqHrkvcRE4DW1d2vU6EyFxQDCiYXRcupouVU0XKqKMkRY6nPnXFsCaNaH63waSskvl/WIkVx1EFYuYLVi9s/2b21D33XFPA9F5SwZhzyzLGEvekfCWdM+d/QN0aaXJegCESxAAAAAElFTkSuQmCC", w:39, h:31 };
function buildPalette(frames){
  const counts = new Map();
  for (const fr of frames){
    const d = fr.data;
    for (let i=0;i<d.length;i+=4){
      if (d[i+3] < 128) continue;
      const key = (d[i]>>3)<<10 | (d[i+1]>>3)<<5 | (d[i+2]>>3);
      counts.set(key,(counts.get(key)||0)+1);
    }
  }
  let pal;
  if (counts.size <= 255){
    pal = [...counts.keys()].map(k=>[ ((k>>10)&31)<<3|4, ((k>>5)&31)<<3|4, (k&31)<<3|4 ]);
  } else {
    const sorted = [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,255);
    pal = sorted.map(([k])=>[ ((k>>10)&31)<<3|4, ((k>>5)&31)<<3|4, (k&31)<<3|4 ]);
  }
  return pal;
}
function nearest(pal, r,g,b){
  let bi=0, bd=1e9;
  for (let i=0;i<pal.length;i++){
    const dr=pal[i][0]-r, dg=pal[i][1]-g, db=pal[i][2]-b;
    const d=dr*dr+dg*dg+db*db;
    if (d<bd){ bd=d; bi=i; if(d===0) break; }
  }
  return bi;
}
function lzwEncode(idx, mcs){
  const clear = 1<<mcs, eoi = clear+1;
  const out=[]; let buf=0, nb=0;
  const emit=(code,size)=>{ buf |= code<<nb; nb+=size; while(nb>=8){ out.push(buf&255); buf>>=8; nb-=8; } };
  let size = mcs+1, next = eoi+1;
  let dict = new Map();
  emit(clear, size);
  let cur = idx[0];
  for (let i=1;i<idx.length;i++){
    const c = idx[i];
    const key2 = cur*256+c;
    if (dict.has(key2)) cur = dict.get(key2);
    else {
      emit(cur, size);
      if (next < 4096){
        dict.set(key2, next++);
        // GIF quirk: encoder bumps one code early (decoder bumps at 1<<size)
        if (next === (1<<size)+1 && size < 12) size++;
      } else {
        emit(clear, size);
        dict = new Map(); size = mcs+1; next = eoi+1;
      }
      cur = c;
    }
  }
  emit(cur, size);
  emit(eoi, size);
  if (nb>0) out.push(buf&255);
  return out;
}
function encodeGIF(frames, delayCs){
  // frames: array of ImageData
  const pal = buildPalette(frames);
  const nCol = pal.length + 1;           // + transparent index
  const transIdx = pal.length;
  let bits = 1; while ((1<<bits) < Math.max(2,nCol)) bits++;
  const gctSize = 1<<bits;
  const W = frames[0].width, H = frames[0].height;
  const out = [];
  const put = (...bs)=>out.push(...bs);
  const s = t => { for (let i=0;i<t.length;i++) out.push(t.charCodeAt(i)); };
  const le16 = v => [v&255,(v>>8)&255];
  s("GIF89a");
  put(...le16(W), ...le16(H), 0x80|(bits-1), 0, 0);
  for (let i=0;i<gctSize;i++){ put(pal[i]?pal[i][0]:0, pal[i]?pal[i][1]:0, pal[i]?pal[i][2]:0); }
  // netscape loop
  put(0x21,0xFF,0x0B); s("NETSCAPE2.0"); put(0x03,0x01,0x00,0x00); put(0x00);
  const mcs = Math.max(2, bits);
  // map + index frames
  const idxFrames = frames.map(fr=>{
    const d=fr.data, arr=new Uint8Array(W*H);
    const cache=new Map();
    for (let i=0,j=0;i<d.length;i+=4,j++){
      if (d[i+3]<128){ arr[j]=transIdx; continue; }
      const key=(d[i]>>3)<<10|(d[i+1]>>3)<<5|(d[i+2]>>3);
      let pi=cache.get(key);
      if (pi===undefined){
        if (pal.length===0){ pi=0; }
        else {
          pi=transIdx; let bd=1e9;
          for (let q=0;q<pal.length;q++){
            const dr=pal[q][0]-d[i], dg=pal[q][1]-d[i+1], db=pal[q][2]-d[i+2];
            const dd=dr*dr+dg*dg+db*db;
            if (dd<bd){ bd=dd; pi=q; if(!dd)break; }
          }
        }
        cache.set(key,pi);
      }
      arr[j]=pi;
    }
    return arr;
  });
  for (const arr of idxFrames){
    put(0x21,0xF9,0x04, 0x09, ...le16(delayCs), transIdx, 0x00);
    put(0x2C, ...le16(0), ...le16(0), ...le16(W), ...le16(H), 0x00);
    put(mcs);
    const lzw = lzwEncode(arr, mcs);
    for (let i=0;i<lzw.length;i+=255) put(Math.min(255,lzw.length-i), ...lzw.slice(i,i+255));
    put(0x00);
  }
  put(0x3B);
  return new Uint8Array(out);
}
function renderFrame(tileCanvas, k, cfg){
  const c = document.createElement("canvas"); c.width=cfg.size; c.height=cfg.size;
  const x = c.getContext("2d");
  const tw = tileCanvas.width, th = tileCanvas.height;
  const fx = cfg.dx*k, fy = cfg.dy*k;
  let ox = ((fx % tw)+tw)%tw; if (ox>0) ox-=tw;
  let oy = ((fy % th)+th)%th; if (oy>0) oy-=th;
  const frac = (Math.abs(cfg.dx)%1!==0)||(Math.abs(cfg.dy)%1!==0);
  x.imageSmoothingEnabled = frac;
  for (let X=ox; X<cfg.size; X+=tw) for (let Y=oy; Y<cfg.size; Y+=th) x.drawImage(tileCanvas, X, Y);
  return c;
}
function loadTile(preset){
  return new Promise((res,rej)=>{
    const i=new Image();
    i.onload=()=>{ const c=document.createElement("canvas"); c.width=i.width; c.height=i.height;
      c.getContext("2d").drawImage(i,0,0); res(c); };
    i.onerror=rej;
    i.src="data:image/png;base64,"+preset.b64;
  });
}
function animate(canvas, tile, cfg){
  const frames=[]; for(let k=0;k<cfg.frames;k++) frames.push(renderFrame(tile,k,cfg));
  let k=0; let last=0;
  function tick(t){ if(t-last>=cfg.delay){ last=t; k=(k+1)%frames.length;
    canvas.width=cfg.size; canvas.height=cfg.size; canvas.getContext("2d").drawImage(frames[k],0,0); }
    requestAnimationFrame(tick); }
  requestAnimationFrame(tick);
}
function gifBytes(tile, cfg){
  const imgs=[]; for(let k=0;k<cfg.frames;k++) imgs.push(renderFrame(tile,k,cfg).getContext("2d").getImageData(0,0,cfg.size,cfg.size));
  return encodeGIF(imgs, Math.round(cfg.delay/10));
}
function downloadGIF(tile, cfg, name){
  const blob=new Blob([gifBytes(tile,cfg)],{type:"image/gif"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=name||"army.gif"; a.click();
}
return { PRESETS:TILES, loadTile, renderFrame, encodeGIF, animate, gifBytes, downloadGIF };
})();
