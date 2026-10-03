import { useState, useEffect, useCallback, useRef } from "react";

export type HeadingPermissionStatus = "granted" | "denied" | "prompt" | "unsupported";

export interface UseDeviceHeadingResult {
  heading: number; // 0° - 360°
  isLiveSensor: boolean;
  permissionStatus: HeadingPermissionStatus;
  requestPermission: () => Promise<boolean>;
  setManualHeading: (deg: number) => void;
  turnHeadingBy: (delta: number) => void;
}

export function useDeviceHeading(initialHeading = 45): UseDeviceHeadingResult {
  const [heading, setHeading] = useState<number>(initialHeading);
  const [isLiveSensor, setIsLiveSensor] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<HeadingPermissionStatus>("prompt");
  const liveHeadingRef = useRef<number>(initialHeading);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    // webkitCompassHeading is native to iOS Safari (0 = North)
    // alpha handles Android (requires absolute orientation pairing)
    const eventWithWebkit = event as unknown as { webkitCompassHeading?: number };
    let currentHeading: number | null = null;

    if (
      typeof eventWithWebkit.webkitCompassHeading === "number" &&
      !isNaN(eventWithWebkit.webkitCompassHeading)
    ) {
      currentHeading = eventWithWebkit.webkitCompassHeading;
    } else if (typeof event.alpha === "number" && !isNaN(event.alpha)) {
      currentHeading = (360 - event.alpha) % 360;
    }

    if (currentHeading !== null) {
      const rounded = Math.round(currentHeading);
      liveHeadingRef.current = rounded;
      setHeading(rounded);
      setIsLiveSensor(true);
      setPermissionStatus("granted");
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;

    const DeviceOrientationWithPermission = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };

    if (typeof DeviceOrientationWithPermission?.requestPermission === "function") {
      try {
        const response = await DeviceOrientationWithPermission.requestPermission();
        if (response === "granted") {
          window.addEventListener("deviceorientation", handleOrientation, true);
          setPermissionStatus("granted");
          return true;
        } else {
          setPermissionStatus("denied");
          return false;
        }
      } catch {
        setPermissionStatus("denied");
        return false;
      }
    } else if ("DeviceOrientationEvent" in window) {
      window.addEventListener("deviceorientation", handleOrientation, true);
      setPermissionStatus("granted");
      return true;
    } else {
      setPermissionStatus("unsupported");
      return false;
    }
  }, [handleOrientation]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const DeviceOrientationWithPermission = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };

    // On standard browsers without iOS permission requirement, attach listener directly
    if (typeof DeviceOrientationWithPermission?.requestPermission !== "function") {
      if ("DeviceOrientationEvent" in window) {
        window.addEventListener("deviceorientation", handleOrientation, true);
      } else {
        setPermissionStatus("unsupported");
      }
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, [handleOrientation]);

  const setManualHeading = useCallback((deg: number) => {
    const normalized = ((deg % 360) + 360) % 360;
    setHeading(normalized);
  }, []);

  const turnHeadingBy = useCallback((delta: number) => {
    setHeading((prev) => {
      const next = (prev + delta + 360) % 360;
      return Math.round(next);
    });
  }, []);

  return {
    heading,
    isLiveSensor,
    permissionStatus,
    requestPermission,
    setManualHeading,
    turnHeadingBy,
  };
}
