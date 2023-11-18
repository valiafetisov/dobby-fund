import MyAccountArchival from './AccountArchival.vue'
import { NCollapse } from 'naive-ui'
import { action } from '@storybook/addon-actions'

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
    methods: { generated: action('generated'), updateConfirmed: action('updateConfirmed') },
    template: `<n-collapse display-directive="show" ><MyAccountArchival @generated="generated" @updateConfirmed="updateConfirmed" /></n-collapse>`,
  }),
}
