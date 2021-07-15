import Theme, { Components } from 'core/themes/model'

export interface ThemeReducer {
  theme: Theme
  components: Components
}

export interface ThemeConfig {
  headerColor?: string
  sidenavColor?: string
  logoUrl?: string
}
