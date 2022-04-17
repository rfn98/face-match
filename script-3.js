let video = document.getElementById("video");
let canvas = document.body.appendChild(document.createElement("canvas"));
let ctx = canvas.getContext("2d");
let displaySize;

let width = 1280;
let height = 720;

const startSteam = () => {
    console.log("----- START STEAM ------");
    navigator.mediaDevices.getUserMedia({
        video: {width, height},
        audio : false
    }).then((steam) => {video.srcObject = steam});
}

console.log(faceapi.nets);

console.log("----- START LOAD MODEL ------");
Promise.all([
    // faceapi.nets.ageGenderNet.loadFromUri('models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('models'),
    faceapi.nets.tinyFaceDetector.loadFromUri('models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('models'),
    // faceapi.nets.faceExpressionNet.loadFromUri('models')
]).then(startSteam);


async function detect() {
    const detections = await faceapi.detectAllFaces(video)
                                .withFaceLandmarks()
                                // .withFaceExpressions()
                                // .withAgeAndGender()
                                .withFaceDescriptors()
    //console.log(detections);

    if (!detections.length) {
        return
    }

    const labeledFaceDescriptors = await loadLabeledImages()
    console.log('LABELEDFACEDESCRIPTORS', labeledFaceDescriptors)
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors)
    
    ctx.clearRect(0,0, width, height);
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    // faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    // console.log(resizedDetections.map(r => r));
    // const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    results.forEach((result, i) => {
        // console.log('RESULT FACE', result)
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
      drawBox.draw(canvas)
    })
    /*results.forEach((result, i) => {
      new faceapi.draw.DrawTextField ([
        // `${Math.round(age,0)} Tahun`,
        // `${gender} ${Math.round(genderProbability)}`
        result.toString()
        ],
        // result.detection.box.bottomRight
        ).draw(canvas);
    })*/
    /*resizedDetections.forEach(result => {
        console.log('RESULT', result.descriptor)
        const {age, gender, genderProbability} = result;
        new faceapi.draw.DrawTextField ([
            // `${Math.round(age,0)} Tahun`,
            `${gender} ${Math.round(genderProbability)}`
        ],
        // result.detection.box.bottomRight
        ).draw(canvas);
    });*/
}

video.addEventListener('play', ()=> {
    displaySize = {width, height};
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(detect, 100);
})

function loadLabeledImages() {
  // const labels = label_name.map(r => r.name)
  const labels = ['Satrio Budio', 'Rifan Ajie Agung', 'Tono Antino']
  console.log('LANEDSDSDSFSFS', labels)
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      // for (let i = 1; i <= 2; i++) {
        for (const idx in labels) {
            const img = await faceapi.fetchImage(`http://localhost/face-matching/labeled_images/${label}.png`)
            // const img = await faceapi.fetchImage(`https://firebasestorage.googleapis.com/v0/b/projectvue-d5bab.appspot.com/o/Absensi%2F${labels[idx]}?alt=media`)
            console.log("SDSFSFDFDFLDFLDLFDDFDL", img)
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
            descriptions.push(detections.descriptor)
            // if (labels.length) break
        }
      // }

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}