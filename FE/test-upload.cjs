const fs = require('fs');

async function testUpload() {
  const fileData = fs.readFileSync('test.png', { encoding: 'base64' });
  const formData = new FormData();
  formData.append("image", fileData);

  const uploadRes = await fetch(
    "https://api.imgbb.com/1/upload?key=4dca19e98fb90e2b7efb5a4b2d0b04e2",
    { method: "POST", body: formData }
  );
  const uploadJson = await uploadRes.json();
  console.log(uploadJson);
}

// Generate a dummy 1x1 png in base64
const dummyPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
fs.writeFileSync('test.png', Buffer.from(dummyPngBase64, 'base64'));
testUpload();
