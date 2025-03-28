// app/Icons.tsx
import React from "react";
import Svg, { Path } from "react-native-svg";

// Common icon props interface
export interface IconProps {
  width?: number;
  height?: number;
  color?: string;
}

// 1) FeedPageIcon (House)
export const FeedPageIcon: React.FC<IconProps> = ({
  width = 32,
  height = 32,
  color = "#343A3F",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
      <Path
        d="M12 28V18.1333C12 17.3866 12 17.0132 12.1453 16.728C12.2732 16.4771 12.4771 16.2731 12.728 16.1453C13.0132 16 13.3866 16 14.1333 16H17.8667C18.6134 16 18.9868 16 19.272 16.1453C19.5229 16.2731 19.7268 16.4771 19.8547 16.728C20 17.0132 20 17.3866 20 18.1333V28M14.6903 3.68533L5.64719 10.7188C5.04269 11.189 4.74045 11.4241 4.5227 11.7185C4.32982 11.9793 4.18614 12.273 4.0987 12.5854C4 12.938 4 13.3209 4 14.0867V23.7333C4 25.2268 4 25.9735 4.29065 26.544C4.54631 27.0457 4.95426 27.4537 5.45603 27.7093C6.02646 28 6.77319 28 8.26667 28H23.7333C25.2268 28 25.9735 28 26.544 27.7093C27.0457 27.4537 27.4537 27.0457 27.7094 26.544C28 25.9735 28 25.2268 28 23.7333V14.0867C28 13.3209 28 12.938 27.9013 12.5854C27.8139 12.273 27.6702 11.9793 27.4773 11.7185C27.2596 11.4241 26.9573 11.189 26.3528 10.7188L17.3097 3.68533C16.8413 3.32099 16.6071 3.13883 16.3485 3.0688C16.1203 3.00701 15.8797 3.00701 15.6515 3.0688C15.3929 3.13883 15.1587 3.32099 14.6903 3.68533Z"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

// 2) PlusIcon
export const PlusIcon: React.FC<IconProps> = ({
  width = 32,
  height = 32,
  color = "#8A847B",
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
