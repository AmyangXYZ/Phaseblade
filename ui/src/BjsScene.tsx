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
  DirectionalLight,
  HemisphericLight,
  ShadowGenerator,
  Texture,
  SubMesh,
  MultiMaterial,
  ActionManager,
  ExecuteCodeAction,
} from "@babylonjs/core"
import { useEffect, useRef } from "react"

import TruckIcon from "./assets/truck.svg"
import DroneIcon from "./assets/drone.svg"
import "@babylonjs/core/Meshes/Builders/polygonBuilder"

declare module "@babylonjs/core/Meshes/mesh" {
  interface Mesh {
    showSelection(): void
    hideSelection(): void
    toggleSelection(): void
  }
}

declare module "@babylonjs/core/Meshes/abstractMesh" {
  interface AbstractMesh {
    showSelection(): void
    hideSelection(): void
    toggleSelection(): void
  }
}

function BjsScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bjsEngineRef = useRef<Engine | null>(null)
  const shadowGeneratorRef = useRef<ShadowGenerator | null>(null)
  useEffect(() => {
    if (!canvasRef.current || bjsEngineRef.current) return
    const engine = new Engine(canvasRef.current, true, {}, true)
    bjsEngineRef.current = engine
    const scene = new Scene(engine)
    scene.clearColor = new Color4(0, 0, 0, 0)

    const camera = new ArcRotateCamera("ArcRotateCamera", 0, 0, 45, new Vector3(0, 0, 0), scene)
    camera.setPosition(new Vector3(0, 45, -22))
    camera.attachControl(canvasRef.current, false)
    camera.inertia = 0.8
    camera.speed = 10
    camera.lowerAlphaLimit = camera.alpha
    camera.upperAlphaLimit = camera.alpha
    camera.lowerBetaLimit = camera.beta
    camera.upperBetaLimit = camera.beta

    const hemisphericLight = new HemisphericLight("HemisphericLight", new Vector3(0, 1, 0), scene)
    hemisphericLight.intensity = 0.3
    hemisphericLight.specular = new Color3(0, 0, 0)
    hemisphericLight.groundColor = new Color3(1, 1, 1)

    const directionalLight = new DirectionalLight("DirectionalLight", new Vector3(0, -10, 0), scene)
    directionalLight.intensity = 0.7

    shadowGeneratorRef.current = new ShadowGenerator(1024, directionalLight, true)
    shadowGeneratorRef.current.usePercentageCloserFiltering = true
    shadowGeneratorRef.current.forceBackFacesOnly = true
    shadowGeneratorRef.current.filteringQuality = ShadowGenerator.QUALITY_HIGH
    shadowGeneratorRef.current.frustumEdgeFalloff = 0.1
    shadowGeneratorRef.current.transparencyShadow = true

    const ground = MeshBuilder.CreateDisc("ground", { radius: 30, updatable: false, tessellation: 1024 }, scene)
    ground.rotation.x = Math.PI / 2
    ground.material = createRadarMaterial(scene)
    ground.receiveShadows = true

    for (let i = 0; i < 10; i++) {
      const node = createHexagon(`node-${i}`, scene, {
        svg: [TruckIcon, DroneIcon][i % 2],
        position: new Vector3(Math.random() * 40 - 20, 0.5, Math.random() * 40 - 20),
        diameter: 1.8,
      })

      shadowGeneratorRef.current?.addShadowCaster(node)

      // Add click listener
      node.actionManager = new ActionManager(scene)
      node.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
          scene.meshes.forEach((mesh) => {
            if (mesh.hideSelection && mesh !== node) {
              mesh.hideSelection()
            }
          })
          console.log("toggleSelection", node.name)
          node.toggleSelection()
        })
      )
    }

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

  const textureSize = 4096
  const texture = new DynamicTexture("radarTexture", textureSize, scene, true)
  const ctx = texture.getContext()

  ctx.fillStyle = "#1f111f"
  ctx.fillRect(0, 0, textureSize, textureSize)

  ctx.strokeStyle = "#ccf0fd"
  const numberOfCircles = 3
  const centerX = textureSize / 2
  const centerY = textureSize / 2
  const maxRadius = (textureSize / 2) * 0.75

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

  ctx.lineWidth = 3
  ctx.setLineDash([30, 10])

  ctx.beginPath()
  ctx.moveTo(textureSize * 0.235, textureSize * 0.235) // Top-left to bottom-right
  ctx.lineTo(textureSize * 0.765, textureSize * 0.765)
  ctx.moveTo(textureSize * 0.235, textureSize * 0.765) // Bottom-left to top-right
  ctx.lineTo(textureSize * 0.765, textureSize * 0.235)
  ctx.stroke()

  ctx.strokeStyle = "cyan"
  const outerRadius = textureSize / 2 - 10
  ctx.lineWidth = 20
  ctx.setLineDash([outerRadius * Math.PI * (41 / 180), outerRadius * Math.PI * (4 / 180)])
  ctx.beginPath()
  ctx.arc(centerX, centerY, outerRadius, (2 * Math.PI) / 180, (Math.PI * 360) / 180)
  ctx.stroke()
  ctx.setLineDash([])

  const markerWidth = 60
  const markerHeight = 60

  const drawTriangle = (x: number, y: number, rotation: number) => {
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

  drawTriangle(centerX, centerY - outerRadius - 20, 0)
  drawTriangle(centerX + outerRadius + 20, centerY, Math.PI / 2)
  drawTriangle(centerX, centerY + outerRadius + 20, Math.PI)
  drawTriangle(centerX - outerRadius - 20, centerY, -Math.PI / 2)

  texture.hasAlpha = true
  texture.update()

  material.diffuseTexture = texture
  material.useAlphaFromDiffuseTexture = true
  material.emissiveColor = new Color3(0, 0, 0)
  material.specularColor = new Color3(0, 0, 0)
  material.ambientColor = new Color3(1, 1, 1)

  return material
}

