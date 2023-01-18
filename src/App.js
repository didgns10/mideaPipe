import "./App.css"
import { FaceMesh } from "@mediapipe/face_mesh"
import * as Facemesh from "@mediapipe/face_mesh"
import * as cam from "@mediapipe/camera_utils"
import Webcam from "react-webcam"
import Button from "react-bootstrap/Button"
import React, { useRef, useEffect, useState } from "react"

function App() {
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)
  const [landmark, setLandmark] = useState([])
  const [landmarkCapture, setLandmarkCapture] = useState([])

  var camera = null
  var land = []
  var minDistance = 10000
  var landmarkCaptures = []
  var captuereDistance = 0

  const connect = window.drawConnectors

  const onResults = async (results) => {
    //Setting H,W of canvas
    canvasRef.current.width = webcamRef.current.video.videoWidth
    canvasRef.current.height = webcamRef.current.video.videoHeight

    const canvasElement = canvasRef.current
    const canvasCtx = canvasElement.getContext("2d")
    canvasCtx.save()

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height)
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    )
    if (results.multiFaceLandmarks) {
      //console.log(results)
      land = results.multiFaceLandmarks[0]
      // if (
      //   landmarkCaptures !== undefined &&
      //   landmarkCaptures !== null &&
      //   landmarkCaptures.length !== 0 &&
      //   land !== undefined
      // ) {
      //   let distance = 0
      //   for (let i = 0; i < landmarkCaptures.length; i++) {
      //     distance += euclideanDistance3D(landmarkCaptures[i], land[i])
      //   }
      //   console.log(distance)
      //   if (distance < 30) {
      //     //console.log("minDistance", distance)
      //   }
      //   // if (minDistance > distance) {
      //   //   console.log("minDistance", distance)
      //   //   minDistance = distance
      //   // }
      // }
      if (land !== undefined && captuereDistance !== 0) {
        let distance = 0
        for (let i = 0; i < land.length - 1; i++) {
          distance += euclideanDistance3D(land[i], land[i + 1])
        }
        const diffDistance = absDistance(captuereDistance, distance)
        console.log(diffDistance)
      }

      for (const landmarks of results.multiFaceLandmarks) {
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_TESSELATION, {
          color: "#C0C0C070",
          lineWidth: 1,
        })
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYE, {
          color: "#FF3030",
        })
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYEBROW, {
          color: "#FF3030",
        })
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_IRIS, {
          color: "#FF3030",
        })
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYE, {
          color: "#30FF30",
        })
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYEBROW, {
          color: "#30FF30",
        })
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_IRIS, {
          color: "#30FF30",
        })
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_FACE_OVAL, {
          color: "#E0E0E0",
        })
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_LIPS, {
          color: "#E0E0E0",
        })
      }
    }

    canvasCtx.restore()
  }

  useEffect(() => {
    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      },
    })

    faceMesh.setOptions({
      maxNumFaces: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    faceMesh.onResults(onResults)

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await faceMesh.send({ image: webcamRef.current.video })
        },
        width: 640,
        height: 480,
      })
      camera.start()
    }
  })

  function euclideanDistance3D(p1, p2) {
    const dx = p1.x - p2.x
    const dy = p1.y - p2.y
    const dz = p1.z - p2.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  function absDistance(p1, p2) {
    return Math.abs(p1 - p2)
  }

  const buttonClick = async () => {
    console.log(land)
    landmarkCaptures = land

    if (
      landmarkCaptures !== undefined &&
      landmarkCaptures !== null &&
      landmarkCaptures.length !== 0
    ) {
      let distance = 0
      for (let i = 0; i < landmarkCaptures.length - 1; i++) {
        distance += euclideanDistance3D(
          landmarkCaptures[i],
          landmarkCaptures[i + 1]
        )
      }
      captuereDistance = distance
      console.log(distance)
    }
  }

  return (
    <div className="container-fluid">
      <div className="text-center">
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={buttonClick}
        >
          버튼
        </button>
      </div>
      <Webcam
        ref={webcamRef}
        style={{
          position: "absolute",
          marginRight: "auto",
          marginLeft: "auto",
          marginTop: "auto",
          marginBottom: "auto",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 9,
          width: "auto",
          height: "auto",
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          marginRight: "auto",
          marginLeft: "auto",
          marginTop: "auto",
          marginBottom: "auto",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 9,
          width: "auto",
          height: "auto",
        }}
      ></canvas>
    </div>
  )
}

export default App
