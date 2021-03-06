import { Theme as DefaultTheme } from '@material-ui/core'
import { AppPlugins } from 'app/constants'

export interface AppTheme {
  breakpoints: any
  direction: string
  mixins: Mixins
  overrides: Overrides
  components: Components
  palette: Palette
  shadows: string[]
  typography: Typography
  shape: Shape
  spacing: number
  transitions: Transitions
  zIndex: ZIndex
}

export interface Breakpoints {
  keys: string[]
  values: Values
}

export interface Values {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
}

export interface Mixins {
  toolbar: Toolbar
}

export interface Toolbar {
  minHeight: number
  '@media (min-width:0px) and (orientation: landscape)': MediaMinWidth
  '@media (min-width:600px)': MediaMinWidth
}

export interface MediaMinWidth {
  minHeight: number
}

export interface Overrides {
  MuiSvgIcon: MuiInputClass
  MuiInput: MuiInputClass
  MuiInputLabel: MuiInputLabel
  MuiOutlinedInput: MuiOutlinedInput
  MuiMenuItem: MuiMenuItem
  MuiTooltip: MuiTooltip
  MuiToolbar: MuiToolbar
  MuiButton: MuiButton
  MuiTableCell: MuiDialogActionsClass
  MuiDialogActions: MuiDialogActionsClass
  MuiListItem: MuiListItem
  MuiListItemIcon: MuiListItemIcon
  MuiListItemText: MuiListItemText
}

export interface MuiButton {
  contained: Contained
}

export interface Contained {
  boxShadow: string
}

export interface MuiDialogActionsClass {
  root: InputClass
}

export interface InputClass {
  padding: string
}

export interface MuiInputClass {
  root: MuiInputRoot
}

export interface MuiInputRoot {
  fontSize: string
}

export interface MuiInputLabel {
  root: MuiInputLabelRoot
  outlined: Outlined
  shrink: Shrink
}

export interface Outlined {
  transform: string
}

export interface MuiInputLabelRoot {
  color: string
}

export interface Shrink {
  fontSize: string
  color: string
}

export interface MuiListItem {
  dense: RootClass
}

export interface RootClass {
  paddingTop: number
  paddingBottom: number
}

export interface MuiListItemIcon {
  root: MuiListItemIconRoot
}

export interface MuiListItemIconRoot {
  minWidth: number
}

export interface MuiListItemText {
  root: RootClass
}

export interface MuiMenuItem {
  root: MuiMenuItemRoot
}

export interface MuiMenuItemRoot {
  fontSize: string
  minHeight: string
}

export interface MuiOutlinedInput {
  root: PurpleRoot
  input: InputClass
}

export interface PurpleRoot {
  fontSize: string
  minWidth: string
}

export interface MuiToolbar {
  dense: MuiToolbarDense
}

export interface MuiToolbarDense {
  height: number
}

export interface MuiTooltip {
  tooltip: Tooltip
}

export interface Tooltip {
  fontSize: number
  padding: string
}
export interface Components {
  header: Header
  sidebar: Sidebar
  dashboardCard: DashboardCard
  card: Card
  wizard: Wizard
  code: Code
  warning: DefaultColorSwatch
  success: DefaultColorSwatch
  error: DefaultColorSwatch
  upgrade: Upgrade
}
export interface Palette {
  common: Common
  type: string
  primary: { [key: string]: string }
  secondary: { [key: string]: string }
  grey: { [key: string]: string }
  blue: { [key: string]: string }
  pink: { [key: string]: string }
  yellow: { [key: string]: string }
  k8sBlue: { [key: string]: string }
  osRed: { [key: string]: string }
  green: { [key: string]: string }
  red: { [key: string]: string }
  orange: { [key: string]: string }
  aws: { [key: string]: string }
  azure: { [key: string]: string }
}

export interface Upgrade {
  main: string
}

export interface Action {
  active: string
  hover: string
  hoverOpacity: number
  selected: string
  disabled: string
  disabledBackground: string
}

export interface Background {
  paper: string
  default: string
  dashboard?: string
}

export interface Card {
  background: string
  status: string
}

export interface Code {
  background: string
  text: string
}

export interface Common {
  black: string
  white: string
}

export interface DashboardCard {
  background: string
  primary: string
  text: string
  icon: string
  button: string
  divider: string
}

