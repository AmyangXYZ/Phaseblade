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
  Mesh,
  VertexData,
} from "@babylonjs/core"
import { useEffect, useRef, useState } from "react"
import Card from "./components/Card"
import TruckIcon from "./assets/icons/truck-fast.svg"
import DroneIcon from "./assets/icons/drone.svg"
import DatabaseIcon from "./assets/icons/database.svg"
import ChessRookIcon from "./assets/icons/chess-rook.svg"
import IndustryIcon from "./assets/icons/industry-windows.svg"
import StarIcon from "./assets/icons/star.svg"
import GasPumpIcon from "./assets/icons/gas-pump.svg"
import BoxesIcon from "./assets/icons/boxes-stacked.svg"

import "@babylonjs/core/Meshes/Builders/polygonBuilder"

import { Unit } from "./index"

import earcut from "earcut"
window.earcut = earcut

const UnitTypes: Record<string, Unit> = {
  vehicle: { label: "Vehicle", icon: TruckIcon, type: "vehicle", isStatic: false },
  drone: { label: "Drone", icon: DroneIcon, type: "drone", isStatic: false },
  dataHub: { label: "Data Hub", icon: DatabaseIcon, type: "dataHub", isStatic: true },
  c2: { label: "Command & Control", icon: ChessRookIcon, type: "c2", isStatic: true },
  depot: { label: "Supply Depot", icon: IndustryIcon, type: "depot", isStatic: true },
  outpost: { label: "Outpost", icon: StarIcon, type: "outpost", isStatic: true },
  fuelStation: { label: "Fuel Station", icon: GasPumpIcon, type: "fuelStation", isStatic: true },
  cargo: { label: "Cargo", icon: BoxesIcon, type: "cargo", isStatic: true },
}

function BjsScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bjsEngineRef = useRef<Engine | null>(null)
  const shadowGeneratorRef = useRef<ShadowGenerator | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const selectedNodeRef = useRef<string | null>(null)

  useEffect(() => {
    if (!canvasRef.current || bjsEngineRef.current) return
    const engine = new Engine(canvasRef.current, true, {}, true)
    bjsEngineRef.current = engine
    const scene = new Scene(engine)
    scene.clearColor = new Color4(0, 0, 0, 0)

    const camera = new ArcRotateCamera("ArcRotateCamera", 0, 0, 45, new Vector3(0, 0, 0), scene)
    camera.setPosition(new Vector3(0, 46, -22))
    camera.attachControl(canvasRef.current, false)
    camera.inertia = 0.9
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

    shadowGeneratorRef.current = new ShadowGenerator(4096, directionalLight, true)
    shadowGeneratorRef.current.usePercentageCloserFiltering = true
    shadowGeneratorRef.current.forceBackFacesOnly = true
    shadowGeneratorRef.current.filteringQuality = ShadowGenerator.QUALITY_MEDIUM
    shadowGeneratorRef.current.frustumEdgeFalloff = 0.1
    shadowGeneratorRef.current.transparencyShadow = true
    shadowGeneratorRef.current.useBlurExponentialShadowMap = true
    shadowGeneratorRef.current.blurScale = 2

    createRadarGround(30, scene)
    createTacticalGround(28, 9, 12, scene)

    for (let i = 0; i < 20; i++) {
      const unit = UnitTypes[Object.keys(UnitTypes)[Math.floor(Math.random() * Object.keys(UnitTypes).length)]]
      const node = createHexagon(`${unit.type}-${i}`, scene, {
        svg: unit.icon,
        position: new Vector3(Math.random() * 40 - 20, 0.5, Math.random() * 40 - 20),
        diameter: 2,
      })

      shadowGeneratorRef.current?.addShadowCaster(node)

      node.actionManager = new ActionManager(scene)
      node.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
          if (selectedNodeRef.current === node.name) {
            node.hideSelection()
            setSelectedNode(null)
            return
          }

          scene.meshes.forEach((mesh) => {
            if (mesh.hideSelection && mesh !== node) {
              mesh.hideSelection()
            }
          })
          node.showSelection()

          if (selectedNodeRef.current !== node.name) {
            camera.spinTo(node.position.clone().add(new Vector3(0, 24, -12)), node.position.clone(), 500)
            setSelectedNode(node.name)
          }
        })
      )

      if (Math.random() < 0.3) {
        node.showSignalRipple()
      }

      let time = 0
      let randomOffset = {
        x: Math.random() * 0.2 - 0.1,
        z: Math.random() * 0.2 - 0.1,
      }

      if (!unit.isStatic) {
        let lastTime = performance.now()
        const targetDelta = 1000 / 60
        let accumulator = 0

        const animate = (currentTime: number) => {
          const deltaTime = currentTime - lastTime
          accumulator += deltaTime

          // Update position only when enough time has accumulated
          while (accumulator >= targetDelta) {
            time += 0.002

            // Calculate new position
            const newX = node.position.x + (Math.sin(time * 1.1) / 2) * randomOffset.x
            const newZ = node.position.z + (Math.sin(time * 1.2) / 2) * randomOffset.z

            // Check boundaries
            const maxRadius = 25
            const distanceFromCenter = Math.sqrt(newX * newX + newZ * newZ)

            if (distanceFromCenter < maxRadius) {
              node.position.x = newX
              node.position.z = newZ
            } else {
              randomOffset = {
                x: Math.random() * 0.2 - 0.1,
                z: Math.random() * 0.2 - 0.1,
              }
            }

            accumulator -= targetDelta
          }

          lastTime = currentTime
          requestAnimationFrame(animate)
        }

        requestAnimationFrame(animate)
      }
    }

    scene.onPointerDown = (e) => {
      if (e.button === 0 || e.button === 2) {
        const pickResult = scene.pick(scene.pointerX, scene.pointerY)
        if (pickResult.hit && pickResult.pickedMesh) {
          if (pickResult.pickedMesh.name.includes("-") && !pickResult.pickedMesh.name.startsWith("section_")) {
            return
          }
        }

        setSelectedNode(null)
        scene.meshes.forEach((mesh) => {
          if (mesh.hideSelection) {
            mesh.hideSelection()
          }
        })
      }
    }

    engine.runRenderLoop(() => {
      engine.resize()
      scene!.render()
    })
  }, [])

  useEffect(() => {
    selectedNodeRef.current = selectedNode
  }, [selectedNode])

  return (
    <>
      <canvas ref={canvasRef} className="scene"></canvas>
      {selectedNode && (
        <Card
          title={UnitTypes[selectedNode.split("-")[0]].label}
          icon={<img src={UnitTypes[selectedNode.split("-")[0]].icon} />}
          subtitle="RETRIEVE VALUABLE DATA"
          body={<div>Retrieve and transmit the vital research data.</div>}
          footer="SELECT MISSION"
          width="420px"
          style={{
            position: "absolute",
            top: "50%",
            left: "calc(50% + 100px)",
            transform: "translateY(-50%)",
            zIndex: 10,
          }}
        />
      )}
    </>
  )
}