const createHexagon = (
  name: string,
  scene: Scene,
  options: {
    diameter?: number
    height?: number
    svg?: string
    position?: Vector3
  }
) => {
  const { diameter = 2, height = 0.2, svg, position } = options

  const hexagon = MeshBuilder.CreateCylinder(
    name,
    {
      height,
      diameter,
      tessellation: 6,
    },
    scene
  )

  const hexTopMaterial = new StandardMaterial(`${name}TopMaterial`, scene)
  const hexSideMaterial = new StandardMaterial(`${name}SideMaterial`, scene)

  if (svg) {
    const img = new Image()
    const svgTexture = new Texture("", scene)
    img.src = svg

    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = 400
      canvas.height = 400
      const ctx = canvas.getContext("2d")!

      // Draw white background
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, 400, 400)

      ctx.save()
      ctx.translate(200, 200)
      ctx.rotate(Math.PI / 2)
      ctx.translate(-200, -200)

      const maxSize = 240
      const scale = Math.min(maxSize / img.width, maxSize / img.height)
      const x = (400 - img.width * scale) / 2
      const y = (400 - img.height * scale) / 2

      // Draw the scaled image
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale)

      svgTexture.updateURL(canvas.toDataURL())
    }

    hexTopMaterial.diffuseTexture = svgTexture
  }

  hexTopMaterial.diffuseColor = new Color3(1, 1, 1)
  hexTopMaterial.emissiveColor = new Color3(0.2, 0.2, 0.2)
  hexTopMaterial.specularColor = new Color3(0, 0, 0)
  hexTopMaterial.specularPower = 0

  hexSideMaterial.diffuseColor = new Color3(1, 1, 1)
  hexSideMaterial.emissiveColor = new Color3(0.5, 0.5, 0.5)
  hexSideMaterial.specularColor = new Color3(0, 0, 0)
  hexSideMaterial.ambientColor = new Color3(1, 1, 1)

  const multiMaterial = new MultiMaterial(`${name}Multi`, scene)
  multiMaterial.subMaterials.push(hexSideMaterial, hexTopMaterial)

  hexagon.material = multiMaterial
  hexagon.subMeshes = []
  hexagon.subMeshes.push(
    new SubMesh(0, 0, 36, 0, 36, hexagon), // Bottom
    new SubMesh(1, 36, 36, 36, 36, hexagon), // Top
    new SubMesh(0, 72, 36, 72, 36, hexagon) // Sides
  )

  if (position) {
    hexagon.position = position
  }

  hexagon.rotation.y = -Math.PI / 2

  const selectionRing = MeshBuilder.CreateDisc(
    `${name}SelectionRing`,
    {
      radius: diameter! * 0.83,
      tessellation: 64,
    },
    scene
  )
  selectionRing.material = createSelectionRingTexture(scene)
  selectionRing.position.y = 0.01 - hexagon.position.y
  selectionRing.rotation.x = Math.PI / 2
  selectionRing.parent = hexagon
  selectionRing.renderingGroupId = 1

  hexagon.showSelection = () => selectionRing.setEnabled(true)
  hexagon.hideSelection = () => selectionRing.setEnabled(false)
  hexagon.toggleSelection = () => selectionRing.setEnabled(!selectionRing.isEnabled())
  hexagon.renderingGroupId = 1
  hexagon.hideSelection()
  return hexagon
}

const createSelectionRingTexture = (scene: Scene): StandardMaterial => {
  const material = new StandardMaterial("selectionRingMaterial", scene)

  const ringTextureSize = 512
  const ringTexture = new DynamicTexture("selectionRingTexture", ringTextureSize, scene, true)
  const ringContext = ringTexture.getContext()

  ringContext.fillStyle = "transparent"
  ringContext.fillRect(0, 0, ringTextureSize, ringTextureSize)

  const centerX = ringTextureSize / 2
  const centerY = ringTextureSize / 2

  const ringWidth = 20
  const outerRingWidth = 60
  const mainRadius = ringTextureSize / 2 - ringWidth / 2 - outerRingWidth

  ringContext.strokeStyle = "yellow"
  ringContext.lineWidth = ringWidth
  ringContext.beginPath()
  ringContext.arc(centerX, centerY, mainRadius, 0, Math.PI * 2)
  ringContext.stroke()

  const outerRadius = mainRadius + ringWidth / 2 + outerRingWidth / 2
  ringContext.strokeStyle = "rgba(255, 255, 0, 0.5)"
  ringContext.lineWidth = outerRingWidth

  const dashLength = (outerRadius * Math.PI * 105) / 180
  const gapLength = (outerRadius * Math.PI * 15) / 180
  ringContext.setLineDash([dashLength, gapLength])

  ringContext.beginPath()
  ringContext.arc(centerX, centerY, outerRadius, 0, Math.PI * 2)
  ringContext.stroke()

  ringTexture.hasAlpha = true
  ringTexture.update()
  material.diffuseTexture = ringTexture
  material.useAlphaFromDiffuseTexture = true
  // material.backFaceCulling = false

  return material
}

export default BjsScene
