import {
  ArcRotateCamera,
  Color3,
  Vector3,
  Engine,
  Scene,
  Color4,
  DirectionalLight,
  HemisphericLight,
  ShadowGenerator,
  ActionManager,
  ExecuteCodeAction,
  Mesh,
} from "@babylonjs/core"
import { useEffect, useRef } from "react"
import { createRadarGround, createTacticalGround, createHexagon, createFlyingLine } from "./sceneHelper"

import "@babylonjs/core/Meshes/Builders/polygonBuilder"

import { UnitTypes } from "./index.d.tsx"

import earcut from "earcut"
import { NodeState } from "phaseblade"
window.earcut = earcut

function BjsScene({
  nodes,
  selectedNode,
  setSelectedNode,
}: {
  nodes: NodeState[]
  selectedNode: number | null
  setSelectedNode: (node: number | null) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bjsEngineRef = useRef<Engine | null>(null)
  const sceneRef = useRef<Scene | null>(null)
  const cameraRef = useRef<ArcRotateCamera | null>(null)
  const shadowGeneratorRef = useRef<ShadowGenerator | null>(null)
  const selectedNodeRef = useRef<number | null>(null)
  const nodesRef = useRef<{ [id: number]: Mesh }>({})

  useEffect(() => {
    selectedNodeRef.current = selectedNode
  }, [selectedNode])

  useEffect(() => {
    if (!canvasRef.current || bjsEngineRef.current) return
    const engine = new Engine(canvasRef.current, true, {}, true)
    bjsEngineRef.current = engine
    const scene = new Scene(engine)
    sceneRef.current = scene
    scene.clearColor = new Color4(0, 0, 0, 0)

    const camera = new ArcRotateCamera("ArcRotateCamera", 0, 0, 45, new Vector3(0, 0, 0), scene)
    cameraRef.current = camera
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

    createRadarGround(31, scene)
    createTacticalGround(28, 9, 12, scene)

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
  }, [setSelectedNode])

  useEffect(() => {
    if (nodes && sceneRef.current && cameraRef.current) {
      const scene = sceneRef.current
      const camera = cameraRef.current

      nodes.forEach((node) => {
        if (nodesRef.current[node.id]) {
          return
        }
        const unit = UnitTypes[node.unit_type]
        const nodeMesh = createHexagon(`${unit.type}-${node.id}`, scene, {
          svg: unit.icon,
          position: new Vector3(node.position[0], node.position[1], node.position[2]),
          diameter: 2,
        })
        nodesRef.current[node.id] = nodeMesh

        shadowGeneratorRef.current?.addShadowCaster(nodeMesh)

        nodeMesh.actionManager = new ActionManager(scene)
        nodeMesh.actionManager.registerAction(
          new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
            if (selectedNodeRef.current === node.id) {
              nodeMesh.hideSelection()
              return
            }

            scene.meshes.forEach((mesh) => {
              if (mesh.hideSelection && mesh !== nodeMesh) {
                mesh.hideSelection()
              }
            })
            nodeMesh.showSelection()

            if (selectedNodeRef.current !== node.id) {
              camera.spinTo(nodeMesh.position.clone().add(new Vector3(0, 24, -12)), nodeMesh.position.clone(), 500)
              setSelectedNode(node.id)
            }
          })
        )

        if (Math.random() < 0.2) {
          nodeMesh.showSignalRipple()
        }

        let time = 0
        let randomOffset = {
          x: Math.random() * 0.2 - 0.1,
          z: Math.random() * 0.2 - 0.1,
        }

        if (Object.keys(nodesRef.current).length > 1 && Math.random() < 0.7) {
          const nodeIds = Object.keys(nodesRef.current)
          const randomNode = nodesRef.current[nodeIds[Math.floor(Math.random() * nodeIds.length)] as unknown as number]
          if (randomNode && randomNode !== nodeMesh) {
            createFlyingLine(nodeMesh.position, randomNode.position, {
              height: 5,
              scene,
            })
          }
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
              const newX = nodeMesh.position.x + (Math.sin(time * 1.1) / 2) * randomOffset.x
              const newZ = nodeMesh.position.z + (Math.sin(time * 1.2) / 2) * randomOffset.z

              // Check boundaries
              const maxRadius = 25
              const distanceFromCenter = Math.sqrt(newX * newX + newZ * newZ)

              if (distanceFromCenter < maxRadius) {
                nodeMesh.position.x = newX
                nodeMesh.position.z = newZ
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
      })
    }
  }, [nodes, setSelectedNode])

  return <canvas ref={canvasRef} className="scene"></canvas>
}

export default BjsScene

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

declare module "@babylonjs/core/Meshes/mesh" {
  interface Mesh {
    showSelection(): void
    hideSelection(): void
    toggleSelection(): void
    showSignalRipple(): void
    hideSignalRipple(): void
    toggleSignalRipple(): void
  }
}

declare module "@babylonjs/core/Meshes/abstractMesh" {
  interface AbstractMesh {
    showSelection(): void
    hideSelection(): void
    toggleSelection(): void
    showSignalRipple(): void
    hideSignalRipple(): void
    toggleSignalRipple(): void
  }
}

declare module "@babylonjs/core/Cameras/arcRotateCamera" {
  interface ArcRotateCamera {
    spinTo(targetPosition: Vector3, targetTarget?: Vector3, duration?: number): void
  }
}