const createRadarGround = (radius: number, scene: Scene) => {
  const createRadarMaterial = (scene: Scene) => {
    const material = new StandardMaterial("radarMaterial", scene)
    material.backFaceCulling = false

    const textureSize = 4096
    const texture = new DynamicTexture("radarTexture", textureSize, scene, true)
    const ctx = texture.getContext()

    ctx.fillStyle = "transparent"
    ctx.fillRect(0, 0, textureSize, textureSize)

    // ctx.strokeStyle = "#ccf0fd"
    // const numberOfCircles = 3
    const centerX = textureSize / 2
    const centerY = textureSize / 2
    // const maxRadius = (textureSize / 2) * 0.75

    // ctx.beginPath()
    // ctx.arc(centerX, centerY, 40, 0, Math.PI * 2)
    // ctx.stroke()

    // for (let i = 1; i <= numberOfCircles; i++) {
    //   const radius = (maxRadius / numberOfCircles) * i
    //   ctx.beginPath()
    //   ctx.lineWidth = 2 + i * 2
    //   ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    //   ctx.stroke()
    // }

    // ctx.lineWidth = 3
    // ctx.setLineDash([30, 10])

    // ctx.beginPath()
    // ctx.moveTo(textureSize * 0.235, textureSize * 0.235) // Top-left to bottom-right
    // ctx.lineTo(textureSize * 0.765, textureSize * 0.765)
    // ctx.moveTo(textureSize * 0.235, textureSize * 0.765) // Bottom-left to top-right
    // ctx.lineTo(textureSize * 0.765, textureSize * 0.235)
    // ctx.stroke()

    ctx.strokeStyle = "cyan"
    const outerRadius = textureSize / 2 - 10
    ctx.lineWidth = 20
    ctx.setLineDash([outerRadius * Math.PI * (41 / 180), outerRadius * Math.PI * (4 / 180)])
    ctx.beginPath()
    ctx.arc(centerX, centerY, outerRadius, (2 * Math.PI) / 180, (Math.PI * 360) / 180)
    ctx.stroke()
    ctx.setLineDash([])

    texture.hasAlpha = true
    texture.update()

    material.diffuseTexture = texture
    material.useAlphaFromDiffuseTexture = true
    material.emissiveColor = new Color3(0, 0.5, 0.5)
    material.specularColor = new Color3(0, 0, 0)
    material.ambientColor = new Color3(1, 1, 1)

    return material
  }

  const ground = MeshBuilder.CreateDisc("ground", { radius, updatable: false, tessellation: 64 }, scene)
  ground.rotation.x = Math.PI / 2
  ground.position.y = 0.01
  ground.material = createRadarMaterial(scene)

  createTriangleMarker(new Vector3(-radius, 0.1, 0), Math.PI / 2, 0.7, "right", 1, scene)
  createTriangleMarker(new Vector3(radius, 0.1, 0), -Math.PI / 2, 0.7, "left", 1, scene)
  createTriangleMarker(new Vector3(0, 0.1, -radius), 0, 0.7, "up", 1, scene)
  createTriangleMarker(new Vector3(0, 0.1, radius), Math.PI, 0.7, "down", 1, scene)
}

