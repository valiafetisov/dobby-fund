import MyAccountPresentation from './AccountPresentation.vue'
import { NCollapse } from 'naive-ui'

export default {
  title: '/MyAccountPresentation',
  component: MyAccountPresentation,
}

export const Default = () => ({
  title: '/MyAccountPresentation',
  render: () => ({
    components: { MyAccountPresentation, NCollapse },
    template: '<n-collapse display-directive="show"><MyAccountPresentation /></n-collapse>',
  }),
})
