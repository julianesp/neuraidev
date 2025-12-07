import { FC } from 'react';

interface FavoriteButtonProps {
  producto: any;
  className?: string;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

declare const FavoriteButton: FC<FavoriteButtonProps>;

export default FavoriteButton;
