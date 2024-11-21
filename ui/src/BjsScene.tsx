import {
  ArcRotateCamera,
  Color3,
  Vector3,
  Engine,
  Scene,
  MeshBuilder,
  StandardMaterial,
  DynamicTexture,
  Color4,
} from "@babylonjs/core"
import { useEffect, useRef } from "react"

function BjsScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bjsEngineRef = useRef<Engine | null>(null)

  useEffect(() => {
    if (!canvasRef.current || bjsEngineRef.current) return
    const engine = new Engine(canvasRef.current, true, {}, true)
    bjsEngineRef.current = engine
    const scene = new Scene(engine)
    scene.clearColor = new Color4(0, 0, 0, 0)

    const camera = new ArcRotateCamera("ArcRotateCamera", 0, 0, 45, new Vector3(0, 0, 0), scene)
    camera.setPosition(new Vector3(0, 55, -25))
    camera.attachControl(canvasRef.current, false)
    camera.inertia = 0.8
    camera.speed = 10
    // camera.lowerBetaLimit = camera.beta
    // camera.upperBetaLimit = camera.beta
    // camera.lowerAlphaLimit = camera.alpha
    // camera.upperAlphaLimit = camera.alpha

    // Create ground with radar material
    const ground = MeshBuilder.CreateDisc("ground", { radius: 30, updatable: false }, scene)
    ground.rotation.x = Math.PI / 2
    ground.material = createRadarMaterial(scene)

    engine.runRenderLoop(() => {
      engine.resize()
      scene!.render()
    })
  }, [])

  return <canvas ref={canvasRef} className="scene"></canvas>
}

const createRadarMaterial = (scene: Scene) => {
  const material = new StandardMaterial("radarMaterial", scene)
  material.backFaceCulling = false
  // Create a dynamic texture
  const textureSize = 4096
  const texture = new DynamicTexture("radarTexture", textureSize, scene, true)
  const ctx = texture.getContext()

  // Fill background
  ctx.fillStyle = "#0f1116"
  ctx.fillRect(0, 0, textureSize, textureSize)

  // Draw concentric circles
  ctx.strokeStyle = "#dcf0fd"
  const numberOfCircles = 3
  const centerX = textureSize / 2
  const centerY = textureSize / 2
  const maxRadius = (textureSize / 2) * 0.8

  ctx.beginPath()
  ctx.arc(centerX, centerY, 40, 0, Math.PI * 2)
  ctx.stroke()

  for (let i = 1; i <= numberOfCircles; i++) {
    const radius = (maxRadius / numberOfCircles) * i
    ctx.beginPath()
    ctx.lineWidth = 2 + i * 2
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Draw cross lines
  ctx.lineWidth = 3
  ctx.setLineDash([40, 20])

  ctx.beginPath()
  ctx.moveTo(textureSize * 0.217, textureSize * 0.217) // Top-left to bottom-right
  ctx.lineTo(textureSize * 0.783, textureSize * 0.783)
  ctx.moveTo(textureSize * 0.217, textureSize * 0.783) // Bottom-left to top-right
  ctx.lineTo(textureSize * 0.783, textureSize * 0.217)
  ctx.stroke()

  // Draw angle markers (dashed outer circle)
  ctx.strokeStyle = "cyan"

  const outerRadius = textureSize / 2 - 20
  ctx.lineWidth = 20
  ctx.setLineDash([outerRadius * Math.PI * (41 / 180), outerRadius * Math.PI * (4 / 180)])
  ctx.beginPath()
  ctx.arc(centerX, centerY, outerRadius, (2 * Math.PI) / 180, (Math.PI * 360) / 180)
  ctx.stroke()
  ctx.setLineDash([])

  // Draw triangular markers at cardinal points
  const markerWidth = 80
  const markerHeight = 60

  // Helper function to draw a single marker
  const drawMarker = (x: number, y: number, rotation: number) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)

    ctx.fillStyle = "cyan"
    ctx.beginPath()
    ctx.moveTo(-markerWidth / 2, 0)
    ctx.lineTo(markerWidth / 2, 0)
    ctx.lineTo(0, markerHeight) // Changed to point inward
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  // Draw markers at cardinal points
  drawMarker(centerX, centerY - outerRadius - markerHeight / 2, 0)
  drawMarker(centerX + outerRadius + markerWidth / 2, centerY, Math.PI / 2)
  drawMarker(centerX, centerY + outerRadius + markerHeight / 2, Math.PI)
  drawMarker(centerX - outerRadius - markerWidth / 2, centerY, -Math.PI / 2)

  // Update texture
  texture.update()

  // Configure material
  material.diffuseTexture = texture
  material.emissiveColor = new Color3(1, 1, 1)
  material.specularColor = new Color3(0, 0, 0)
  material.alpha = 1

  return material
}

export default BjsScene