const createTacticalGround = (radius: number, numberOfRings: number, numberOfSections: number, scene: Scene) => {
  // Configuration
  const height = 0.01
  const ringSize = radius / numberOfRings
  const sectionAngle = (2 * Math.PI) / numberOfSections

  // Create a grid to track group assignments
  const grid = Array(numberOfRings)
    .fill(null)
    .map(() => Array(numberOfSections).fill(null))
  const sections = new Map()
  const groups = new Map()

  const getAdjacent = (ring: number, section: number) => {
    const adj: [number, number][] = []
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]

    for (const [dr, ds] of directions) {
      const newRing = ring + dr
      let newSection = section + ds
      if (newSection < 0) newSection = numberOfSections - 1
      if (newSection >= numberOfSections) newSection = 0

      if (newRing >= 0 && newRing < numberOfRings) {
        adj.push([newRing, newSection])
      }
    }
    return adj
  }

  // Assign groups with strict adjacency
  let nextGroupId = 0
  for (let ring = 0; ring < numberOfRings; ring++) {
    for (let section = 0; section < numberOfSections; section++) {
      if (grid[ring][section] === null) {
        const groupId = nextGroupId++
        const group = {
          id: groupId,
          sections: [] as Mesh[],
        }
        groups.set(groupId, group)

        const groupSize = Math.floor(Math.random() * 4) + 2
        const stack: [number, number][] = [[ring, section]]
        let assigned = 0

        while (stack.length > 0 && assigned < groupSize) {
          const [r, s] = stack.pop()!
          if (r >= 0 && r < numberOfRings && grid[r][s] === null) {
            grid[r][s] = group.id
            assigned++

            const adjacent = getAdjacent(r, s)
            for (const adj of adjacent.sort(() => Math.random() - 0.5)) {
              if (grid[adj[0]][adj[1]] === null) {
                stack.push(adj)
              }
            }
          }
        }
      }
    }
  }

  const highlightColor = new Color3(0.0, 0.6, 1)
  const defaultColor = new Color3(0.0627, 0.0667, 0.1216)
  const ground = new Mesh("tactical-ground", scene)

  // Create sections based on group assignments
  for (let ringIndex = 0; ringIndex < numberOfRings; ringIndex++) {
    const innerRadius = ringIndex * ringSize
    const outerRadius = (ringIndex + 1) * ringSize

    for (let sectionIndex = 0; sectionIndex < numberOfSections; sectionIndex++) {
      const startAngle = sectionIndex * sectionAngle
      const endAngle = (sectionIndex + 1) * sectionAngle

      const shape = []
      const tessellation = 16

      // Outer arc
      for (let i = 0; i <= tessellation; i++) {
        const angle = startAngle + (i / tessellation) * (endAngle - startAngle)
        shape.push(new Vector3(outerRadius * Math.cos(angle), 0, outerRadius * Math.sin(angle)))
      }

      // Inner arc (reverse)
      for (let i = tessellation; i >= 0; i--) {
        const angle = startAngle + (i / tessellation) * (endAngle - startAngle)
        shape.push(new Vector3(innerRadius * Math.cos(angle), 0, innerRadius * Math.sin(angle)))
      }

      const groupId = grid[ringIndex][sectionIndex]
      const group = groups.get(groupId)

      const section = MeshBuilder.ExtrudePolygon(
        `section_${ringIndex}_${sectionIndex}`,
        { shape, depth: height },
        scene
      )

      section.parent = ground
      section.receiveShadows = true
      sections.set(`${ringIndex},${sectionIndex}`, section)
      group.sections.push(section)

      const material = new StandardMaterial(`mat_${ringIndex}_${sectionIndex}`, scene)
      material.diffuseColor = defaultColor
      material.specularColor = new Color3(0, 0, 0)
      material.emissiveColor = new Color3(0, 0, 0)
      material.ambientColor = new Color3(1, 1, 1)
      section.material = material

      section.actionManager = new ActionManager(scene)

      section.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
          group.sections.forEach((groupSection: Mesh) => {
            groupSection.position.y = height
            ;(groupSection.material as StandardMaterial).diffuseColor = highlightColor
            ;(groupSection.material as StandardMaterial).emissiveColor = new Color3(0.2, 0.2, 0)
          })
        })
      )

      section.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
          group.sections.forEach((groupSection: Mesh) => {
            groupSection.position.y = 0
            ;(groupSection.material as StandardMaterial).diffuseColor = defaultColor
            ;(groupSection.material as StandardMaterial).emissiveColor = new Color3(0, 0, 0)
          })
        })
      )
    }
  }

  // Add gap lines between different groups
  for (let ringIndex = 0; ringIndex < numberOfRings; ringIndex++) {
    for (let sectionIndex = 0; sectionIndex < numberOfSections; sectionIndex++) {
      const currentGroup = grid[ringIndex][sectionIndex]

      // Check right neighbor
      const rightSection = (sectionIndex + 1) % numberOfSections
      if (grid[ringIndex][rightSection] !== currentGroup) {
        const angle = (sectionIndex + 1) * sectionAngle
        const line = MeshBuilder.CreateLines(
          "line",
          {
            points: [
              new Vector3(ringIndex * ringSize * Math.cos(angle), height, ringIndex * ringSize * Math.sin(angle)),
              new Vector3(
                (ringIndex + 1) * ringSize * Math.cos(angle),
                height,
                (ringIndex + 1) * ringSize * Math.sin(angle)
              ),
            ],
          },
          scene
        )
        line.parent = ground
        line.color = new Color3(0.8, 0.941, 0.992)
      }

      // Check outer neighbor
      if (ringIndex < numberOfRings - 1 && grid[ringIndex + 1][sectionIndex] !== currentGroup) {
        const startAngle = sectionIndex * sectionAngle
        const endAngle = (sectionIndex + 1) * sectionAngle
        const points = []
        const steps = 16
        const radius = (ringIndex + 1) * ringSize

        for (let i = 0; i <= steps; i++) {
          const angle = startAngle + (i / steps) * (endAngle - startAngle)
          points.push(new Vector3(radius * Math.cos(angle), height, radius * Math.sin(angle)))
        }
        const line = MeshBuilder.CreateLines("line", { points }, scene)
        line.parent = ground
        line.color = new Color3(0.8, 0.941, 0.992)
      }

      // Add outer edge line for the last ring
      if (ringIndex === numberOfRings - 1) {
        const startAngle = sectionIndex * sectionAngle
        const endAngle = (sectionIndex + 1) * sectionAngle
        const points = []
        const steps = 16
        const radius = numberOfRings * ringSize

        for (let i = 0; i <= steps; i++) {
          const angle = startAngle + (i / steps) * (endAngle - startAngle)
          points.push(new Vector3(radius * Math.cos(angle), height, radius * Math.sin(angle)))
        }
        const line = MeshBuilder.CreateLines("line", { points }, scene)
        line.parent = ground
        line.color = new Color3(0.8, 0.941, 0.992)
      }
    }
  }

  return ground
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
    new SubMesh(0, 0, 36, 0, 36, hexagon), // Side faces
    new SubMesh(0, 36, 18, 36, 18, hexagon), // Bottom face
    new SubMesh(1, 54, 18, 54, 18, hexagon) // Top face (SVG texture)
  )

  if (position) {
    hexagon.position = position
  }

  hexagon.rotation.y = -Math.PI / 2

  const selectionRing = MeshBuilder.CreateDisc(
    `${name}-SelectionRing`,
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

  let selectionTime = 0

  hexagon.showSelection = () => {
    selectionTime = 0
    selectionRing.setEnabled(true)
  }
  hexagon.hideSelection = () => selectionRing.setEnabled(false)
  hexagon.toggleSelection = () => selectionRing.setEnabled(!selectionRing.isEnabled())
  hexagon.hideSelection()

  const signalRipple = MeshBuilder.CreateDisc(
    `${name}-SignalRipple`,
    {
      radius: diameter! * 0.83,
      tessellation: 64,
    },
    scene
  )

  signalRipple.material = createSignalRippleTexture(scene)
  signalRipple.position.y = 0.02 - hexagon.position.y
  signalRipple.rotation.x = Math.PI / 2
  signalRipple.parent = hexagon
  signalRipple.renderingGroupId = 1

  let rippleTime = 0
  const animationLoop = () => {
    const frameTime = 1000 / 60
    let lastTime = performance.now()
    let accumulator = 0

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime
      lastTime = currentTime
      accumulator += deltaTime

      // Update only when enough time has accumulated for a frame
      while (accumulator >= frameTime) {
        if (selectionRing.isEnabled()) {
          selectionTime += 0.005
          selectionRing.rotation.y = Math.PI * 2 * (selectionTime % 1)
        }

        if (signalRipple.isEnabled()) {
          rippleTime += 0.02
          signalRipple.scaling.setAll(2 * (rippleTime % 1))
        }

        accumulator -= frameTime
      }

      requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }

  animationLoop()

  hexagon.showSignalRipple = () => {
    signalRipple.setEnabled(true)
    rippleTime = 0
  }
  hexagon.hideSignalRipple = () => signalRipple.setEnabled(false)
  hexagon.toggleSignalRipple = () => signalRipple.setEnabled(!signalRipple.isEnabled())

  hexagon.hideSignalRipple()

  hexagon.renderingGroupId = 1

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

  return material
}

