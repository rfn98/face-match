const imageUpload = document.getElementById('imageUpload')
let camera_button = document.querySelector("#start-camera");
let video = document.querySelector("#video");

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/face-matching/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/face-matching/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/face-matching/models')
]).then(start)

async function start() {
  const container = document.createElement('div')
  container.style.position = 'relative'
  document.body.append(container)

  const labeledFaceDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.5)
  let image
  let canvas
  document.body.append('Loaded')
  
  imageUpload.addEventListener('change', async () => {
    /* Dijalankan ketika terjadi file upload  di sini pencocokan data di lakukan*/
    if (image) image.remove()
    if (canvas) canvas.remove()
    image = await faceapi.bufferToImage(imageUpload.files[0])
    container.append(image)
    canvas = faceapi.createCanvasFromMedia(image)
    container.append(canvas)
    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(canvas, displaySize)

    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
      drawBox.draw(canvas)
    })
  })

}

camera_button.addEventListener('click', async function() {
 let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  video.srcObject = stream;
  const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
  drawBox.draw(canvas)
});

function loadLabeledImages() {
  const labels = ['bondan', 'miftah', 'umar', 'wawan']
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`http://127.0.0.1/face-matching/labeled_images/${label}/${i}.png`)
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}
