import { useState, useEffect, useCallback, useRef } from "react";

interface SensorStatus {
  accelerometer: boolean;
  gyroscope: boolean;
  linear_acceleration: boolean;
  relative_orientation: boolean;
}

export const useSensors = (
  isRecording: boolean,
  onSensorData: (sensorType: string, data: any) => void
) => {
  const [sensorStatus, setSensorStatus] = useState<SensorStatus>({
    accelerometer: false,
    gyroscope: false,
    linear_acceleration: false,
    relative_orientation: false,
  });

  const sensorsRef = useRef<{
    accelerometer?: any;
    gyroscope?: any;
    linear_acceleration?: any;
    relative_orientation?: any;
  }>({});

  const checkSensorSupport = useCallback(async () => {
    const status: SensorStatus = {
      accelerometer: false,
      gyroscope: false,
      linear_acceleration: false,
      relative_orientation: false,
    };

    // Check accelerometer
    if ("Accelerometer" in window) {
      try {
        const accel = new (window as any).Accelerometer({ frequency: 10 });
        status.accelerometer = true;
        accel.stop();
      } catch (e) {
        console.log("Accelerometer not available:", e);
      }
    }

    // Check gyroscope
    if ("Gyroscope" in window) {
      try {
        const gyro = new (window as any).Gyroscope({ frequency: 10 });
        status.gyroscope = true;
        gyro.stop();
      } catch (e) {
        console.log("Gyroscope not available:", e);
      }
    }

    // Check linear acceleration
    if ("LinearAccelerationSensor" in window) {
      try {
        const linear = new (window as any).LinearAccelerationSensor({
          frequency: 10,
        });
        status.linear_acceleration = true;
        linear.stop();
      } catch (e) {
        console.log("LinearAccelerationSensor not available:", e);
      }
    }

    // Check relative orientation
    if ("RelativeOrientationSensor" in window) {
      try {
        const relOrient = new (window as any).RelativeOrientationSensor({
          frequency: 10,
        });
        status.relative_orientation = true;
        relOrient.stop();
      } catch (e) {
        console.log("RelativeOrientationSensor not available:", e);
      }
    }

    setSensorStatus(status);
  }, []);

  useEffect(() => {
    checkSensorSupport();
  }, [checkSensorSupport]);

  const onSensorDataRef = useRef(onSensorData);
  onSensorDataRef.current = onSensorData;

  const stopAllSensors = useCallback(() => {
    const currentSensors = sensorsRef.current;
    console.log(currentSensors);
    console.log("stopping sensors");
    if (currentSensors.accelerometer) currentSensors.accelerometer.stop();
    if (currentSensors.gyroscope) currentSensors.gyroscope.stop();
    if (currentSensors.linear_acceleration)
      currentSensors.linear_acceleration.stop();
    if (currentSensors.relative_orientation)
      currentSensors.relative_orientation.stop();
    sensorsRef.current = {};
  }, []);

  useEffect(() => {
    if (!isRecording) {
      stopAllSensors();
      return;
    }

    const newSensors: any = {};

    // Start accelerometer
    if (sensorStatus.accelerometer && "Accelerometer" in window) {
      try {
        const accel = new (window as any).Accelerometer({ frequency: 10 });
        accel.addEventListener("reading", () => {
          onSensorDataRef.current("accelerometer", {
            x: accel.x,
            y: accel.y,
            z: accel.z,
          });
        });
        accel.start();
        newSensors.accelerometer = accel;
      } catch (e) {
        console.error("Error starting accelerometer:", e);
      }
    }

    // Start gyroscope
    if (sensorStatus.gyroscope && "Gyroscope" in window) {
      try {
        const gyro = new (window as any).Gyroscope({ frequency: 10 });
        gyro.addEventListener("reading", () => {
          onSensorDataRef.current("gyroscope", {
            x: gyro.x,
            y: gyro.y,
            z: gyro.z,
          });
        });
        gyro.start();
        newSensors.gyroscope = gyro;
      } catch (e) {
        console.error("Error starting gyroscope:", e);
      }
    }

    // Start linear acceleration
    if (
      sensorStatus.linear_acceleration &&
      "LinearAccelerationSensor" in window
    ) {
      try {
        const linear = new (window as any).LinearAccelerationSensor({
          frequency: 10,
        });
        linear.addEventListener("reading", () => {
          onSensorDataRef.current("linear_acceleration", {
            x: linear.x,
            y: linear.y,
            z: linear.z,
          });
        });
        linear.start();
        newSensors.linear_acceleration = linear;
      } catch (e) {
        console.error("Error starting linear acceleration:", e);
      }
    }

    // Start relative orientation
    if (
      sensorStatus.relative_orientation &&
      "RelativeOrientationSensor" in window
    ) {
      try {
        const relOrient = new (window as any).RelativeOrientationSensor({
          frequency: 10,
        });
        relOrient.addEventListener("reading", () => {
          onSensorDataRef.current("relative_orientation", {
            quaternion: relOrient.quaternion,
          });
        });
        relOrient.start();
        newSensors.relative_orientation = relOrient;
      } catch (e) {
        console.error("Error starting relative orientation:", e);
      }
    }

    sensorsRef.current = newSensors;

    return () => {
      if (newSensors.accelerometer) newSensors.accelerometer.stop();
      if (newSensors.gyroscope) newSensors.gyroscope.stop();
      if (newSensors.linear_acceleration) newSensors.linear_acceleration.stop();
      if (newSensors.relative_orientation)
        newSensors.relative_orientation.stop();
    };
  }, [isRecording, sensorStatus, stopAllSensors]);

  return { sensorStatus, stopAllSensors };
};
