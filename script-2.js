const video = document.querySelector("#video");
let camera_button = document.querySelector("#start-camera");

function start() {
  navigator.getUserMedia({video: {}}, (stream) => {
    video.srcObject = stream
  }, (err) => {
    console.log(err)
  })
}

camera_button.addEventListener('click', async function() {
 let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
 const labeledFaceDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.5)
 video.srcObject = stream;
 canvas = faceapi.createCanvas(video)
 document.body.append(canvas)
  // container.append(canvas)
  // const displaySize = { width: video.width, height: video.height }
  // faceapi.matchDimensions(canvas, displaySize)

  // setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    results.forEach((result, i) => {
      console.log('RESULT', result)
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
      drawBox.draw(canvas)
      faceapi.draw.drawDetections(canvas, resizedDetections)
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    })
  // }, 100)

  // setTimeout(() => click_photo.click(), 1000)
});

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/face-matching/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/face-matching/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/face-matching/models'),
]).then(start)