import { useState, useEffect, useCallback } from 'react';

interface SensorStatus {
  accelerometer: boolean;
  gyroscope: boolean;
  geolocation: boolean;
  orientation: boolean;
}

export const useSensors = (isRecording: boolean, onSensorData: (sensorType: string, data: any) => void) => {
  const [sensorStatus, setSensorStatus] = useState<SensorStatus>({
    accelerometer: false,
    gyroscope: false,
    geolocation: false,
    orientation: false
  });

  const [sensors, setSensors] = useState<{
    accelerometer?: any;
    gyroscope?: any;
    geolocationWatchId?: number;
  }>({});

  const checkSensorSupport = useCallback(async () => {
    const status: SensorStatus = {
      accelerometer: false,
      gyroscope: false,
      geolocation: false,
      orientation: false
    };

    // Check accelerometer
    if ('Accelerometer' in window) {
      try {
        const accel = new (window as any).Accelerometer({ frequency: 10 });
        status.accelerometer = true;
        accel.stop();
      } catch (e) {
        console.log('Accelerometer not available:', e);
      }
    }

    // Check gyroscope
    if ('Gyroscope' in window) {
      try {
        const gyro = new (window as any).Gyroscope({ frequency: 10 });
        status.gyroscope = true;
        gyro.stop();
      } catch (e) {
        console.log('Gyroscope not available:', e);
      }
    }

    // Check geolocation
    if ('geolocation' in navigator) {
      status.geolocation = true;
    }

    // Check orientation
    if ('DeviceOrientationEvent' in window) {
      status.orientation = true;
    }

    setSensorStatus(status);
  }, []);

  useEffect(() => {
    checkSensorSupport();
  }, [checkSensorSupport]);

  useEffect(() => {
    if (!isRecording) {
      // Stop all sensors
      if (sensors.accelerometer) sensors.accelerometer.stop();
      if (sensors.gyroscope) sensors.gyroscope.stop();
      if (sensors.geolocationWatchId !== undefined) {
        navigator.geolocation.clearWatch(sensors.geolocationWatchId);
      }
      setSensors({});
      return;
    }

    const newSensors: any = {};

    // Start accelerometer
    if (sensorStatus.accelerometer && 'Accelerometer' in window) {
      try {
        const accel = new (window as any).Accelerometer({ frequency: 10 });
        accel.addEventListener('reading', () => {
          onSensorData('accelerometer', {
            x: accel.x,
            y: accel.y,
            z: accel.z
          });
        });
        accel.start();
        newSensors.accelerometer = accel;
      } catch (e) {
        console.error('Error starting accelerometer:', e);
      }
    }

    // Start gyroscope
    if (sensorStatus.gyroscope && 'Gyroscope' in window) {
      try {
        const gyro = new (window as any).Gyroscope({ frequency: 10 });
        gyro.addEventListener('reading', () => {
          onSensorData('gyroscope', {
            x: gyro.x,
            y: gyro.y,
            z: gyro.z
          });
        });
        gyro.start();
        newSensors.gyroscope = gyro;
      } catch (e) {
        console.error('Error starting gyroscope:', e);
      }
    }

    // Start geolocation
    if (sensorStatus.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          onSensorData('geolocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000
        }
      );
      newSensors.geolocationWatchId = watchId;
    }

    setSensors(newSensors);

    return () => {
      if (newSensors.accelerometer) newSensors.accelerometer.stop();
      if (newSensors.gyroscope) newSensors.gyroscope.stop();
      if (newSensors.geolocationWatchId !== undefined) {
        navigator.geolocation.clearWatch(newSensors.geolocationWatchId);
      }
    };
  }, [isRecording, sensorStatus, onSensorData]);

  return sensorStatus;
};