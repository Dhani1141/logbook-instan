"use client";
import './RobotLoader.css';

interface RobotLoaderProps {
  message?: string;
}

export default function RobotLoader({ message = 'Sedang membuat PDF...' }: RobotLoaderProps) {
  return (
    <div className="robot-loader-overlay">
      <div className="rl-scene">
        <div className="rl-bench" />
        <div className="rl-robot">
          <div className="rl-head">
            <div className="rl-screen">
              <div className="rl-face">
                <div className="rl-eye left" />
                <div className="rl-eye right" />
                <div className="rl-mouth" />
                <div className="rl-zzz">Z</div>
              </div>
            </div>
          </div>
          <div className="rl-neck" />
          <div className="rl-torso">
            <div className="rl-arm left" />
            <div className="rl-arm right" />
            <div className="rl-leg left" />
            <div className="rl-leg right" />
          </div>
        </div>
      </div>

      <p className="robot-loader-text">{message}</p>
    </div>
  );
}
