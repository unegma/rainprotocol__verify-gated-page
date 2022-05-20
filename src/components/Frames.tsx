import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {useRoute, useLocation} from 'wouter';
import {useFrame} from '@react-three/fiber'
import Frame from "./Frame";
const GOLDENRATIO = 1.61803398875;

export default function Frames({images, q = new THREE.Quaternion(), p = new THREE.Vector3(), setModalOpen, setSelectedImage}: any) {
  const ref = useRef<any>();
  const clicked = useRef<any>();
  const [, params] = useRoute('/item/:id');
  const [, setLocation] = useLocation();

  useEffect(() => {
    clicked.current = ref.current.getObjectByName(params?.id)
    if (clicked.current) {
      clicked.current.parent.updateWorldMatrix(true, true)
      clicked.current.parent.localToWorld(p.set(0, GOLDENRATIO / 2, 1.25))
      clicked.current.parent.getWorldQuaternion(q)
    } else {
      p.set(0, 0, 5.5)
      q.identity()
    }
  })
  useFrame((state, dt) => {
    state.camera.position.lerp(p, 0.025)
    state.camera.quaternion.slerp(q, 0.025)
  })
  return (
    <group
      ref={ref}
      onClick={(e) => (e.stopPropagation(), setLocation(clicked.current === e.object ? '/' : '/item/' + e.object.name))}
      onPointerMissed={() => setLocation('/')}>
      {images.map((props: any) =>
        <Frame key={props.url}
           setModalOpen={setModalOpen}
           setSelectedImage={setSelectedImage}
           {...props}
        /> /* prettier-ignore */)}
    </group>
  )
}
