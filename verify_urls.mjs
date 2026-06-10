const urls = [
  // Forces & magnets
  "https://www.bbc.co.uk/bitesize/topics/ztp87nb",
  "https://www.topmarks.co.uk/Physics/Magnetism",
  "https://www.dkfindout.com/uk/science/forces-and-magnets/",
  "https://www.bbc.co.uk/teach/class-clips-video/science-ks2-forces-and-magnets/zqsqdp3",
  // Light & shadows
  "https://www.bbc.co.uk/bitesize/topics/ztq2382",
  "https://www.topmarks.co.uk/Physics/Light",
  "https://www.dkfindout.com/uk/science/light/",
  "https://explorify.org.uk/modules/light-and-seeing/",
  "https://www.bbc.co.uk/teach/class-clips-video/science-ks2-light/z7kn2v4",
  // Sound
  "https://www.bbc.co.uk/bitesize/topics/zcbycj6",
  "https://www.dkfindout.com/uk/science/sound/",
  "https://www.topmarks.co.uk/Physics/Sound",
  "https://www.bbc.co.uk/teach/class-clips-video/science-ks2-sound/zmh4k7h",
  "https://www.stem.org.uk/resources?keywords=sound&level%5B%5D=7&level%5B%5D=8&level%5B%5D=9",
  // Electricity
  "https://www.bbc.co.uk/bitesize/topics/z2hdq6f",
  "https://www.topmarks.co.uk/Physics/Electricity",
  "https://www.dkfindout.com/uk/science/electricity/",
  "https://www.bbc.co.uk/teach/class-clips-video/science-ks2-electricity/z8jbdvn",
  // Forces & motion
  "https://www.bbc.co.uk/bitesize/topics/znssfrd",
  "https://www.dkfindout.com/uk/science/simple-machines/",
  "https://www.topmarks.co.uk/Physics/Forces",
  "https://www.bbc.co.uk/teach/class-clips-video/science-ks2-forces/z7f7cwt",
  "https://explorify.org.uk/modules/floating-and-sinking/",
  // Earth & space
  "https://www.bbc.co.uk/bitesize/topics/znycvcw",
  "https://www.dkfindout.com/uk/science/space/",
  "https://www.topmarks.co.uk/Physics/Space",
  "https://www.bbc.co.uk/teach/class-clips-video/science-ks2-earth-and-space/zbts8x2",
  "https://www.stem.org.uk/resources?keywords=earth%20and%20space&level%5B%5D=7&level%5B%5D=8&level%5B%5D=9",
];

let checked = 0;
let live = 0;
let failed = [];

for (const url of urls) {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if (response.ok || response.status === 405) {
      console.log(`✓ ${url}`);
      live++;
    } else {
      console.log(`✗ ${url} (${response.status})`);
      failed.push(url);
    }
  } catch (e) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log(`✓ ${url}`);
        live++;
      } else {
        console.log(`✗ ${url} (${response.status})`);
        failed.push(url);
      }
    } catch (e2) {
      console.log(`✗ ${url} (error: ${e2.message})`);
      failed.push(url);
    }
  }
  checked++;
}

console.log(`\n\nSummary: ${live}/${checked} URLs live`);
if (failed.length > 0) {
  console.log(`Failed URLs:\n${failed.join('\n')}`);
}
