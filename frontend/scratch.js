async function getUrl() {
  const res = await fetch('https://threadhubb.vercel.app');
  const text = await res.text();
  const match = text.match(/src="\/assets\/(index-[^\.]+\.js)"/);
  if (match) {
    const jsUrl = 'https://threadhubb.vercel.app/assets/' + match[1];
    const jsRes = await fetch(jsUrl);
    const jsText = await jsRes.text();
    const apiMatch = jsText.match(/https:\/\/[^\.]+\.onrender\.com/);
    if (apiMatch) {
      console.log('API URL:', apiMatch[0]);
    } else {
      console.log('No Render URL found in JS');
    }
  }
}
getUrl();