const createSignalRippleTexture = (scene: Scene): StandardMaterial => {
  const material = new StandardMaterial("signalRippleMaterial", scene)
  const textureSize = 512
  const texture = new DynamicTexture("signalRippleTexture", textureSize, scene, true)
  const context = texture.getContext()

  const centerX = textureSize / 2
  const centerY = textureSize / 2
  const ringWidth = 75
  const radius = textureSize / 2 - ringWidth / 2

  // Clear background
  context.fillStyle = "transparent"
  context.clearRect(0, 0, textureSize, textureSize)

  // Create radial gradient for the glowing effect
  const gradient = context.createRadialGradient(
    centerX,
    centerY,
    radius + ringWidth / 4, // Start from outer edge
    centerX,
    centerY,
    radius - ringWidth / 2 // End inside the ring
  )

  gradient.addColorStop(0, "rgba(255, 69, 0, 1)")
  gradient.addColorStop(0.2, "rgba(255, 69, 0, 0.8)")
  gradient.addColorStop(0.4, "rgba(255, 69, 0, 0.6)")
  gradient.addColorStop(0.6, "rgba(255, 69, 0, 0.4)")
  gradient.addColorStop(0.8, "rgba(255, 69, 0, 0.2)")
  gradient.addColorStop(1, "rgba(255, 69, 0, 0)")

  context.strokeStyle = gradient
  context.lineWidth = ringWidth
  context.beginPath()
  context.arc(centerX, centerY, radius, 0, Math.PI * 2)
  context.stroke()

  texture.hasAlpha = true
  texture.update()

  // Material settings for glow effect
  material.diffuseTexture = texture
  material.emissiveColor = new Color3(1, 0.27, 0)
  material.specularColor = new Color3(0, 0, 0)
  material.useAlphaFromDiffuseTexture = true

  return material
}

