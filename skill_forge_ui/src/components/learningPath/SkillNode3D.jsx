import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const SkillNode3D = ({ position, color, isSelected, isHovered, mastery, onClick }) => {
  const meshRef = useRef()
  const ringRef = useRef()
  const glowRef = useRef()

  // Create pulsing animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01
      meshRef.current.rotation.y += 0.01

      // Pulsing scale for selected/hovered
      if (isSelected || isHovered) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1
        meshRef.current.scale.setScalar(scale)
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1)
      }
    }

    // Rotate progress ring
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.005
    }

    // Pulse glow
    if (glowRef.current && (isSelected || isHovered)) {
      const opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2
      glowRef.current.material.opacity = opacity
    }
  })

  // Progress ring geometry
  const ringGeometry = useMemo(() => {
    const geometry = new THREE.RingGeometry(0.6, 0.7, 32)
    const angle = (mastery / 100) * Math.PI * 2
    
    // Create partial ring based on mastery
    const positions = geometry.attributes.position
    for (let i = 0; i < positions.count; i++) {
      const vertex = new THREE.Vector3().fromBufferAttribute(positions, i)
      const vertexAngle = Math.atan2(vertex.y, vertex.x) + Math.PI
      if (vertexAngle > angle) {
        positions.setXYZ(i, 0, 0, 0)
      }
    }
    return geometry
  }, [mastery])

  return (
    <group position={position} onClick={onClick}>
      {/* Glow effect */}
      {(isSelected || isHovered) && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
      )}

      {/* Main sphere */}
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected || isHovered ? 0.5 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Progress ring */}
      {mastery > 0 && (
        <mesh ref={ringRef} rotation={[0, 0, -Math.PI / 2]}>
          <primitive object={ringGeometry} />
          <meshBasicMaterial color={color} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Particles for mastered skills */}
      {mastery >= 80 && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={50}
              array={new Float32Array(
                Array.from({ length: 50 }, () => [
                  (Math.random() - 0.5) * 2,
                  (Math.random() - 0.5) * 2,
                  (Math.random() - 0.5) * 2
                ]).flat()
              )}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={0.05} color={color} transparent opacity={0.6} />
        </points>
      )}
    </group>
  )
}

export default SkillNode3D
