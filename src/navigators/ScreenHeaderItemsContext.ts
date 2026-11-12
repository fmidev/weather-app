import { createContext, useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

export type ScreenHeaderItems = ReturnType<
  NonNullable<NativeStackNavigationOptions['unstable_headerRightItems']>
>;

export const ScreenHeaderItemsContext = createContext<Dispatch<
  SetStateAction<ScreenHeaderItems>
> | null>(null);

export const useScreenHeaderOptions = (options: NativeStackNavigationOptions) => {
  const [items, setItems] = useState<ScreenHeaderItems>([]);
  const headerOptions = useMemo<NativeStackNavigationOptions>(
    () =>
      items.length === 0
        ? options
        : {
            ...options,
            unstable_headerRightItems: (props) => [
              ...(options.unstable_headerRightItems?.(props) ?? []),
              ...items,
            ],
          },
    [items, options]
  );

  return { headerOptions, setItems };
};