const createTriangleMarker = (
  position: Vector3,
  rotation: number,
  diameter: number,
  direction: "right" | "left" | "up" | "down",
  moveDistance: number,
  scene: Scene
) => {
  const triangle = new Mesh("triangle", scene)
  const positions = [
    -0.75 * diameter,
    0,
    0, // vertex 1
    0.75 * diameter,
    0,
    0, // vertex 2
    0,
    diameter,
    0, // vertex 3
  ]
  const indices = [0, 1, 2]

  const vertexData = new VertexData()
  vertexData.positions = positions
  vertexData.indices = indices
  vertexData.applyToMesh(triangle, true)

  triangle.position = position.clone()
  triangle.rotation.x = Math.PI / 2
  triangle.rotation.y = rotation

  const triangleMaterial = new StandardMaterial("triangleMaterial", scene)
  triangleMaterial.diffuseColor = new Color3(0.35, 0.76, 0.83)
  triangleMaterial.emissiveColor = new Color3(0, 0.5, 0.5)
  triangle.material = triangleMaterial

  // Animation
  let lastTime = performance.now()
  const targetDelta = 1000 / 60 // 60fps in ms
  let accumulator = 0
  let time = 0

  const animate = (currentTime: number) => {
    const deltaTime = currentTime - lastTime
    accumulator += deltaTime

    // Update position only when enough time has accumulated
    while (accumulator >= targetDelta) {
      time += 0.03

      if (direction === "right") {
        triangle.position.x = position.x + Math.sin(time) * moveDistance
      } else if (direction === "left") {
        triangle.position.x = position.x - Math.sin(time) * moveDistance
      } else if (direction === "up") {
        triangle.position.z = position.z + Math.sin(time) * moveDistance
      } else if (direction === "down") {
        triangle.position.z = position.z - Math.sin(time) * moveDistance
      }

      accumulator -= targetDelta
    }

    lastTime = currentTime
    requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
}

ArcRotateCamera.prototype.spinTo = function (
  this: ArcRotateCamera,
  targetPosition: Vector3,
  targetTarget: Vector3 = new Vector3(0, 12, 0),
  duration: number = 1000
): void {
  const startPosition = this.position.clone()
  const startTarget = this.target.clone()
  const startTime = performance.now()

  const smoothStep = (x: number): number => {
    return x * x * (3 - 2 * x)
  }

  const animate = (currentTime: number) => {
    const elapsedTime = currentTime - startTime
    const progress = Math.min(elapsedTime / duration, 1)

    const easedProgress = smoothStep(progress)

    const newPosition = Vector3.Lerp(startPosition, targetPosition, easedProgress)
    const newTarget = Vector3.Lerp(startTarget, targetTarget, easedProgress)

    this.position = newPosition
    this.setTarget(newTarget)

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

export default BjsScene
