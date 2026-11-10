import { watchEffect, type Ref } from 'vue'
import { useBackground } from '@/composables/useBackground'
import { BASE_BACKGROUND, type Palette } from '@/utils/period'

export function useTheme(palette: Ref<Palette>) {
  const { photoShown } = useBackground()
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')

  watchEffect(() => {
    document.documentElement.dataset.theme = photoShown.value ? 'dark' : palette.value.theme
    document.documentElement.dataset.scene = photoShown.value ? 'photo' : 'sky'
    if (meta) meta.content = photoShown.value ? BASE_BACKGROUND : palette.value.sky[0]
  })
}
