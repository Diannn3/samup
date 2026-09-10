import React, { useEffect, useRef } from "react";
import { Application, Container, Graphics, Text, TextStyle } from "pixi.js";
import { Viewport } from "pixi-viewport";
import { STATIONS, type Station } from "../../data/reporting/stations";
import { useReportingStore } from "../../stores/reportingStore";

export const SpatialCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Store bindings
  const playerPos = useReportingStore((s) => s.playerPos);
  const targetPos = useReportingStore((s) => s.targetPos);
  const setPlayerPos = useReportingStore((s) => s.setPlayerPos);
  const setTargetPos = useReportingStore((s) => s.setTargetPos);
  const updateProximity = useReportingStore((s) => s.updateProximity);
  const openStationInspection = useReportingStore((s) => s.openStationInspection);
  const isInspecting = useReportingStore((s) => s.isInspecting);
  const isPortfolioOpen = useReportingStore((s) => s.isPortfolioOpen);
  const isCommandPaletteOpen = useReportingStore((s) => s.isCommandPaletteOpen);

  // References for continuous loop
  const posRef = useRef({ x: playerPos.x, y: playerPos.y });
  const velRef = useRef({ x: 0, y: 0 });
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const isModalOpenRef = useRef(false);

  useEffect(() => {
    isModalOpenRef.current = isInspecting || isPortfolioOpen || isCommandPaletteOpen;
  }, [isInspecting, isPortfolioOpen, isCommandPaletteOpen]);

  // Synchronize teleportation from store
  useEffect(() => {
    posRef.current = { x: playerPos.x, y: playerPos.y };
    velRef.current = { x: 0, y: 0 };
  }, [playerPos.x, playerPos.y]);

  useEffect(() => {
    if (!containerRef.current) return;

    let app: Application | null = null;
    let viewport: Viewport | null = null;
    let isDestroyed = false;

    const initCanvas = async () => {
      app = new Application();
      await app.init({
        resizeTo: window,
        backgroundColor: 0xfafafa,
        antialias: true,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 2, 2),
        preference: "webgl",
      });

      if (isDestroyed || !containerRef.current) {
        app.destroy(true);
        return;
      }

      containerRef.current.appendChild(app.canvas);

      // Setup Viewport (World: 7200 x 3600)
      viewport = new Viewport({
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        worldWidth: 7200,
        worldHeight: 3600,
        events: app.renderer.events,
      });

      app.stage.addChild(viewport);
      viewport.drag({ mouseButtons: "right" }).pinch().wheel().decelerate({ friction: 0.92 });
      viewport.clampZoom({ minScale: 0.75, maxScale: 1.4 });

      // World Layers
      const backgroundLayer = new Container();
      const gridLayer = new Container();
      const routeLayer = new Container();
      const stationsLayer = new Container();
      const playerLayer = new Container();

      viewport.addChild(backgroundLayer);
      viewport.addChild(gridLayer);
      viewport.addChild(routeLayer);
      viewport.addChild(stationsLayer);
      viewport.addChild(playerLayer);

      // Draw Darkroom Pocket Background (Math in Sight Zone)
      const darkroomBg = new Graphics();
      darkroomBg.rect(3200, 1950, 1000, 950);
      darkroomBg.fill({ color: 0x09090b, alpha: 1 });
      darkroomBg.stroke({ color: 0x27272a, width: 1 });
      backgroundLayer.addChild(darkroomBg);

      // Darkroom Label
      const darkroomLabelStyle = new TextStyle({
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 12,
        fill: 0x71717a,
        letterSpacing: 3,
      });
      const darkroomTag = new Text({
        text: "[ ZONE 02 // CINEMATIC DARKROOM : MATH IN SIGHT ]",
        style: darkroomLabelStyle,
      });
      darkroomTag.position.set(3240, 1980);
      backgroundLayer.addChild(darkroomTag);

      // Draw Global Architectural Grid (64px Major, 16px Minor)
      const gridGfx = new Graphics();
      for (let x = 0; x <= 7200; x += 64) {
        gridGfx.moveTo(x, 0);
        gridGfx.lineTo(x, 3600);
        gridGfx.stroke({ color: 0x000000, alpha: 0.035, width: 1 });
      }
      for (let y = 0; y <= 3600; y += 64) {
        gridGfx.moveTo(0, y);
        gridGfx.lineTo(7200, y);
        gridGfx.stroke({ color: 0x000000, alpha: 0.035, width: 1 });
      }

      // Precision CAD Crosshairs at 256px intersections
      for (let cx = 256; cx < 7200; cx += 256) {
        for (let cy = 256; cy < 3600; cy += 256) {
          gridGfx.moveTo(cx - 5, cy);
          gridGfx.lineTo(cx + 5, cy);
          gridGfx.moveTo(cx, cy - 5);
          gridGfx.lineTo(cx, cy + 5);
          gridGfx.stroke({ color: 0x000000, alpha: 0.12, width: 1 });
        }
      }
      gridLayer.addChild(gridGfx);

      // Draw Major Route Spine
      const routeGfx = new Graphics();
      // ST-01 to ST-04 (Main Solid Spine)
      routeGfx.moveTo(600, 1800);
      routeGfx.lineTo(1200, 1800);
      routeGfx.lineTo(1800, 1400);
      routeGfx.lineTo(2400, 1800);
      routeGfx.stroke({ color: 0x000000, width: 2, alpha: 0.85 });

      // Marketing Fork (Partnership vs Promotions)
      // Partnership branch (Upper path)
      routeGfx.moveTo(2400, 1800);
      routeGfx.lineTo(2700, 1550);
      routeGfx.lineTo(3100, 1550);
      routeGfx.stroke({ color: 0x000000, width: 1.5, alpha: 0.35 });

      // Promotions branch (Dian's Focus)
      routeGfx.moveTo(2400, 1800);
      routeGfx.lineTo(3000, 1800);
      routeGfx.stroke({ color: 0x000000, width: 2.5, alpha: 0.9 });

      // Branch to Math in Sight (Into Darkroom)
      routeGfx.moveTo(3000, 1800);
      routeGfx.bezierCurveTo(3300, 1800, 3300, 2400, 3600, 2400);
      routeGfx.stroke({ color: 0x000000, width: 2, alpha: 0.7 });

      // Emergence from Darkroom to ENABLE 2026 & NIMP/MIA
      routeGfx.moveTo(3600, 2400);
      routeGfx.bezierCurveTo(3900, 2400, 3900, 1400, 4200, 1400);
      routeGfx.stroke({ color: 0x000000, width: 2, alpha: 0.7 });

      routeGfx.moveTo(4200, 1400);
      routeGfx.lineTo(4600, 1800);
      routeGfx.lineTo(4900, 1400);
      routeGfx.lineTo(5300, 1800);
      routeGfx.stroke({ color: 0x000000, width: 2, alpha: 0.85 });

      // Dashed Route for Applicant Section (ST-10 to ST-12)
      for (let x = 5300; x <= 6400; x += 24) {
        routeGfx.moveTo(x, 1800);
        routeGfx.lineTo(x + 12, 1800);
        routeGfx.stroke({ color: 0x000000, width: 2, alpha: 0.45 });
      }
      routeLayer.addChild(routeGfx);

      // Station Renderers & Interactivity
      const stationNodes: { station: Station; container: Container; outerRing: Graphics }[] = [];

      STATIONS.forEach((station) => {
        const stationCont = new Container();
        stationCont.position.set(station.position.x, station.position.y);
        stationCont.eventMode = "static";
        stationCont.cursor = "pointer";

        const isDark = station.theme === "darkroom";
        const ringColor = isDark ? 0xffffff : 0x000000;
        const textColor = isDark ? 0xffffff : 0x000000;
        const subColor = isDark ? 0xa1a1aa : 0x52525b;

        // 1. Concentric Outer Orbit
        const outerRing = new Graphics();
        outerRing.circle(0, 0, station.radius * 0.45);
        outerRing.stroke({ color: ringColor, width: 1.5, alpha: 0.25 });
        outerRing.fill({ color: ringColor, alpha: 0.02 });
        stationCont.addChild(outerRing);

        // 2. Mid Reticle with 4 Crosshair Ticks
        const midReticle = new Graphics();
        const midR = station.radius * 0.28;
        midReticle.circle(0, 0, midR);
        midReticle.stroke({ color: ringColor, width: 1, alpha: 0.4 });
        // 4 Crosshair ticks
        midReticle.moveTo(0, -midR - 4);
        midReticle.lineTo(0, -midR + 4);
        midReticle.moveTo(0, midR - 4);
        midReticle.lineTo(0, midR + 4);
        midReticle.moveTo(-midR - 4, 0);
        midReticle.lineTo(-midR + 4, 0);
        midReticle.moveTo(midR - 4, 0);
        midReticle.lineTo(midR + 4, 0);
        midReticle.stroke({ color: ringColor, width: 1.5, alpha: 0.5 });
        stationCont.addChild(midReticle);

        // 3. Center Precision Core
        const coreDot = new Graphics();
        coreDot.circle(0, 0, 4.5);
        coreDot.fill({ color: ringColor, alpha: 0.9 });
        coreDot.circle(0, 0, 1.5);
        coreDot.fill({ color: isDark ? 0x000000 : 0xffffff, alpha: 1 });
        stationCont.addChild(coreDot);

        // 4. Station Index Monospace Tag
        const indexStyle = new TextStyle({
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 10,
          fontWeight: "700",
          fill: ringColor,
          letterSpacing: 1.5,
        });
        const indexTag = new Text({
          text: `[${station.index}]`,
          style: indexStyle,
        });
        indexTag.anchor.set(0.5, 1);
        indexTag.position.set(0, -station.radius * 0.48);
        stationCont.addChild(indexTag);

        // 5. Station Monolithic Title
        const titleStyle = new TextStyle({
          fontFamily: "Plus Jakarta Sans, sans-serif",
          fontSize: station.id === "st-11" ? 30 : 16,
          fontWeight: "800",
          fill: textColor,
          letterSpacing: -0.5,
        });
        const titleText = new Text({
          text: station.title,
          style: titleStyle,
        });
        titleText.anchor.set(0.5, 0);
        titleText.position.set(0, station.radius * 0.48);
        stationCont.addChild(titleText);

        // 6. Station Subtitle
        const subStyle = new TextStyle({
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 9,
          fontWeight: "500",
          fill: subColor,
          letterSpacing: 0.5,
        });
        const subText = new Text({
          text: station.subtitle,
          style: subStyle,
        });
        subText.anchor.set(0.5, 0);
        subText.position.set(0, station.radius * 0.48 + (station.id === "st-11" ? 36 : 22));
        stationCont.addChild(subText);

        // 7. Telemetry Coordinate Label
        const coordStyle = new TextStyle({
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 8,
          fill: isDark ? 0x71717a : 0xa1a1aa,
          letterSpacing: 1,
        });
        const coordText = new Text({
          text: `X:${station.position.x} Y:${station.position.y}`,
          style: coordStyle,
        });
        coordText.anchor.set(0.5, 0);
        coordText.position.set(0, station.radius * 0.48 + (station.id === "st-11" ? 54 : 38));
        stationCont.addChild(coordText);

        // Click to walk or inspect
        stationCont.on("pointerdown", () => {
          const dx = posRef.current.x - station.position.x;
          const dy = posRef.current.y - station.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            openStationInspection(station);
          } else {
            setTargetPos({ x: station.position.x, y: station.position.y });
          }
        });

        stationsLayer.addChild(stationCont);
        stationNodes.push({ station, container: stationCont, outerRing });
      });

      // Player Cursor Avatar
      const playerGfx = new Graphics();
      playerLayer.addChild(playerGfx);

      // Render Loop & Kinematics
      let lastTime = performance.now();

      app.ticker.add(() => {
        const now = performance.now();
        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        // Player Kinematics
        const speed = 360;
        const friction = 0.86;
        let ax = 0;
        let ay = 0;

        if (!isModalOpenRef.current) {
          if (keysRef.current["KeyW"] || keysRef.current["ArrowUp"]) ay -= 1;
          if (keysRef.current["KeyS"] || keysRef.current["ArrowDown"]) ay += 1;
          if (keysRef.current["KeyA"] || keysRef.current["ArrowLeft"]) ax -= 1;
          if (keysRef.current["KeyD"] || keysRef.current["ArrowRight"]) ax += 1;
        }

        // Mouse click target interpolation
        if (targetPos) {
          const tdx = targetPos.x - posRef.current.x;
          const tdy = targetPos.y - posRef.current.y;
          const tdist = Math.sqrt(tdx * tdx + tdy * tdy);
          if (tdist > 10) {
            ax = tdx / tdist;
            ay = tdy / tdist;
          } else {
            setTargetPos(null);
          }
        }

        // Normalize directional input
        if (ax !== 0 && ay !== 0) {
          ax *= 0.7071;
          ay *= 0.7071;
        }

        velRef.current.x = (velRef.current.x + ax * speed * dt * 8) * friction;
        velRef.current.y = (velRef.current.y + ay * speed * dt * 8) * friction;

        posRef.current.x = Math.max(300, Math.min(6800, posRef.current.x + velRef.current.x));
        posRef.current.y = Math.max(800, Math.min(2800, posRef.current.y + velRef.current.y));

        // Update player graphic
        const inDarkroom =
          posRef.current.x >= 3200 &&
          posRef.current.x <= 4200 &&
          posRef.current.y >= 1950 &&
          posRef.current.y <= 2900;
        const playerColor = inDarkroom ? 0xffffff : 0x000000;

        playerGfx.clear();
        // Outer tracking ring (18px dia)
        playerGfx.circle(posRef.current.x, posRef.current.y, 9);
        playerGfx.stroke({ color: playerColor, width: 1.5, alpha: 0.85 });
        // Inner registration point (4px dia)
        playerGfx.circle(posRef.current.x, posRef.current.y, 2.5);
        playerGfx.fill({ color: playerColor, alpha: 0.95 });

        // Update Proximity & Station Highlights
        let nearestDist = Infinity;
        let nearestSt: Station | null = null;

        stationNodes.forEach(({ station, outerRing }) => {
          const dx = posRef.current.x - station.position.x;
          const dy = posRef.current.y - station.position.y;
          const d = Math.sqrt(dx * dx + dy * dy);

          if (d < nearestDist) {
            nearestDist = d;
            nearestSt = station;
          }

          // Proximity radial glow and expansion
          const isDark = station.theme === "darkroom";
          const rColor = isDark ? 0xffffff : 0x000000;
          const baseRadius = station.radius * 0.4;

          outerRing.clear();
          if (d < 180) {
            const glowFactor = 1 - d / 180;
            outerRing.circle(0, 0, baseRadius + glowFactor * 6);
            outerRing.stroke({ color: rColor, width: 2, alpha: 0.5 + glowFactor * 0.4 });
            outerRing.fill({ color: rColor, alpha: 0.04 + glowFactor * 0.08 });
          } else {
            outerRing.circle(0, 0, baseRadius);
            outerRing.stroke({ color: rColor, width: 1.5, alpha: 0.25 });
            outerRing.fill({ color: rColor, alpha: 0.02 });
          }
        });

        // Smooth Camera Follow with lookahead
        if (viewport) {
          const lookaheadX = posRef.current.x + velRef.current.x * 12;
          const lookaheadY = posRef.current.y + velRef.current.y * 12;
          const currentCenter = viewport.center;
          const targetCenter = {
            x: currentCenter.x + (lookaheadX - currentCenter.x) * 0.08,
            y: currentCenter.y + (lookaheadY - currentCenter.y) * 0.08,
          };
          viewport.moveCenter(targetCenter.x, targetCenter.y);
        }

        // Sync Zustand store
        updateProximity(posRef.current);
      });

      // Initial Camera Position
      viewport.moveCenter(posRef.current.x, posRef.current.y);
    };

    initCanvas();

    // Keyboard Event Handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow hotkeys even if modal is open
      if (e.key === "Escape") {
        useReportingStore.getState().closeStationInspection();
        useReportingStore.getState().closePortfolio();
        useReportingStore.getState().setCommandPaletteOpen(false);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        useReportingStore.getState().toggleCommandPalette();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        useReportingStore.getState().openPortfolio();
        return;
      }

      if (isModalOpenRef.current) return;

      keysRef.current[e.code] = true;

      // Enter or E to inspect nearest station
      if (e.code === "KeyE" || e.code === "Enter") {
        const { nearestStation, distanceToNearest } = useReportingStore.getState();
        if (nearestStation && distanceToNearest < 180) {
          openStationInspection(nearestStation);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      isDestroyed = true;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (app) {
        app.destroy(true, { children: true, texture: true });
      }
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 overflow-hidden bg-[#fafafa]" />;
};
