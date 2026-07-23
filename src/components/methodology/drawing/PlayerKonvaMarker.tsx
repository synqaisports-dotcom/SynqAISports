import { Circle, Image as KonvaImage, Text } from 'react-konva';
import {
  isPlayerMaterial,
  playerLabelFor,
  type MaterialKind,
} from '@/lib/drawing-material-assets';

type Props = {
  material: MaterialKind;
  label?: string;
  scale: number;
  image?: HTMLImageElement;
  listening?: boolean;
};

export function PlayerKonvaMarker({ material, label, scale, image, listening = false }: Props) {
  const fontSize = Math.max(8, scale * 0.36);

  return (
    <>
      {image ? (
        <KonvaImage
          image={image}
          width={scale}
          height={scale}
          offsetX={scale / 2}
          offsetY={scale / 2}
          imageSmoothingEnabled
          listening={listening}
        />
      ) : (
        <Circle radius={scale / 2} fill="#334155" listening={listening} />
      )}
      {isPlayerMaterial(material) ? (
        <Text
          name="player-label"
          text={playerLabelFor(material, label)}
          x={-scale / 2}
          y={-fontSize * 0.55}
          width={scale}
          fontSize={fontSize}
          fontFamily="system-ui, -apple-system, sans-serif"
          fontStyle="bold"
          fill="#ffffff"
          align="center"
          listening={false}
          shadowColor="rgba(0,0,0,0.45)"
          shadowBlur={Math.max(1, scale * 0.04)}
          shadowOffsetY={Math.max(1, scale * 0.02)}
        />
      ) : null}
    </>
  );
}
