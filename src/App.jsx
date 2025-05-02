import { useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Physics, usePlane, useBox, useSphere } from '@react-three/cannon'
import './App.css'

// Floor component with physics
function Floor(props) {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], ...props }))
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#f0f0f0" />
    </mesh>
  )
}

// Draggable cube component
function DraggableCube({ position, color = 'hotpink' }) {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    args: [1, 1, 1],
  }))

  // State to track if the object is being dragged
  const [isDragging, setIsDragging] = useState(false)

  // Handle drag start
  const handlePointerDown = (e) => {
    e.stopPropagation()
    setIsDragging(true)
    // Disable gravity while dragging
    api.mass.set(0)
  }

  // Handle drag movement
  const handlePointerMove = (e) => {
    if (isDragging && e.intersections.length) {
      const { point } = e.intersections[0]
      api.position.set(point.x, point.y, point.z)
    }
  }

  // Handle drag end
  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false)
      // Re-enable gravity
      api.mass.set(1)
    }
  }

  return (
    <mesh
      ref={ref}
      castShadow
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

// Draggable sphere component
function DraggableSphere({ position, color = 'royalblue' }) {
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position,
    args: [0.5],
  }))

  // State to track if the object is being dragged
  const [isDragging, setIsDragging] = useState(false)

  // Handle drag start
  const handlePointerDown = (e) => {
    e.stopPropagation()
    setIsDragging(true)
    // Disable gravity while dragging
    api.mass.set(0)
  }

  // Handle drag movement
  const handlePointerMove = (e) => {
    if (isDragging && e.intersections.length) {
      const { point } = e.intersections[0]
      api.position.set(point.x, point.y, point.z)
    }
  }

  // Handle drag end
  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false)
      // Re-enable gravity
      api.mass.set(1)
    }
  }

  return (
    <mesh
      ref={ref}
      castShadow
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

// Generate random position within bounds
function getRandomPosition() {
  return [
    (Math.random() - 0.5) * 6, // x: -3 to 3
    Math.random() * 5 + 3,     // y: 3 to 8 (start higher up)
    (Math.random() - 0.5) * 6  // z: -3 to 3
  ]
}

// Generate random color
function getRandomColor() {
  const colors = [
    'hotpink', 'orange', 'royalblue', 'limegreen',
    'yellow', 'purple', 'teal', 'coral'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Main scene component
function Scene({ cubes, spheres, gravity }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 10, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <Physics gravity={gravity}>
        <Floor position={[0, -1, 0]} />

        {/* Render all cubes */}
        {cubes.map((cube, index) => (
          <DraggableCube
            key={`cube-${index}`}
            position={cube.position}
            color={cube.color}
          />
        ))}

        {/* Render all spheres */}
        {spheres.map((sphere, index) => (
          <DraggableSphere
            key={`sphere-${index}`}
            position={sphere.position}
            color={sphere.color}
          />
        ))}
      </Physics>

      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
    </>
  )
}

// UI Controls component
function Controls({
  onAddCube,
  onAddSphere,
  onReset,
  cubeCount,
  sphereCount,
  gravity,
  onGravityChange
}) {
  return (
    <div className="controls">
      <h2>React Three Fiber Physics Simulation</h2>
      <p>Drag objects with your mouse to move them around</p>

      <div className="stats">
        <div>Cubes: {cubeCount}</div>
        <div>Spheres: {sphereCount}</div>
        <div>Total: {cubeCount + sphereCount}</div>
      </div>

      <div className="gravity-control">
        <label>
          Gravity:
          <select
            value={gravity[1]}
            onChange={(e) => onGravityChange([0, parseFloat(e.target.value), 0])}
          >
            <option value="-9.81">Earth (9.81 m/s²)</option>
            <option value="-1.62">Moon (1.62 m/s²)</option>
            <option value="-3.71">Mars (3.71 m/s²)</option>
            <option value="-24.79">Jupiter (24.79 m/s²)</option>
            <option value="0">Zero Gravity</option>
            <option value="9.81">Reverse Gravity</option>
          </select>
        </label>
      </div>

      <div className="buttons">
        <button onClick={onAddCube}>Add Cube</button>
        <button onClick={onAddSphere}>Add Sphere</button>
        <button onClick={onReset} style={{ backgroundColor: '#e74c3c' }}>Reset</button>
      </div>
    </div>
  )
}

function App() {
  // State to track all cubes and spheres
  const [cubes, setCubes] = useState([
    { position: [0, 3, 0], color: 'hotpink' },
    { position: [2, 5, -1], color: 'orange' }
  ])

  const [spheres, setSpheres] = useState([
    { position: [-2, 4, 0], color: 'royalblue' },
    { position: [1, 6, 1], color: 'limegreen' }
  ])

  // State for gravity (default: Earth gravity)
  const [gravity, setGravity] = useState([0, -9.81, 0])

  // Add a new cube with random position and color
  const handleAddCube = () => {
    setCubes([
      ...cubes,
      { position: getRandomPosition(), color: getRandomColor() }
    ])
  }

  // Add a new sphere with random position and color
  const handleAddSphere = () => {
    setSpheres([
      ...spheres,
      { position: getRandomPosition(), color: getRandomColor() }
    ])
  }

  // Reset the simulation to initial state
  const handleReset = () => {
    setCubes([
      { position: [0, 3, 0], color: 'hotpink' },
      { position: [2, 5, -1], color: 'orange' }
    ])

    setSpheres([
      { position: [-2, 4, 0], color: 'royalblue' },
      { position: [1, 6, 1], color: 'limegreen' }
    ])

    // Reset gravity to Earth's gravity
    setGravity([0, -9.81, 0])
  }

  // Handle gravity change
  const handleGravityChange = (newGravity) => {
    setGravity(newGravity)
  }

  return (
    <div className="app-container">
      <Controls
        onAddCube={handleAddCube}
        onAddSphere={handleAddSphere}
        onReset={handleReset}
        cubeCount={cubes.length}
        sphereCount={spheres.length}
        gravity={gravity}
        onGravityChange={handleGravityChange}
      />
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 50 }}
        style={{ height: '100vh' }}
      >
        <Scene cubes={cubes} spheres={spheres} gravity={gravity} />
      </Canvas>
    </div>
  )
}

export default App
