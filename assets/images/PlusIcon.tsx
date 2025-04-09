import React from "react";
import Svg, { Path } from "react-native-svg";

export interface IconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const PlusIcon: React.FC<IconProps> = ({
  width = 32,
  height = 32,
  color = "#3A3A3A",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
      <Path
        d="M16.0001 6.66669V25.3334M6.66675 16H25.3334"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
