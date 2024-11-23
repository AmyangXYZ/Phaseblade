export interface Unit {
  type: string
  label: string
  icon: string
  isStatic: boolean
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
