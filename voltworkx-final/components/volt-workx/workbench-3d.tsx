'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, SoftShadows, Text, useCursor } from '@react-three/drei';
import { EffectComposer, Bloom, Selection, Select } from '@react-three/postprocessing';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface PlacedComponent3D {
  id: string;
  type:
    | 'resistor'
    | 'led'
    | 'breadboard'
    | 'arduino-uno'
    | 'battery-9v'
    | 'capacitor'
    | 'npn-transistor'
    | 'switch';
  position: [number, number, number];
  selected: boolean;
  powered?: boolean;
  color?: string;
  capacitance?: string;
  isOn?: boolean;
  name?: string;
  value?: string;
  category?: string;
}

export interface Workbench3DProps {
  placedComponents: PlacedComponent3D[];
  onSelectComponent: (id: string | null) => void;
  onPlaceComponent: (type: string, position: [number, number, number]) => void;
  onCancelPlacement?: () => void;
  isPlacingComponent: string | null;
  isSimulating: boolean;
}

/* ------------------------------------------------------------------ */
/*  Hoverable wrapper – hover scale + cursor                           */
/* ------------------------------------------------------------------ */

function Hoverable({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  disabled?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  useCursor(hovered && !disabled);

  useFrame(() => {
    if (!groupRef.current) return;
    const t = hovered && !disabled ? 1.05 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(t, t, t), 0.15);
  });

  return (
    <group
      ref={groupRef}
      onPointerEnter={(e) => { e.stopPropagation(); if (!disabled) setHovered(true); }}
      onPointerLeave={(e) => { e.stopPropagation(); setHovered(false); }}
      onClick={(e) => { e.stopPropagation(); if (!disabled && onClick) onClick(e); }}
    >
      {children}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Resistor3D                                                          */
/* ------------------------------------------------------------------ */

function Resistor3D({
  position, selected, onClick, ghost,
}: {
  position: THREE.Vector3; selected?: boolean; onClick?: () => void; ghost?: boolean;
}) {
  const bodyColor = ghost ? '#00f0ff' : '#8B4513';
  const emissive  = selected && !ghost ? '#00f0ff' : '#000000';
  const ei        = selected && !ghost ? 0.3 : 0;
  const op        = ghost ? 0.5 : 1;
  const bands     = ['#ff6600', '#000000', '#ff0000', '#ffd700'];

  return (
    <Hoverable onClick={onClick} disabled={ghost}>
      <group position={position}>
        <mesh castShadow={!ghost}>
          <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
          <meshStandardMaterial color={bodyColor} roughness={0.6} metalness={0.2}
            emissive={emissive} emissiveIntensity={ei} transparent={ghost} opacity={op} />
        </mesh>
        {bands.map((c, i) => (
          <mesh key={i} castShadow={!ghost} position={[0, 0.25 - i * 0.2, 0]}>
            <cylinderGeometry args={[0.155, 0.155, 0.08, 16]} />
            <meshStandardMaterial color={ghost ? '#00f0ff' : c} roughness={0.4}
              transparent={ghost} opacity={op} />
          </mesh>
        ))}
        {/* left leg */}
        <mesh castShadow={!ghost} position={[-0.4, -0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
          <meshStandardMaterial color={ghost ? '#00f0ff' : '#c0c0c0'} metalness={0.9} roughness={0.3} transparent={ghost} opacity={op} />
        </mesh>
        {/* right leg */}
        <mesh castShadow={!ghost} position={[0.4, -0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
          <meshStandardMaterial color={ghost ? '#00f0ff' : '#c0c0c0'} metalness={0.9} roughness={0.3} transparent={ghost} opacity={op} />
        </mesh>
      </group>
    </Hoverable>
  );
}

/* ------------------------------------------------------------------ */
/*  LED3D                                                               */
/* ------------------------------------------------------------------ */

function LED3D({
  position, selected, onClick, ghost, color = '#ff0000', powered = false,
}: {
  position: THREE.Vector3; selected?: boolean; onClick?: () => void;
  ghost?: boolean; color?: string; powered?: boolean;
}) {
  const ac  = ghost ? '#00f0ff' : color;
  const em  = powered && !ghost ? ac : '#000000';
  const ei  = powered && !ghost ? 2.0 : 0;
  const op  = ghost ? 0.5 : 0.85;

  return (
    <Hoverable onClick={onClick} disabled={ghost}>
      <group position={position}>
        {/* base */}
        <mesh castShadow={!ghost} position={[0, -0.04, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
          <meshStandardMaterial color={ghost ? '#00f0ff' : '#808080'} metalness={0.8} roughness={0.4} />
        </mesh>
        {/* dome */}
        <mesh castShadow={!ghost} position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.13, 32, 16, 0, Math.PI]} />
          <meshStandardMaterial color={ac} emissive={em} emissiveIntensity={ei}
            transparent opacity={op} />
        </mesh>
        {/* anode */}
        <mesh castShadow={!ghost} position={[-0.05, -0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.6, 8]} />
          <meshStandardMaterial color={ghost ? '#00f0ff' : '#c0c0c0'} metalness={0.9} />
        </mesh>
        {/* cathode */}
        <mesh castShadow={!ghost} position={[0.05, -0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
          <meshStandardMaterial color={ghost ? '#00f0ff' : '#c0c0c0'} metalness={0.9} />
        </mesh>
        {powered && !ghost && (
          <pointLight position={[0, 0.12, 0]} color={ac} intensity={2} distance={3} />
        )}
      </group>
    </Hoverable>
  );
}

/* ------------------------------------------------------------------ */
/*  Breadboard3D                                                        */
/* ------------------------------------------------------------------ */

function Breadboard3D({
  position, selected, onClick, ghost,
}: {
  position: THREE.Vector3; selected?: boolean; onClick?: () => void; ghost?: boolean;
}) {
  const mc  = ghost ? '#00f0ff' : '#f5f0e0';
  const hc  = ghost ? '#00f0ff' : '#1a1a1a';
  const op  = ghost ? 0.5 : 1;
  const cols = 30;
  const sp  = 0.2;
  const sx  = -((cols - 1) * sp) / 2;
  const topZ    = [-1.55, -1.35, -1.15, -0.95, -0.75];
  const bottomZ = [0.75, 0.95, 1.15, 1.35, 1.55];

  return (
    <Hoverable onClick={onClick} disabled={ghost}>
      <group position={position}>
        {/* body */}
        <mesh castShadow={!ghost} receiveShadow position={[0, 0.1, 0]}>
          <boxGeometry args={[5, 0.2, 3.5]} />
          <meshStandardMaterial color={mc} roughness={0.9} transparent={ghost} opacity={op} />
        </mesh>
        {/* power rails */}
        <mesh castShadow={!ghost} position={[0, 0.21, -1.65]}>
          <boxGeometry args={[4.8, 0.01, 0.18]} />
          <meshStandardMaterial color={ghost ? '#00f0ff' : '#ff0000'} transparent={ghost} opacity={op} />
        </mesh>
        <mesh castShadow={!ghost} position={[0, 0.21, 1.65]}>
          <boxGeometry args={[4.8, 0.01, 0.18]} />
          <meshStandardMaterial color={ghost ? '#00f0ff' : '#0044ff'} transparent={ghost} opacity={op} />
        </mesh>
        {/* center channel */}
        <mesh castShadow={!ghost} position={[0, 0.21, 0]}>
          <boxGeometry args={[4.8, 0.22, 0.15]} />
          <meshStandardMaterial color={ghost ? '#00f0ff' : '#000000'} transparent={ghost} opacity={op} />
        </mesh>
        {/* holes top */}
        {topZ.map((z, ri) =>
          Array.from({ length: cols }).map((_, ci) => (
            <mesh key={`t${ri}-${ci}`} position={[sx + ci * sp, 0.21, z]}>
              <cylinderGeometry args={[0.04, 0.04, 0.21, 8]} />
              <meshStandardMaterial color={hc} roughness={0.8} transparent={ghost} opacity={op} />
            </mesh>
          ))
        )}
        {/* holes bottom */}
        {bottomZ.map((z, ri) =>
          Array.from({ length: cols }).map((_, ci) => (
            <mesh key={`b${ri}-${ci}`} position={[sx + ci * sp, 0.21, z]}>
              <cylinderGeometry args={[0.04, 0.04, 0.21, 8]} />
              <meshStandardMaterial color={hc} roughness={0.8} transparent={ghost} opacity={op} />
            </mesh>
          ))
        )}
        {/* number labels */}
        {Array.from({ length: cols }).map((_, i) => (
          <Text key={`n${i}`} position={[sx + i * sp, 0.35, -1.85]} fontSize={0.08}
            color={ghost ? '#00f0ff' : '#888888'} anchorX="center" anchorY="middle">
            {i + 1}
          </Text>
        ))}
        {/* row labels */}
        {['A','B','C','D','E'].map((l, i) => (
          <Text key={`L${l}`} position={[-2.65, 0.35, topZ[i]]} fontSize={0.08}
            color={ghost ? '#00f0ff' : '#888888'} anchorX="center" anchorY="middle">
            {l}
          </Text>
        ))}
        {['F','G','H','I','J'].map((l, i) => (
          <Text key={`R${l}`} position={[2.65, 0.35, bottomZ[i]]} fontSize={0.08}
            color={ghost ? '#00f0ff' : '#888888'} anchorX="center" anchorY="middle">
            {l}
          </Text>
        ))}
      </group>
    </Hoverable>
  );
}

/* ------------------------------------------------------------------ */
/*  ArduinoUno3D                                                        */
/* ------------------------------------------------------------------ */

function ArduinoUno3D({
  position, selected, onClick, ghost,
}: {
  position: THREE.Vector3; selected?: boolean; onClick?: () => void; ghost?: boolean;
}) {
  const bc  = ghost ? '#00f0ff' : '#006644';
  const op  = ghost ? 0.5 : 1;

  return (
    <Hoverable onClick={onClick} disabled={ghost}>
      <group position={position}>
        {/* PCB */}
        <mesh castShadow={!ghost} receiveShadow position={[0, 0.05, 0]}>
          <boxGeometry args={[4.2, 0.1, 5.5]} />
          <meshStandardMaterial color={bc} roughness={0.7} transparent={ghost} opacity={op} />
        </mesh>
        {/* USB */}
        <mesh castShadow={!ghost} position={[0, 0.25, -2.5]}>
          <boxGeometry args={[0.5, 0.35, 0.45]} />
          <meshStandardMaterial color={ghost ? '#00f0ff' : '#808080'} metalness={0.9} roughness={0.3} />
        </mesh>
        {/* Crystal */}
        <mesh castShadow={!ghost} position={[1.2, 0.17, 1.2]}>
          <boxGeometry args={[0.15, 0.2, 0.45]} />
          <meshStandardMaterial color={ghost ? '#00f0ff' : '#c0c0c0'} metalness={0.9} roughness={0.2} />
        </mesh>
        {/* ATmega chip */}
        <mesh castShadow={!ghost} position={[0, 0.16, 0.3]}>
          <boxGeometry args={[0.8, 0.12, 0.8]} />
          <meshStandardMaterial color={ghost ? '#00f0ff' : '#1a1a1a'} roughness={0.6} />
        </mesh>
        {/* Digital pins */}
        {Array.from({ length: 14 }).map((_, i) => (
          <mesh key={`dp${i}`} castShadow={!ghost} position={[-1.9 + i * 0.2, 0.22, 2.45]}>
            <boxGeometry args={[0.1, 0.25, 0.1]} />
            <meshStandardMaterial color={ghost ? '#00f0ff' : '#1a1a1a'} roughness={0.6} />
          </mesh>
        ))}
        {/* Analog pins */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={`ap${i}`} castShadow={!ghost} position={[2.05, 0.22, 1.5 - i * 0.3]}>
            <boxGeometry args={[0.1, 0.25, 0.1]} />
            <meshStandardMaterial color={ghost ? '#00f0ff' : '#1a1a1a'} roughness={0.6} />
          </mesh>
        ))}
        {/* Built-in LED */}
        <mesh castShadow={!ghost} position={[-1.7, 0.22, 2.45]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={ghost ? '#00f0ff' : '#ff6600'}
            emissive={ghost ? '#00f0ff' : '#ff6600'} emissiveIntensity={ghost ? 0.5 : 0.2} />
        </mesh>
        <Text position={[0, 0.25, -0.5]} fontSize={0.4} color={ghost ? '#00f0ff' : '#ffffff'}
          anchorX="center" anchorY="middle" rotation={[-Math.PI / 2, 0, 0]}>
          Arduino
        </Text>
      </group>
    </Hoverable>
  );
}

/* ------------------------------------------------------------------ */
/*  Battery9V                                                           */
/* ------------------------------------------------------------------ */

function Battery9V({
  position, selected, onClick, ghost,
}: {
  position: THREE.Vector3; selected?: boolean; onClick?: () => void; ghost?: boolean;
}) {
  const mc = ghost ? '#00f0ff' : '#1a1a1a';
  const op = ghost ? 0.5 : 1;

  return (
    <Hoverable onClick={onClick} disabled={ghost}>
      <group position={position}>
        <mesh castShadow={!ghost} position={[0, 0.9, 0]}>
          <boxGeometry args={[1.2, 1.8, 0.6]} />
          <meshStandardMaterial color={mc} roughness={0.6} transparent={ghost} opacity={op} />
        </mesh>
        <Text position={[0, 0.9, 0.31]} fontSize={0.4} color={ghost ? '#00f0ff' : '#ffffff'}
          anchorX="center" anchorY="middle">9V</Text>
        {/* + terminal */}
        <mesh castShadow={!ghost} position={[-0.35, 1.82, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.15, 16]} />
          <meshStandardMaterial color={ghost ? '#00f0ff' : '#ff3333'} roughness={0.4} />
        </mesh>
        {/* - terminal */}
        <mesh castShadow={!ghost} position={[0.35, 1.82, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.12, 16]} />
          <meshStandardMaterial color={ghost ? '#00f0ff' : '#333333'} roughness={0.4} />
        </mesh>
        {/* sticker */}
        <mesh castShadow={!ghost} position={[0, 0.5, 0.31]}>
          <boxGeometry args={[1.0, 0.8, 0.01]} />
          <meshStandardMaterial color={ghost ? '#00f0ff' : '#333399'} roughness={0.5} />
        </mesh>
      </group>
    </Hoverable>
  );
}

/* ------------------------------------------------------------------ */
/*  Capacitor3D                                                         */
/* ------------------------------------------------------------------ */

function Capacitor3D({
  position, selected, onClick, ghost,
}: {
  position: THREE.Vector3; selected?: boolean; onClick?: () => void; ghost?: boolean;
}) {
  const mc = ghost ? '#00f0ff' : '#1a1a1a';
  const op = ghost ? 0.5 : 1;

  return (
    <Hoverable onClick={onClick} disabled={ghost}>
      <group position={position}>
        <mesh castShadow={!ghost} position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.7, 24]} />
          <meshStandardMaterial color={mc} roughness={0.6} transparent={ghost} opacity={op} />
        </mesh>
        <mesh castShadow={!ghost} position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.05, 24]} />
          <meshStandardMaterial color={ghost ? '#00f0ff' : '#404040'} roughness={0.3} />
        </mesh>
        {/* silver stripe */}
        <mesh castShadow={!ghost} position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.205, 0.205, 0.3, 24]} />
          <meshStandardMaterial color={ghost ? '#00f0ff' : '#c8c8c8'} roughness={0.3} metalness={0.7} />
        </mesh>
        {/* legs */}
        <mesh castShadow={!ghost} position={[-0.1, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
          <meshStandardMaterial color={ghost ? '#00f0ff' : '#c0c0c0'} metalness={0.9} />
        </mesh>
        <mesh castShadow={!ghost} position={[0.1, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
          <meshStandardMaterial color={ghost ? '#00f0ff' : '#c0c0c0'} metalness={0.9} />
        </mesh>
      </group>
    </Hoverable>
  );
}

/* ------------------------------------------------------------------ */
/*  NpnTransistor3D                                                     */
/* ------------------------------------------------------------------ */

function NpnTransistor3D({
  position, selected, onClick, ghost,
}: {
  position: THREE.Vector3; selected?: boolean; onClick?: () => void; ghost?: boolean;
}) {
  const bc = ghost ? '#00f0ff' : '#1a1a1a';
  const op = ghost ? 0.5 : 1;

  return (
    <Hoverable onClick={onClick} disabled={ghost}>
      <group position={position}>
        <mesh castShadow={!ghost} position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.4, 16, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color={bc} roughness={0.6} transparent={ghost} opacity={op} />
        </mesh>
        <mesh castShadow={!ghost} position={[0.09, 0.2, 0]}>
          <boxGeometry args={[0.18, 0.4, 0.02]} />
          <meshStandardMaterial color={bc} roughness={0.6} />
        </mesh>
        <Text position={[0.1, 0.2, 0.02]} fontSize={0.06} color={ghost ? '#00f0ff' : '#ffffff'}
          anchorX="center" anchorY="middle">2N2222</Text>
        {[-0.1, 0, 0.1].map((x) => (
          <mesh key={x} castShadow={!ghost} position={[x, -0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, 0.5, 8]} />
            <meshStandardMaterial color={ghost ? '#00f0ff' : '#c0c0c0'} metalness={0.9} />
          </mesh>
        ))}
      </group>
    </Hoverable>
  );
}

/* ------------------------------------------------------------------ */
/*  Switch3D                                                            */
/* ------------------------------------------------------------------ */

function Switch3D({
  position, selected, onClick, ghost, isOn = false,
}: {
  position: THREE.Vector3; selected?: boolean; onClick?: () => void; ghost?: boolean; isOn?: boolean;
}) {
  const actuatorRef = useRef<THREE.Group>(null);
  const targetX = isOn ? 0.25 : -0.25;
  const currentX = useRef(targetX);
  const bc = ghost ? '#00f0ff' : '#1a1a1a';
  const ac = isOn && !ghost ? '#00f0ff' : '#333333';
  const ae = isOn && !ghost ? '#00f0ff' : '#000000';
  const op = ghost ? 0.5 : 1;

  useFrame((_, dt) => {
    if (!actuatorRef.current) return;
    currentX.current = THREE.MathUtils.lerp(currentX.current, targetX, Math.min(1, dt * 10));
    actuatorRef.current.position.x = currentX.current;
  });

  return (
    <Hoverable onClick={onClick} disabled={ghost}>
      <group position={position}>
        <mesh castShadow={!ghost} position={[0, 0.075, 0]}>
          <boxGeometry args={[0.8, 0.15, 0.4]} />
          <meshStandardMaterial color={bc} roughness={0.6} transparent={ghost} opacity={op} />
        </mesh>
        <group ref={actuatorRef} position={[-0.25, 0.2, 0]}>
          <mesh castShadow={!ghost}>
            <boxGeometry args={[0.3, 0.25, 0.35]} />
            <meshStandardMaterial color={ghost ? '#00f0ff' : ac} roughness={0.4}
              emissive={ghost ? '#00f0ff' : ae} emissiveIntensity={0.4}
              transparent={ghost} opacity={op} />
          </mesh>
        </group>
        {[-0.3, -0.1, 0.1, 0.3].map((x) => (
          <mesh key={x} castShadow={!ghost} position={[x, -0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
            <meshStandardMaterial color={ghost ? '#00f0ff' : '#c0c0c0'} metalness={0.9} />
          </mesh>
        ))}
      </group>
    </Hoverable>
  );
}

/* ------------------------------------------------------------------ */
/*  Scene                                                               */
/* ------------------------------------------------------------------ */

function WorkbenchScene(props: Workbench3DProps) {
  const {
    placedComponents, onSelectComponent, onPlaceComponent,
    onCancelPlacement, isPlacingComponent, isSimulating,
  } = props;

  const [ghostPos, setGhostPos] = useState<THREE.Vector3 | null>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPlacingComponent) onCancelPlacement?.();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isPlacingComponent, onCancelPlacement]);

  const handleMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!isPlacingComponent) return;
    e.stopPropagation();
    setGhostPos(e.point.clone());
  }, [isPlacingComponent]);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    if (!isPlacingComponent || !ghostPos) return;
    e.stopPropagation();
    onPlaceComponent(isPlacingComponent, [ghostPos.x, ghostPos.y, ghostPos.z]);
    setGhostPos(null);
  }, [isPlacingComponent, ghostPos, onPlaceComponent]);

  const renderComp = (
    c: PlacedComponent3D,
    ghost = false,
    overridePos?: THREE.Vector3,
  ) => {
    const pos = overridePos ?? new THREE.Vector3(...c.position);
    const common = {
      position: pos,
      selected: !ghost && c.selected,
      onClick: ghost ? undefined : () => onSelectComponent(c.id),
      ghost,
    };
    switch (c.type) {
      case 'resistor':       return <Resistor3D     key={c.id} {...common} />;
      case 'led':            return <LED3D           key={c.id} {...common} color={c.color} powered={isSimulating && c.powered} />;
      case 'breadboard':     return <Breadboard3D    key={c.id} {...common} />;
      case 'arduino-uno':    return <ArduinoUno3D    key={c.id} {...common} />;
      case 'battery-9v':     return <Battery9V       key={c.id} {...common} />;
      case 'capacitor':      return <Capacitor3D     key={c.id} {...common} />;
      case 'npn-transistor': return <NpnTransistor3D key={c.id} {...common} />;
      case 'switch':         return <Switch3D        key={c.id} {...common} isOn={isSimulating && c.isOn} />;
      default:               return null;
    }
  };

  return (
    <>
      <OrbitControls makeDefault target={[0, 0, 0]} minDistance={5} maxDistance={40}
        maxPolarAngle={Math.PI / 2} enableDamping />

      <ambientLight intensity={0.5} color="#000820" />
      <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-camera-left={-15} shadow-camera-right={15}
        shadow-camera-top={15} shadow-camera-bottom={-15} />
      <pointLight position={[0, 8, 0]}   intensity={0.3} color="#00f0ff" />
      <pointLight position={[-5, 3, 5]}  intensity={0.1} color="#ff9500" />
      <SoftShadows size={25} samples={16} />
      <fog attach="fog" args={['#000000', 30, 60]} />

      {/* Workbench */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.8} metalness={0.1} />
      </mesh>
      <gridHelper args={[30, 60, '#00f0ff', '#001f22']} position={[0, 0.001, 0]} />

      {/* Invisible placement plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}
        visible={false}
        onPointerMove={handleMove as any}
        onClick={handleClick}>
        <planeGeometry args={[30, 20]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Components */}
      <Selection>
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.3} intensity={1.5} luminanceSmoothing={0.9} />
        </EffectComposer>
        {placedComponents.map((c) => (
          <Select key={c.id} enabled={c.selected && !isPlacingComponent}>
            {renderComp(c)}
          </Select>
        ))}
      </Selection>

      {/* Ghost while placing */}
      {isPlacingComponent && ghostPos && renderComp(
        { id: 'ghost', type: isPlacingComponent as PlacedComponent3D['type'],
          position: [0, 0, 0], selected: false },
        true, ghostPos,
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Exported component                                                  */
/* ------------------------------------------------------------------ */

export default function Workbench3D(props: Workbench3DProps) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}
        camera={{ fov: 50, position: [0, 12, 18] }}>
        <WorkbenchScene {...props} />
      </Canvas>
    </div>
  );
}
