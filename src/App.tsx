import React from 'react';
import './App.css';
import {Canvas} from '@react-three/fiber'
import {MeshReflectorMaterial, Environment} from '@react-three/drei';
import Frames from './components/Frames';

function App({images}: any) {
  return (
    <Canvas gl={{alpha: false}} dpr={[1, 1.5]} camera={{fov: 70, position: [0, 2, 15]}}>
      <color attach="background" args={['#191920']}/>
      <fog attach="fog" args={['#191920', 0, 15]}/>
      <Environment preset="city"/>
      <group position={[0, -0.5, 0]}>
        <Frames images={images}/>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[50, 50]}/>
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={2048}
            mixBlur={1}
            mixStrength={40}
            roughness={1}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#101010"
            metalness={0.5}
            mirror={1}
          />
        </mesh>
      </group>
    </Canvas>
  );
}

export default App;
