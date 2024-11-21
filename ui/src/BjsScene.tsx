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

  const createRadarMaterial = (scene: Scene) => {
    const material = new StandardMaterial("radarMaterial", scene)

    // Create a dynamic texture
    const textureSize = 4096
    const texture = new DynamicTexture("radarTexture", textureSize, scene, true)
    const ctx = texture.getContext()

    // Fill background
    ctx.fillStyle = "#0f1116"
    ctx.fillRect(0, 0, textureSize, textureSize)

    // Draw concentric circles
    ctx.strokeStyle = "#ccf0fd"
    ctx.lineWidth = 4
    const numberOfCircles = 4
    const centerX = textureSize / 2
    const centerY = textureSize / 2
    const minRadius = (textureSize / 2) * 0.1
    const maxRadius = (textureSize / 2) * 0.9 // 95% of half size

    ctx.beginPath()
    ctx.arc(centerX, centerY, 40, 0, Math.PI * 2)
    ctx.stroke()

    for (let i = 1; i <= numberOfCircles; i++) {
      const radius = ((maxRadius - minRadius) / numberOfCircles) * i + minRadius
      ctx.beginPath()
      ctx.lineWidth = 3 + i
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Draw cross lines
    ctx.beginPath()
    ctx.moveTo(centerX, 0)
    ctx.lineTo(centerX, textureSize)
    ctx.moveTo(0, centerY)
    ctx.lineTo(textureSize, centerY)
    ctx.stroke()

    // Draw angle markers (dashed outer circle)
    const outerRadius = maxRadius + 0.03 * textureSize
    ctx.setLineDash([40, 20])
    ctx.beginPath()
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])

    // Update texture
    texture.update()

    // Configure material
    material.diffuseTexture = texture
    material.emissiveColor = new Color3(1, 1, 1)
    material.specularColor = new Color3(0, 0, 0)
    material.alpha = 0.9

    return material
  }

  useEffect(() => {
    if (!canvasRef.current || bjsEngineRef.current) return
    const engine = new Engine(canvasRef.current, true, {}, true)
    bjsEngineRef.current = engine
    const scene = new Scene(engine)
    scene.clearColor = new Color4(0, 0, 0, 0)

    const camera = new ArcRotateCamera("ArcRotateCamera", 0, 0, 45, new Vector3(0, 0, 0), scene)
    camera.setPosition(new Vector3(0, 45, -30))
    camera.attachControl(canvasRef.current, false)
    camera.inertia = 0.8
    camera.speed = 10
    camera.lowerBetaLimit = camera.beta
    camera.upperBetaLimit = camera.beta
    camera.lowerAlphaLimit = camera.alpha
    camera.upperAlphaLimit = camera.alpha

    // Create ground with radar material
    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 60, height: 60, subdivisions: 1, updatable: false },
      scene
    )
    ground.material = createRadarMaterial(scene)

    engine.runRenderLoop(() => {
      engine.resize()
      scene!.render()
    })
  }, [])

  return <canvas ref={canvasRef} className="scene"></canvas>
}

export default BjsScene
