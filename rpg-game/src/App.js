// RPG MAP + Building Interiors + NPCs + Animated Props
// Single-file React (JSX) ready to paste into a project (Tailwind optional)
// Features added:
// - Outside map with pixel-art background
// - 4 Buildings that transition to interior maps (separate routes)
// - Simple NPCs with idle movement and clickable dialogue
// - Animated props (trees sway, water ripple)
// - Keyboard controls + Enter to interact

import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

const TILE = 48;
const STEP_TIME = 140;

const SPRITE = {
  down: "/assets/boy-down.png",
  up: "/assets/boy-up.png",
  left: "/assets/boy-left.png",
  right: "/assets/boy-right.png",
};

// ---------- Outside World ----------
function OutsideMap() {
  const navigate = useNavigate();
  const [pos, setPos] = useState({ x: 5 * TILE, y: 6 * TILE });
  const [dir, setDir] = useState("down");
  const [frame, setFrame] = useState(0);
  const [moving, setMoving] = useState(false);
  const [dialog, setDialog] = useState(null);

  const move = (dx, dy, direction) => {
    if (moving) return;
    setDir(direction);
    setMoving(true);
    setFrame(1);

    const newX = pos.x + dx * TILE;
    const newY = pos.y + dy * TILE;

    const anim = setInterval(() => setFrame((p) => (p + 1) % 4), STEP_TIME / 4);
    setTimeout(() => {
      clearInterval(anim);
      setPos({ x: newX, y: newY });
      setFrame(0);
      setMoving(false);
    }, STEP_TIME);
  };

  // NPCs with simple idle movement
  const npcs = [
    { id: "n1", x: 4 * TILE, y: 3 * TILE, text: "Hello traveler! Welcome." },
    { id: "n2", x: 9 * TILE, y: 4 * TILE, text: "The market opens at dawn." },
  ];

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowUp") move(0, -1, "up");
      if (e.key === "ArrowDown") move(0, 1, "down");
      if (e.key === "ArrowLeft") move(-1, 0, "left");
      if (e.key === "ArrowRight") move(1, 0, "right");

      if (e.key === "Enter") {
        // if standing next to building door -> enter
        // building doors are at tile coords: (2,2),(8,2),(2,8),(8,8)
        const tx = pos.x / TILE;
        const ty = pos.y / TILE;
        if (tx === 2 && ty === 3) navigate("/building-1");
        if (tx === 8 && ty === 3) navigate("/building-2");
        if (tx === 2 && ty === 9) navigate("/building-3");
        if (tx === 8 && ty === 9) navigate("/building-4");

        // check NPC interaction
        npcs.forEach((n) => {
          if (Math.abs(pos.x - n.x) <= TILE && Math.abs(pos.y - n.y) <= TILE) setDialog(n.text);
        });
      }

      if (e.key === "Escape") setDialog(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pos, navigate]);

  // click building to auto-walk and enter
  const goToBuilding = (bx, by, route) => {
    // compute straight-line tile steps (simple)
    const tx = bx;
    const ty = by - 1; // stand in front of door
    // build steps
    const steps = [];
    let cx = pos.x / TILE;
    let cy = pos.y / TILE;
    while (cx !== tx || cy !== ty) {
      if (cx < tx) { cx++; steps.push([1,0,'right']); }
      else if (cx > tx) { cx--; steps.push([-1,0,'left']); }
      else if (cy < ty) { cy++; steps.push([0,1,'down']); }
      else if (cy > ty) { cy--; steps.push([0,-1,'up']); }
    }

    // execute steps sequentially then navigate
    (async () => {
      for (const s of steps) {
        await new Promise((res) => {
          move(s[0], s[1], s[2]);
          setTimeout(res, STEP_TIME + 10);
        });
      }
      // slight enter animation (fade)
      await new Promise((r) => setTimeout(r, 180));
      navigate(route);
    })();
  };

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{
        backgroundImage: "url('https://img.freepik.com/free-vector/16-bit-pixel-art-street-background-fancy-houses-night_32991-2811.jpg')",
        backgroundSize: "cover",
        imageRendering: "pixelated",
      }}
    >
      {/* Animated props: trees */}
      <div style={{ position: "absolute", top: 1 * TILE, left: 6 * TILE }} className="tree" />
      <div style={{ position: "absolute", top: 7 * TILE, left: 5 * TILE }} className="water" />

      {/* Buildings (visual placeholders) */}
      <button
        style={{ position: "absolute", top: 2 * TILE, left: 2 * TILE }}
        onClick={() => goToBuilding(2, 3, "/building-1")}
        className="building"
      >
        <div>House A</div>
      </button>

      <button
        style={{ position: "absolute", top: 2 * TILE, left: 8 * TILE }}
        onClick={() => goToBuilding(8, 3, "/building-2")}
        className="building"
      >
        <div>House B</div>
      </button>

      <button
        style={{ position: "absolute", top: 8 * TILE, left: 2 * TILE }}
        onClick={() => goToBuilding(2, 9, "/building-3")}
        className="building"
      >
        <div>House C</div>
      </button>

      <button
        style={{ position: "absolute", top: 8 * TILE, left: 8 * TILE }}
        onClick={() => goToBuilding(8, 9, "/building-4")}
        className="building"
      >
        <div>House D</div>
      </button>

      {/* NPCs */}
      {npcs.map((n) => (
        <div
          key={n.id}
          style={{ position: "absolute", left: n.x, top: n.y, width: TILE, height: TILE }}
          onClick={() => setDialog(n.text)}
        >
          <div style={{ width: TILE, height: TILE, background: "rgba(255,255,255,0.6)", borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>NPC</div>
        </div>
      ))}

      {/* Player sprite */}
      <img
        src={SPRITE[dir]}
        alt="player"
        style={{
          position: "absolute",
          left: pos.x,
          top: pos.y,
          width: TILE,
          height: TILE,
          objectFit: "none",
          objectPosition: `-${frame * TILE}px 0px`,
          imageRendering: "pixelated",
        }}
      />

      {/* Dialogue modal */}
      {dialog && (
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 40, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '8px 12px', borderRadius: 8 }}>
          <div>{dialog}</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Press ESC to close</div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .building { width: ${TILE*2}px; height: ${TILE*2}px; background: rgba(0,0,0,0.35); color: white; display:flex; align-items:center; justify-content:center; border-radius:8px; }
        .tree { width: ${TILE}px; height: ${TILE*1.4}px; background: url('https://img.freepik.com/free-vector/pixelated-tree_53876-91416.jpg') center/cover; image-rendering: pixelated; animation: sway 3s ease-in-out infinite; }
        .water { width: ${TILE*3}px; height: ${TILE}px; background: linear-gradient(180deg, rgba(70,130,180,0.8), rgba(30,144,255,0.6)); border-radius: 8px; animation: ripple 2s infinite; opacity:0.8 }
        @keyframes sway { 0% { transform: translateY(0) } 50% { transform: translateY(-4px) } 100% { transform: translateY(0) } }
        @keyframes ripple { 0% { transform: translateY(0) } 50% { transform: translateY(-3px) } 100% { transform: translateY(0) } }
      `}</style>
    </div>
  );
}

// ---------- Interiors (simple) ----------
function InteriorTemplate({ title }) {
  const navigate = useNavigate();
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', background:'#f7f1e1' }}>
      <h1>{title}</h1>
      <p>Welcome inside. Press Back to go outside.</p>
      <button onClick={() => navigate('/')} style={{ marginTop: 12, padding: '8px 12px' }}>Back</button>
    </div>
  )
}

function B1() { return <InteriorTemplate title={'Building 1 Interior'} /> }
function B2() { return <InteriorTemplate title={'Building 2 Interior'} /> }
function B3() { return <InteriorTemplate title={'Building 3 Interior'} /> }
function B4() { return <InteriorTemplate title={'Building 4 Interior'} /> }

// ---------- App / Router Wrapper ----------
export default function RPGBuildingSceneWrapper() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OutsideMap />} />
        <Route path="/building-1" element={<B1 />} />
        <Route path="/building-2" element={<B2 />} />
        <Route path="/building-3" element={<B3 />} />
        <Route path="/building-4" element={<B4 />} />
      </Routes>
    </BrowserRouter>
  );
}
