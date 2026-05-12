import React, { useEffect, useRef } from "react";
import { initBee } from "./bee.js";

function HoneyBee() {
  const mountRef = useRef(null);

  useEffect(() => {
    const cleanup = initBee(mountRef.current);
    return cleanup; // Cleanup on unmount
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none fixed inset-0 z-50"
    />
  );
}

export default HoneyBee;
