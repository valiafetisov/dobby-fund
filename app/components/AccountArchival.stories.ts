import MyAccountArchival from './AccountArchival.vue'
import { NCollapse } from 'naive-ui'

export default {
  title: '/MyAccountArchival',
  component: MyAccountArchival,
  argTypes: {
    generated: { action: 'generated' },
    updateConfirmed: { action: 'updateConfirmed' },
  },
}

export const Default = {
  render: () => ({
    components: { MyAccountArchival, NCollapse },
    template: '<n-collapse display-directive="show" ><MyAccountArchival /></n-collapse>',
  }),
}
