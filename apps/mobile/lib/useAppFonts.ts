import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts as useInterFonts,
} from '@expo-google-fonts/inter';
import {
  Jost_500Medium,
  Jost_700Bold,
  useFonts as useJostFonts,
} from '@expo-google-fonts/jost';

export function useAppFonts() {
  const [interLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [jostLoaded] = useJostFonts({
    Jost_500Medium,
    Jost_700Bold,
  });
  return interLoaded && jostLoaded;
}
