import { Modal } from 'react-bootstrap';
import { Canvas } from '@react-three/fiber';
import { useLoader } from '@react-three/fiber';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OrbitControls } from '@react-three/drei';
import { useEffect, Suspense, useState} from 'react';
import { Spinner } from 'react-bootstrap';

function STLModel({ url, onLoaded }: { url: string; onLoaded: () => void }) {
  const geometry = useLoader(STLLoader, url, (loader) => {
    loader.manager.onLoad = () => onLoaded();
  });

  return (
    <mesh geometry={geometry} scale={0.01}>
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

export default function ModelViewerModal({ show, onHide, modelUrl }: { show: boolean, onHide: () => void, modelUrl: string }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
  }, [modelUrl]);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Visualisation du modèle 3D</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ height: '500px' }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '4rem' }}>
            <Spinner animation="border" variant="dark" />
          </div>
        )}
        {modelUrl && (
          <Canvas camera={{ position: [0, 0, 3] }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[0, 0, 5]} />
            <OrbitControls enableZoom={true} />
            <Suspense fallback={null}>
              <STLModel url={modelUrl} onLoaded={() => setLoading(false)} />
            </Suspense>
          </Canvas>
        )}
      </Modal.Body>
    </Modal>
  );
}

