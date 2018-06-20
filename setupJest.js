import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
configure({ adapter: new Adapter() })
require('jest-enzyme')
// global.fetch = require('jest-fetch-mock')