export interface DefaultColorSwatch {
  light?: string
  main: string
  dark?: string
  contrastText?: string
}

export interface Header {
  background: string
}

export interface Sidebar {
  [AppPlugins.Kubernetes]: SidebarStyles
  [AppPlugins.OpenStack]: SidebarStyles
  [AppPlugins.MyAccount]: SidebarStyles
  [AppPlugins.BareMetal]: SidebarStyles
}

export interface SidebarStyles {
  background: string
  text: string
  activeText: string
  hoverText: string
}

export interface Text {
  primary: string
  secondary: string
  disabled: string
  hint: string
}

export interface Wizard {
  dark: string
  light: string
  medium: string
}

export interface Shape {
  borderRadius: number
}

export interface Transitions {
  easing: Easing
  duration: Duration
}

export interface Duration {
  shortest: number
  shorter: number
  short: number
  standard: number
  complex: number
  enteringScreen: number
  leavingScreen: number
}

export interface Easing {
  easeInOut: string
  easeOut: string
  easeIn: string
  sharp: string
}

export interface Typography {
  fontFamily: string
  fontSize: number
  fontWeightLight: number
  fontWeightRegular: number
  fontWeightMedium: number
  h1: ITypography
  h2: ITypography
  h3: ITypography
  subtitle1: ITypography
  inputPlaceholder: ITypography
  subtitle2: ITypography
  nav: ITypography
  buttonPrimary: ITypography
  body1: ITypography
  h4: ITypography
  caption1: ITypography
  buttonSecondary: ITypography
  inputTable: ITypography
  body2: ITypography
  sidenav: ITypography
  inputLabel: ITypography
  caption2: ITypography
  caption4: ITypography
  caption3: ITypography
}

export interface Body1 {
  color: string
  fontFamily: string
  fontWeight: number
  fontSize: string
  lineHeight: number
  letterSpacing: string
  textTransform?: string
}

export interface Display1 {
  fontSize: string
  fontWeight: number
  fontFamily: string
  lineHeight: string
  color: string
  marginLeft?: string
  letterSpacing?: string
}

export interface ZIndex {
  mobileStepper: number
  appBar: number
  drawer: number
  modal: number
  snackbar: number
  tooltip: number
}

export interface PieChart {
  success: string
  warning: string
  error: string
  unknown: string
  empty: string
}

type Theme = DefaultTheme & AppTheme
// type RelianceTheme = RelianceLight & DefaultTheme
export default Theme
// export default RelianceTheme

// Generated by https://quicktype.io

export interface RelianceLight {
  breakpoints: any
  direction: string
  mixins: Mixins
  overrides: Overrides
  palette: ReliencePalette
  typography: RelienceTypography
  shape: Shape
  spacing: number
  transitions: Transitions
  zIndex: ZIndex
}

export interface ReliencePalette {
  grey: { [key: string]: string }
  black: Black
  blue: { [key: string]: string }
  pink: { [key: string]: string }
  yellow: { [key: string]: string }
  k8sBlue: { [key: string]: string }
  osRed: { [key: string]: string }
  green: { [key: string]: string }
  red: { [key: string]: string }
  common: Common
  primary: { [key: string]: string }
  secondary: { [key: string]: string }
  type: string
}

export interface Black {
  main: string
}

export interface RelienceTypography {
  fontFamily: string
  fontSize: number
  fontWeightLight: number
  fontWeightRegular: number
  fontWeightMedium: number
  Heading1: ITypography
  Heading2: ITypography
  Heading3: ITypography
  Sub1: ITypography
  InputPlaceholder: ITypography
  Sub2: ITypography
  Nav: ITypography
  ButtonPrimary: ITypography
  Body1: ITypography
  Heading4: ITypography
  Caption1: ITypography
  ButtonSecondary: ITypography
  InputTable: ITypography
  Body2: ITypography
  Sidenav: ITypography
  InputLabel: ITypography
  Caption2: ITypography
  Caption4: ITypography
  Caption3: ITypography
}

export interface ITypography {
  fontFamily: string
  fontSize: string
  fontWeight: any
  fontStretch: string
  fontStyle: string
  lineHeight: string
  letterSpacing: string
  textAlign?: any
}

export enum FontFamily {
  Eina04 = 'Eina04',
}

export enum FontSt {
  Normal = 'normal',
}
